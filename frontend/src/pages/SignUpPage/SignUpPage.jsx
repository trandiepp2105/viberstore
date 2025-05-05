import React, { useState, useContext } from "react";
import "./SignUpPage.scss";
import { Link } from "react-router-dom";
import InputGroup from "../../components/InputGroup/InputGroup";
import AccountButton from "../../components/AccountButton/AccountButton";
import userService from "../../services/userService";
import { useNavigate } from "react-router-dom";
import AlertPopup from "../../components/AlertPopup/AlertPopup";
import addTemporaryComponent from "../../utils/renderAlertPopup";
import { AppContext } from "../../App";
// toastify
import { toast } from "react-toastify";
const SignUpPage = () => {
  const navigate = useNavigate();
  const { onLoading, setOnLoading } = useContext(AppContext);
  const [step, setStep] = useState(1);
  const [otpTitle, setOtpTitle] = useState(
    "Please check your email and enter the 6-degit OTP code below"
  );
  const initialSignUpData = {
    name: {
      value: "",
      error: "",
      displayError: false,
    },
    email: {
      value: "",
      error: "",
      displayError: false,
    },
    password: {
      value: "",
      error: "",
      displayError: false,
    },
    repeatPassword: {
      value: "",
      error: "",
      displayError: false,
    },
    phone: {
      value: "",
      error: "",
      displayError: false,
    },
  };
  const [signUpData, setSignUpData] = useState(initialSignUpData);
  const [otp, setOtp] = useState(new Array(6).fill(null));
  const inputRefs = React.useRef([]);

  const backToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  const handleRegister = async (event) => {
    event.preventDefault();
    if (!signUpData.name.value) {
      setSignUpData({
        ...signUpData,
        name: {
          ...signUpData.name,
          error: "Name is required",
          displayError: true,
        },
      });
      return;
    }
    if (!signUpData.email.value) {
      setSignUpData({
        ...signUpData,
        email: {
          ...signUpData.email,
          error: "Email is required",
          displayError: true,
        },
      });
      return;
    }
    if (!signUpData.password.value) {
      setSignUpData({
        ...signUpData,
        password: {
          ...signUpData.password,
          error: "Password is required",
          displayError: true,
        },
      });
      return;
    }
    if (!signUpData.repeatPassword.value) {
      setSignUpData({
        ...signUpData,
        repeatPassword: {
          ...signUpData.repeatPassword,
          error: "Repeat password is required",
          displayError: true,
        },
      });
      return;
    }
    if (!signUpData.phone.value) {
      setSignUpData({
        ...signUpData,
        phone: {
          ...signUpData.phone,
          error: "Phone number is required",
          displayError: true,
        },
      });
      return;
    }
    if (signUpData.password.value !== signUpData.repeatPassword.value) {
      setSignUpData({
        ...signUpData,
        repeatPassword: {
          ...signUpData.repeatPassword,
          error: "Password does not match",
          displayError: true,
        },
      });
      return;
    }

    setOnLoading(true);
    try {
      const response = await userService.register({
        name: signUpData.name.value,
        email: signUpData.email.value,
        password: signUpData.password.value,
        phone_number: signUpData.phone.value,
      });
      toast.success("Register successfully");

      if (response.status === 201) {
        setOtpTitle(
          "Please check your email and enter the 6-degit OTP code below"
        );
        addTemporaryComponent(
          <AlertPopup
            status="Success"
            description="Register successfully. Please verify your email"
          />,
          2000
        );
      } else if (response.status === 200) {
        setOtpTitle("Yout email has been registered. Please verify your email");
        addTemporaryComponent(
          <AlertPopup
            status="Success"
            description="Email already exists. Please verify your email"
          />,
          2000
        );
      }
      setStep(2);
    } catch (error) {
      console.error("Error while registering", error);
      toast.error("Error while registering");
    } finally {
      setOnLoading(false);
    }
    console.log(signUpData);
  };

  const handleVeriyOTP = async (event) => {
    event.preventDefault();
    try {
      await userService.verifyEmail(signUpData.email.value, otp.join(""));
      addTemporaryComponent(
        <AlertPopup
          status="success"
          description="Email verified successfully"
        />,
        1000
      );
      navigate("/login");
    } catch (error) {
      console.error("Error while verifying OTP", error);
      addTemporaryComponent(
        <AlertPopup
          status="Error"
          description="OTP is incorrect. Please try again."
        />,
        2000
      );
    } finally {
      setOnLoading(false);
    }
  };

  return (
    <div className="page sign-up-page">
      {/* <img src="/assets/images/orange-bg.png" alt="" className="overlay" /> */}
      {step === 1 && (
        <div className="sign-up-layout">
          <div className="sign-up-image">
            <img src="/assets/images/signup-bg.jpg" alt="" />
          </div>
          <form className="sign-up-form">
            <p className="sign-up-title">Create an account</p>
            <p className="login-link">
              Already have an account?
              <Link to="/login" className="sign-up-link">
                Log in
              </Link>
            </p>
            <InputGroup
              id="name"
              type="text"
              value={signUpData.name.value}
              onchange={(value) =>
                setSignUpData({
                  ...signUpData,
                  name: { value, error: "", displayError: false },
                })
              }
              placeholder="Enter your name"
              label="Name"
              errorText={signUpData.name.error}
              errorDisplay={signUpData.name.displayError}
            />
            <InputGroup
              id="email"
              type="email"
              value={signUpData.email.value}
              onchange={(value) =>
                setSignUpData({
                  ...signUpData,
                  email: { value, error: "", displayError: false },
                })
              }
              placeholder="example@gmail.com"
              label="Email"
              errorText={signUpData.email.error}
              errorDisplay={signUpData.email.displayError}
            />
            <InputGroup
              id="phone"
              type="text"
              value={signUpData.phone.value}
              onchange={(value) =>
                setSignUpData({
                  ...signUpData,
                  phone: { value, error: "", displayError: false },
                })
              }
              placeholder="Enter your phone number"
              label="Phone Number"
              errorText={signUpData.phone.error}
              errorDisplay={signUpData.phone.displayError}
            />
            <InputGroup
              id="password"
              type="password"
              value={signUpData.password.value}
              onchange={(value) =>
                setSignUpData({
                  ...signUpData,
                  password: { value, error: "", displayError: false },
                })
              }
              placeholder="Enter your password"
              label="Password"
              errorText={signUpData.password.error}
              errorDisplay={signUpData.password.displayError}
            />
            <InputGroup
              id="repeat-password"
              type="password"
              value={signUpData.repeatPassword.value}
              onchange={(value) =>
                setSignUpData({
                  ...signUpData,
                  repeatPassword: { value, error: "", displayError: false },
                })
              }
              placeholder="Repeat your password"
              label="Confirm password"
              errorText={signUpData.repeatPassword.error}
              errorDisplay={signUpData.repeatPassword.displayError}
            />
            <div className="wrapper-term">
              <input type="checkbox" id="term" className="term-checkbox" />
              <label htmlFor="term" className="label-term">
                I agree to the
                <Link to="/terms" className="sign-up-link">
                  Terms and conditions
                </Link>
              </label>
            </div>
            <AccountButton
              className="sign-up-button"
              type="submit"
              handleClick={handleRegister}
            >
              Create an account
            </AccountButton>
            <div className="wrapper-login-method-label">
              <span className="divider"></span>
              <p className="login-method-label">Or register with</p>
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
      )}
      {step === 2 && (
        <form className="recover-password-form" onSubmit={handleVeriyOTP}>
          <button type="button" class="arrow-left" onClick={backToPreviousStep}>
            <svg
              width="35px"
              height="35px"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g id="SVGRepo_bgCarrier" stroke-width="0" />

              <g
                id="SVGRepo_tracerCarrier"
                stroke-linecap="round"
                stroke-linejoin="round"
              />

              <g id="SVGRepo_iconCarrier">
                {" "}
                <path
                  d="M5 12H19M5 12L11 6M5 12L11 18"
                  stroke="#ff6868"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />{" "}
              </g>
            </svg>
          </button>
          <p className="recover-password-title form-title">OTP</p>
          <p className="recover-password-description form-description">
            {otpTitle}
          </p>
          <div className="wrapper-otp-entry">
            <p className="otp-title">OTP</p>
            <div className="list-otp-entry">
              {otp.map((value, index) => {
                return (
                  <input
                    type="number"
                    className="otp-entry"
                    maxLength="1" // Chỉ nhập 1 ký tự
                    key={index}
                    ref={(el) => (inputRefs.current[index] = el)}
                    value={value}
                    onChange={(e) => {
                      const inputVal = e.target.value;
                      if (!/^\d*$/.test(inputVal)) return; // Chỉ cho phép nhập số

                      const updatedOtp = [...otp];
                      updatedOtp[index] = inputVal.slice(-1); // Chỉ lấy ký tự cuối
                      setOtp(updatedOtp);

                      // Tự động chuyển focus sang ô tiếp theo nếu có giá trị
                      if (inputVal && index < otp.length - 1) {
                        inputRefs.current[index + 1].focus();
                      }
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Backspace") {
                        const updatedOtp = [...otp];

                        // Nếu ô hiện tại có giá trị, xóa nó
                        if (updatedOtp[index]) {
                          updatedOtp[index] = "";
                          setOtp(updatedOtp);
                        } else if (index > 0) {
                          // Nếu ô hiện tại rỗng, chuyển focus về ô trước đó
                          inputRefs.current[index - 1].focus();
                        }
                      }
                    }}
                  />
                );
              })}
            </div>
            <div className="resend-otp">
              Have you received the code yet?{" "}
              <Link className="text-link">Resend (30s)</Link>
            </div>
          </div>
          <AccountButton type="submit" className="recover-password-button">
            Authenticate
          </AccountButton>
          <Link to={"/login"} className="go-back-link back-text-link">
            Back to login
          </Link>{" "}
        </form>
      )}
    </div>
  );
};

export default SignUpPage;
