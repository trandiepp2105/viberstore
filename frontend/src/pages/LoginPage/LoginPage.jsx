import React, { useState, useContext } from "react";
import "./LoginPage.scss";
import InputGroup from "../../components/InputGroup/InputGroup";
import { Link } from "react-router-dom";
import AccountButton from "../../components/AccountButton/AccountButton";
import userService from "../../services/userService";
import Cookies from "js-cookie";
import WaitingOverlay from "../../components/WaitingOverlay/WaitingOverlay";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../../App";
const LoginPage = () => {
  const { setIsUserLogin } = useContext(AppContext);
  const navigate = useNavigate();

  const initialLoginDataa = { email: "", password: "" };
  const [loginData, setLoginData] = useState(initialLoginDataa);
  const initialError = {
    email: {
      errorText: "Please enter a valid email",
      errorDisplay: false,
    },
    password: {
      errorText: "Please enter a valid password",
      errorDisplay: false,
    },
  };
  const [error, setError] = useState(initialError);
  const [loading, setLoading] = useState(false);
  const handleLogin = async (event) => {
    event.preventDefault();
    setError(initialError);
    if (!loginData.email) {
      setError({
        ...error,
        email: {
          errorText: "Email field cannot be empty. Please fill it in.",
          errorDisplay: true,
        },
      });
      return;
    }
    if (!loginData.password) {
      setError({
        ...error,
        password: {
          errorText: "Password field cannot be empty. Please fill it in.",
          errorDisplay: true,
        },
      });
      return;
    }
    setLoading(true);
    try {
      await userService.login(loginData);
      navigate("/");
      setIsUserLogin(true);
      // console.log("Login successfully", response);
      // console.log("access: ", Cookies.get("refresh_token"));
    } catch (error) {
      console.error("Error while logging in", error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div
      className="page login-page"
      // style={{
      //   backgroundImage: `url('/assets/images/login-bg.jpg')`,
      //   backgroundSize: "cover",
      //   backgroundPosition: "center",
      //   backgroundRepeat: "no-repeat",
      // }}
    >
      {loading && <WaitingOverlay />}
      <div className="login-layout">
        <form className="login-form">
          <p className="login-title form-title">Login Your Account</p>
          <p className="login-description">Enter your information below</p>
          <InputGroup
            id="email"
            type="email"
            value={loginData.email}
            onchange={(value) => setLoginData({ ...loginData, email: value })}
            placeholder="example@gmail.com"
            label="Email"
            className={"custom-input"}
            errorText={error.email.errorText}
            errorDisplay={error.email.errorDisplay}
          />
          <InputGroup
            id="password"
            type="password"
            value={loginData.password}
            onchange={(value) =>
              setLoginData({ ...loginData, password: value })
            }
            placeholder="Enter your password"
            label="Password"
            className={"custom-input"}
            errorText={error.password.errorText}
            errorDisplay={error.password.errorDisplay}
          />
          <Link
            to={"/recover-password"}
            className={`forget-password-link text-link`}
          >
            Forget Password
          </Link>
          <div className="wrapper-remember-password">
            <input
              type="checkbox"
              id="remember-password"
              className="remember-password-checkbox"
            />
            <label
              htmlFor="remember-password"
              className="label-remember-password"
            >
              Remember Password
            </label>
          </div>

          <AccountButton
            type="submit"
            className="login-button"
            handleClick={handleLogin}
          >
            Login
          </AccountButton>
          <p className="wrapper-sign-up-link">
            No register yet?
            <Link to="/signup" className="sign-up-link text-link">
              Create an account
            </Link>
          </p>
          <div className="wrapper-login-method-label">
            <span className="divider"></span>
            <p className="login-method-label">Or login with</p>
            <span className="divider"></span>
          </div>
          <div className="wrapper-list-login-method">
            <button className="login-method">
              <img
                src={`/assets/images/gg-logo.png`}
                alt="gg-logo"
                className="login-method-logo"
              />
              <span className="login-method-text">Google</span>
            </button>

            <button className="login-method">
              <img
                src={`/assets/images/apple-logo.png`}
                alt="apple-logo"
                className="login-method-logo"
              />
              <span className="login-method-text">Apple</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
