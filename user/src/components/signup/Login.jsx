import axios from "axios";
import { useEffect, useState } from "react";
import { Dialog } from "@mui/material";

function Login({ open, handleClose, handleRegister }) {

  const localcheck = localStorage.getItem("uid");
  useEffect(() => {
    if (localcheck) {
      handleClose();
    }
  }, [localcheck, handleClose]);

  const [logindata, setData] = useState({
    email: "",
    password: "",
  });
  const [wrongpassword, setWrongPassword] = useState("");
  const [redirecttosignup, setRedirecttosignup] = useState("");
  const [formError, setFormError] = useState("");
  function handlechange(event) {
    setData({
      ...logindata,
      [event.target.name]: event.target.value,
    });
  }

  function loggerin() {
    setFormError("");
    for (const key in logindata) {
      if (logindata[key] === "") {
        setFormError("Please fill out all fields.");
        return;
      }
    }
    axios
      .post("http://localhost:9000/login", logindata, {
        headers: {
          "Content-Type": "application/json",
        },
      })
      .then((response) => {
        try {
          const result = response.data;
          if (result.error) {
            setFormError(result.error);
          }
          else{
            localStorage.setItem("uid", result.uid);
            localStorage.setItem("token", result.token);
            window.location.reload();
            handleClose();
          }
        } catch (error) {
          console.error("Error parsing JSON:", error);
        }
      })
      .catch((error) => {
        console.error("Error making the request:", error);
      });
  }

  function handlesubmit(event) {
    event.preventDefault();
    setRedirecttosignup("");
    setWrongPassword("");
    // console.log(logindata);
    if (localStorage.getItem("uid") !== null){
      handleClose();
    } else {
      loggerin();
    }
  }

  return (
    <Dialog open={open}>
      <div className="flex justify-center items-center">
        <form
          className="bg-white px-6 py-8 rounded shadow-md text-black w-96"
          onSubmit={handlesubmit}
        >
          <h1 className="mb-8 text-3xl text-center">Log In</h1>
          <button className="absolute top-2 right-2 " onClick={handleClose}>
            ❌
          </button>
          <input
            type="email"
            className="block border border-grey-light w-full p-3 rounded mb-4 hover:shadow-lg font-medium transition transform hover:-translate-y-0.5"
            name="email"
            placeholder="email"
            onChange={handlechange}
            value={logindata.email}
            required
          />

          <input
            type="password"
            className="block border border-grey-light w-full p-3 rounded mb-4 hover:shadow-lg font-medium transition transform hover:-translate-y-0.5"
            name="password"
            placeholder="Password"
            onChange={handlechange}
            value={logindata.password}
            required
          />
          {wrongpassword && (
            <p className="text-red-700 text-sm w-full mx-auto">
              {wrongpassword}
            </p>
          )}
          {redirecttosignup && (
            <p className="text-red-700 text-sm w-full mx-auto">
              {redirecttosignup}
            </p>
          )}
          {formError && (
            <p className="text-red-700 text-sm w-full mx-auto">{formError}</p>
          )}
          <button
            onClick={handlesubmit}
            type="submit"
            className="w-full text-center py-3 rounded  bg-red-500 text-white hover:bg-red-600 focus:outline-none my-1 hover:shadow-lg font-medium transition transform hover:-translate-y-0.5"
          >
            Log In
          </button>
          {/* </div> */}
          <div className="text-grey-dark mt-6">
            <p>
              Create account{" "}
              <button className="text-blue-600" onClick={handleRegister}>
                here.
              </button>
            </p>
          </div>
        </form>
      </div>
    </Dialog>
  );
}

export default Login;
