import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { BsPersonCircle } from "react-icons/bs";
import Login from "../signup/Login";
import Register from "../signup/Register";

function NavBar() {
  const navigate = useNavigate();
  const [logIn, setLogIn] = useState(false);
  const [register, setRegister] = useState(false);
  const [loginstatus, setLogInstatus] = useState(false);

  const uid = localStorage.getItem("uid");
  useEffect(() => {
    if (uid) {
      setLogInstatus(true);
    }
  }, [uid]);

  const handleLoginComponent = () => {
    setRegister(false);
    setLogIn(true);
  };
  const handleClose = () => {
    setLogIn(false);
    setRegister(false);
  };

  const handleProfile = () => {
    navigate("/profile");
  };

  const handleregister = () => {
    setLogIn(false);
    setRegister(true);
  };

  return (
    <div className=" bg-gray-800 p-2 ">
      <div className="container mx-auto flex justify-around items-center">
        <NavLink className="text-2xl font-semibold text-red-500 " to="/">InstaStyle</NavLink>
        <div>
          {loginstatus ? (
            <div className="flex items-center gap-4">
              <NavLink to="/post" className="text-red-500">Post</NavLink>
              {loginstatus ? (
                <button className="hidden text-red-500 md:block" onClick={handleProfile}>
                <BsPersonCircle />
                </button>
            ) : null}
            </div>
          ) : (
            <button className="text-red-500" onClick={handleLoginComponent}>
              Login/Signup
            </button>
          )}
        </div>
      </div>
      {logIn ? (
        <Login
          open={logIn}
          handleClose={handleClose}
          handleRegister={handleregister}
        />
      ) : null}
      {register ? (
        <Register
          open={register}
          handleClose={handleClose}
          handleLoginComponent={handleLoginComponent}
        />
      ) : null}
    </div>
  );
}

export default NavBar;
