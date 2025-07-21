import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axios from "axios";
import Footer from "../components/Footer";
import APP_CONSTANTS from "../appConstants";
import ForgotPasswordModal from '../components/ForgotPasswordModal'

function EmpShow() {
  const [tryingLogin, setTryingLogin] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMessage, setErrMessage] = useState("");

  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleForgotPassword = (e) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const handleLogin = () => {
    Swal.showLoading();
    setTryingLogin(true);
    const config = {
      headers: {
        "Content-Type": "application/json",
      },
    };
    const data = {
      email: email,
      password: password,
    };
    axios
      .post("/users/sign-in/", data, config)
      .then(function (response) {
        localStorage.setItem("jwt-access-token", response.data?.token);
        localStorage.setItem("user_role", response.data?.user?.role);
        localStorage.setItem("user", JSON.stringify(response.data?.user));

        Swal.fire({
          icon: "success",
          title: `Welcome ${response.data?.user?.first_name}! Logged in as ${response.data?.user?.role}`,
          showConfirmButton: false,
          timer: 2500,
        });
        const waitforJWT = setInterval(() => { //add a timeout to ensure jwt is set before navigation
          if (localStorage.getItem("jwt-access-token")){
            setTryingLogin(false);
            setPassword("");
            setEmail("");
            setErrMessage("");
            if (response.data?.user?.needsPasswordReset) {
              navigate("/resetPassword", {state:{user: response.data?.user}});
            } else {
              if (response.data?.user?.role === APP_CONSTANTS.USER_ROLES.EMPLOYEE) {
                navigate("/timesheet");
              } else {
                navigate("/home");
              }
            }
            clearInterval(waitforJWT);
            window.location.reload(true);
            Swal.hideLoading();
          }
        }, 1000);
      })
      .catch(function (error) {
        const errMsg = error?.response?.data?.message;
        localStorage.removeItem("user");
        localStorage.removeItem("user_role");
        setErrMessage(errMsg);
        Swal.fire({
          icon: "error",
          title: errMsg,
          showConfirmButton: false,
          timer: 2000,
        });
        setTryingLogin(false);
      });
  };

  return (
    <>
    <div className="login_div">
    <div className="container w-auto login_logo">
          <img src='images/Logo.png' alt="My Image" />
        </div>
      <div className="login_form_container">
        
        <div className="container">
          <div className="">
            <div className="rounded d-flex justify-content-center">
              <div className="col-lg-6 col-md-8 col-sm-12 form-bg-radius">
                <div className="text-center">
                  <h4 className="login_header">Log in to HighspringFlex</h4>
                </div>
                <form className="col-lg-12 col-md-12 col-sm-12 d-flex justify-content-center login_form">
                  {(errMessage)? <p className="text-danger ms-5"> {errMessage}</p> : ""}
                  <div className="col-lg-8 col-md-8 col-sm-12 p-4 text-center">
                    <div className="input-group mb-3">
                      <span className="input-group-text"><i className="bi bi-person-fill text-gray"></i></span>
                      <input
                        placeholder="Username or Email"
                        onChange={(event) => {
                          setEmail(event.target.value);
                        }}
                        value={email}
                        type="text"
                        className="form-control"
                        id="email"
                        name="email"
                      />
                    </div>
                    <div className="input-group mb-3">
                      <span className="input-group-text"><i className="bi bi-lock-fill text-gray"></i></span>
                      <input 
                        placeholder="password" 
                        onChange={(event) => {
                          setPassword(event.target.value);
                        }}
                        value={password}
                        type="password"
                        className="form-control"
                        id="password"
                        name="password"
                      />
                    </div>
                    <div className="input-group mb-3">
                      <button className="btn btn-primary text-center mt-2 p-2 login_button" 
                        disabled={tryingLogin}
                        onClick={handleLogin}
                        type="submit"
                      >
                        Continue
                      </button>
                    </div>
                    <div className="login-divider">
                      <div className="login-divider-line"></div>
                      <span className="login-divider-text">Don't Have Highspring Account</span>
                      <div className="login-divider-line"></div>
                    </div>
                    <div className="input-group mb-3">
                      <button className="btn btn-primary text-center mt-2 p-2 signup_button" type="submit">
                        Sign Up
                      </button>
                    </div>
                  </div>    
                </form>
                <div className="text-center poweredby_logo">
                  Powered by <img src='images/VacoBinary_Logo.png' alt="My Image" />
                </div>
              </div>
            </div>
          </div>
          <ForgotPasswordModal 
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
          />
        </div>
      </div>
      <div className="login_footer">
        <Footer />
      </div>
    </div>
    </>
  );
}

export default EmpShow;
