import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Dialog } from "@mui/material";

function Register({ open, handleClose, handleLoginComponent }) {
  const navigate = useNavigate();
  const [passwordError, setPasswordError] = useState("");
  const [redirecttologin, setRedirecttologin] = useState("");
  const [formError, setFormError] = useState("");
  const localcheck = localStorage.getItem("uid");
  useEffect(() => {
    if (localcheck) {
      navigate("/");
    }
  }, [localcheck, navigate]);

  // Calculate the date 14 years ago from today

  const [signupdata, setData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  function handlechange(event) {
    setData({
      ...signupdata,
      [event.target.name]: event.target.value,
    });
  }

  const handlesubmit = async (event) => {
    event.preventDefault();
    // console.log("signup data " + JSON.stringify(signupdata));
    setPasswordError(" ");
    setRedirecttologin(" ");
    setFormError("");

    for (const key in signupdata) {
      if (signupdata[key] === "") {
        setFormError("Please fill out all fields.");
        return;
      }
    }

    if (signupdata.password === signupdata.confirm_password) {
      axios
        .post("http://localhost:9000/signup", signupdata, {
          headers: {
            "Content-Type": "application/json",
          },
        })
        .then((response) => {
          try {
            const result = response.data;
            const neednavigate = result.message;
            if (neednavigate === "Please Use Different Credentials") {
              // console.log(result);
              setFormError("Please Use Different Credentials");
            } else if (neednavigate === "User Already Exist") {
              setRedirecttologin("Already Signup, Please Login!");
            } else {
              console.log("registration successfull");
              handleLoginComponent();
            }
          } catch (error) {
            console.error("Error parsing JSON:", error);
          }
        })
        .catch((error) => {
          console.error("Error making the request:", error);
        });
    } else {
      setPasswordError("Password and Confirm Password do not match");
      return;
    }
  };

  return (
    <Dialog open={open}>
      <div className="flex justify-center items-center">
        <form
          className="bg-white px-6 py-8 rounded shadow-md text-black w-96"
          onSubmit={handlesubmit}
        >
          {/* <div class="bg-white px-6 py-8 rounded shadow-md text-black w-full"> */}
          <h1 className="mb-8 text-3xl text-center">Sign up</h1>
          <button className="absolute top-2 right-2" onClick={handleClose}>
            ❌
          </button>

          <input
            type="username"
            className="block border border-grey-light w-full p-3 rounded mb-4 hover:shadow-lg font-medium transition transform hover:-translate-y-0.5"
            name="username"
            placeholder="username"
            onChange={handlechange}
            value={signupdata.username}
            required
          />
          <input
            type="email"
            className="block border border-grey-light w-full p-3 rounded mb-4 hover:shadow-lg font-medium transition transform hover:-translate-y-0.5"
            name="email"
            placeholder="email"
            onChange={handlechange}
            value={signupdata.email}
            required
          />
          <div className="flex gap-4">
            <input
              type="password"
              className="block border border-grey-light w-full p-3 rounded mb-4 hover:shadow-lg font-medium transition transform hover:-translate-y-0.5"
              name="password"
              placeholder="Password"
              onChange={handlechange}
              value={signupdata.password}
              required
            />
            <input
              type="password"
              className="block border border-grey-light w-full p-3 rounded mb-4 hover:shadow-lg font-medium transition transform hover:-translate-y-0.5"
              name="confirm_password"
              placeholder="Confirm Password"
              onChange={handlechange}
              value={signupdata.confirm_password}
              required
            />
          </div>
          {passwordError && (
            <p className="text-red-700 text-sm w-full mx-auto">
              {passwordError}
            </p>
          )}
          {redirecttologin && (
            <p className="text-red-700 text-sm w-full mx-auto">
              {redirecttologin}
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
            Create Account
          </button>
          <div className="text-grey-dark mt-6">
            Already have an account?
            <button className="text-blue-600" onClick={handleLoginComponent}>
              Log in.
            </button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}

export default Register;
