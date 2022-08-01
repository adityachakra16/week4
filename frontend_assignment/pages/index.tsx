import detectEthereumProvider from "@metamask/detect-provider";
import { Strategy, ZkIdentity } from "@zk-kit/identity";
import { generateMerkleProof, Semaphore } from "@zk-kit/protocols";
import { providers, Contract } from "ethers";
import Head from "next/head";
import React, { useEffect } from "react";
import styles from "../styles/Home.module.css";
import * as yup from "yup";
import Greeter from "artifacts/contracts/Greeters.sol/Greeters.json";

export default function Home() {
  const [logs, setLogs] = React.useState("Connect your wallet and greet!");
  const [greetings, setGreetings] = React.useState("");

  async function greet() {
    setLogs("Creating your Semaphore identity...");

    const provider = (await detectEthereumProvider()) as any;

    await provider.request({ method: "eth_requestAccounts" });

    const ethersProvider = new providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const message = await signer.signMessage(
      "Sign this message to create your identity!"
    );

    const identity = new ZkIdentity(Strategy.MESSAGE, message);
    const identityCommitment = identity.genIdentityCommitment();
    const identityCommitments = await (
      await fetch("./identityCommitments.json")
    ).json();

    const merkleProof = generateMerkleProof(
      20,
      BigInt(0),
      identityCommitments,
      identityCommitment
    );

    setLogs("Creating your Semaphore proof...");

    const greeting = "Hello world";

    const witness = Semaphore.genWitness(
      identity.getTrapdoor(),
      identity.getNullifier(),
      merkleProof,
      merkleProof.root,
      greeting
    );

    const { proof, publicSignals } = await Semaphore.genProof(
      witness,
      "./semaphore.wasm",
      "./semaphore_final.zkey"
    );
    const solidityProof = Semaphore.packToSolidityProof(proof);
    const response = await fetch("/api/greet", {
      method: "POST",
      body: JSON.stringify({
        greeting,
        nullifierHash: publicSignals.nullifierHash,
        solidityProof: solidityProof,
      }),
    });

    if (response.status === 500) {
      const errorMessage = await response.text();

      setLogs(errorMessage);
    } else {
      setLogs("Your anonymous greeting is onchain :)");
    }
  }

  useEffect(() => {
    const provider = new providers.JsonRpcProvider("http://localhost:8545");

    const contract = new Contract(
      "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512",
      Greeter.abi,
      provider
    );
    contract.on("NewGreeting", (greeting: any) => {
      const newGreetingEvent = Buffer.from(greeting.split("0x")[1], "hex")
        .toString()
        .trim();
      setGreetings(newGreetingEvent);
    });
  }, [logs]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Greetings</title>
        <meta
          name="description"
          content="A simple Next.js/Hardhat privacy application with Semaphore."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Greetings</h1>

        <p className={styles.description}>
          A simple Next.js/Hardhat privacy application with Semaphore.
        </p>

        <div className={styles.logs}>{logs}</div>

        <div onClick={() => greet()} className={styles.button}>
          Greet
        </div>
        {greetings.length > 0 && (
          <div className="col-6 mb-4">
            <div className="input-group input-group-lg">
              <input
                type="text"
                className="form-control"
                aria-label="Sizing example input"
                aria-describedby="inputGroup-sizing-lg"
                value={greetings}
                readOnly
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
