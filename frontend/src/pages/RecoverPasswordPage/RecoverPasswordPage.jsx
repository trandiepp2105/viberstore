import React, { useState, useRef, useContext } from "react";
import "./RecoverPasswordPage.scss";
import InputGroup from "../../components/InputGroup/InputGroup";
import { Link } from "react-router-dom";
import AccountButton from "../../components/AccountButton/AccountButton";
import userService from "../../services/userService";
import { useNavigate } from "react-router-dom";
import AlertPopup from "../../components/AlertPopup/AlertPopup";
import addTemporaryComponent from "../../utils/renderAlertPopup";
import { AppContext } from "../../App";
const RecoverPasswordPage = () => {
  const navigate = useNavigate();
  const { onLoading, setOnLoading } = useContext(AppContext);
  const initialRecoverData = { email: "" };
  const [recoverData, setRecoverData] = useState(initialRecoverData);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(null));
  const inputRefs = useRef([]);
  const [step, setStep] = useState(1);
  const backToPreviousStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleRecoverPassword = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    setOnLoading(true);
    if (step === 1) {
      // Call API to send email
      try {
        await userService.sendResetPasswordEmail(recoverData.email);
        setStep(2);
      } catch (error) {
        console.error("Error while sending email", error);
      } finally {
        setOnLoading(false);
      }
    } else if (step === 2) {
      // Call API to verify OTP
      const otpCode = otp.join("");
      console.log("OTP code", otpCode);
      try {
        await userService.verifyResetPasswordOTP(recoverData.email, otpCode);
        setStep(3);
      } catch (error) {
        console.error("Error while verifying OTP", error);
      } finally {
        setOnLoading(false);
      }
    } else if (step === 3) {
      // Call API to change password
      try {
        await userService.changePassword(recoverData.email, newPassword);
        addTemporaryComponent(
          <AlertPopup description="Bạn đã đổi mật khẩu thành công. Vui lòng đăng nhập lại." />,
          1000
        );
        navigate("/login");
      } catch (error) {
        console.error("Error while changing password", error);
      } finally {
        setOnLoading(false);
      }
    }
  };
  return (
    <div className="recover-password-page">
      <div className="recover-password-layout">
        {step === 1 && (
          <form
            className="recover-password-form"
            onSubmit={handleRecoverPassword}
          >
            <button
              type="button"
              class="arrow-left"
              onClick={backToPreviousStep}
            >
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

            <p className="recover-password-title form-title">Forgot Password</p>
            <p className="recover-password-description form-description">
              Please enter your email to receive a confirmation code to reset a
              password
            </p>
            <InputGroup
              id="email"
              type="email"
              value={recoverData.email}
              onchange={(value) =>
                setRecoverData({ ...recoverData, email: value })
              }
              placeholder="example@gmail.com"
              label="Email"
              className={"custom-input"}
            />
            <Link className="recover-password-another-way text-link">
              Try another way
            </Link>
            <AccountButton type="submit" className="recover-password-button">
              Recover Password
            </AccountButton>
            <Link to={"/login"} className="go-back-link back-text-link">
              Back to login
            </Link>
          </form>
        )}
        {step === 2 && (
          <form
            className="recover-password-form"
            onSubmit={handleRecoverPassword}
          >
            <button
              type="button"
              class="arrow-left"
              onClick={backToPreviousStep}
            >
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
              Please check your email and enter the 6-degit OTP code below
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
        {step === 3 && (
          <form
            className="recover-password-form"
            onSubmit={handleRecoverPassword}
          >
            <button
              type="button"
              class="arrow-left"
              onClick={backToPreviousStep}
            >
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

            <p className="recover-password-title form-title">New Password</p>
            <p className="recover-password-description form-description">
              Please enter information below
            </p>
            <InputGroup
              id="password"
              type="password"
              value={newPassword}
              onchange={(value) => setNewPassword(value)}
              placeholder="Enter your new password"
              label="New Password"
              className={"custom-input"}
            />
            <InputGroup
              id="repeat-password"
              type="password"
              value={confirmPassword}
              onchange={(value) => setConfirmPassword(value)}
              placeholder="Repeat your password"
              label="Confirm Password"
              className={"custom-input"}
            />
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
            <AccountButton type="submit" className="recover-password-button">
              Change Password
            </AccountButton>
            <Link to={"/login"} className="go-back-link back-text-link">
              Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
};

export default RecoverPasswordPage;
