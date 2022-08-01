import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";

function Profile() {
  const validationSchema = Yup.object().shape({
    name: Yup.string().required("Name is required"),
    age: Yup.number()
      .typeError("Age must be a number")
      .positive("Age must be greater than zero")
      .required("Age is required"),
    address: Yup.string().required("Address is required"),
  });

  const formOptions = { resolver: yupResolver(validationSchema) };

  const { register, handleSubmit, reset, formState } = useForm(formOptions);
  const { errors } = formState;

  function onSubmit(data: any) {
    console.log(JSON.stringify(data, null, 4));
    return false;
  }

  return (
    <div className="container m-10">
      <div className="d-flex justify-content-center">
        <div className="card">
          <h2 className="card-header">Profile</h2>
          <div className="card-body">
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="form-row">
                <div className="form-group">
                  <label>First Name</label>
                  <input
                    type="text"
                    {...register("name")}
                    className={`form-control ${
                      errors.name ? "is-invalid" : ""
                    }`}
                  />
                  <div className="invalid-feedback">{errors.name?.message}</div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group col-lg-4 col-md-4 col-sm-12">
                  <label>Age</label>
                  <input
                    type="text"
                    {...register("age")}
                    className={`form-control ${errors.age ? "is-invalid" : ""}`}
                  />
                  <div className="invalid-feedback">{errors.age?.message}</div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Address</label>
                  <input
                    type="text"
                    {...register("address")}
                    className={`form-control ${
                      errors.address ? "is-invalid" : ""
                    }`}
                  />
                  <div className="invalid-feedback">
                    {errors.address?.message}
                  </div>
                </div>
              </div>

              <br />
              <div className="form-row d-flex justify-content-center">
                <button type="submit" className="btn btn-primary">
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
