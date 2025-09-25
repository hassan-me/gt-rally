import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { User, Mail, Lock, ChevronRight, Check } from "lucide-react";
import {
  useSignupMutation,
  useUpdateProfileMutation,
  useCreateUpdateGarageMutation,
} from "@/redux/slices/api.slice";
import { Modal } from "bootstrap";
import Toast from "../common/Toast";
import MyProfile from "../rally-dashboard/MyProfile";
import MyGarage from "../modals/MyGarage";
import { useNavigate } from "react-router-dom";

const signupSchema = yup.object().shape({
  firstName: yup.string().required("First name is required"),
  lastName: yup.string().required("Last name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password"), null], "Passwords must match")
    .required("Confirm password is required"),
});

export default function SignUp() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [currentStep, setCurrentStep] = useState(3); // 1 for signup, 2 for profile
  const navigate = useNavigate();

  const [signup, { isLoading: isSignupLoading }] = useSignupMutation();
  const [updateProfile] = useUpdateProfileMutation();
  const [createGarage] = useCreateUpdateGarageMutation();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
  });

  const displayToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);

    setTimeout(() => setShowToast(false), 5000);
  };

  const onSignupSubmit = async (data) => {
    try {
      const { confirmPassword, ...signupData } = data;

      await signup(signupData).unwrap();

      displayToast(
        "Account created successfully! Please complete your profile."
      );

      // Move to profile step
      setCurrentStep(2);
    } catch (error) {
      displayToast(
        error.data?.message || "Registration failed. Please try again.",
        "error"
      );
    }
  };

  const onProfileComplete = async (formData) => {
    try {
      const response = await updateProfile(formData).unwrap();

      displayToast(response?.message || "Profile updated successfully!");
      reset();
      setCurrentStep(3);
    } catch (err) {
      displayToast(
        err?.data?.message || "Profile update failed. Please try again.",
        "error"
      );
    }
  };

  const onGarageComplete = async (formData) => {
    try {
      const response = await createGarage(formData).unwrap();

      displayToast(response?.message || "Garage created successfully!");
      reset();
      Modal.getInstance(document.getElementById("popup_bid2"))?.hide();
      navigate("/dashboard");
    } catch (err) {
      displayToast(
        err?.data?.message || "Garage creation failed. Please try again.",
        "error"
      );
    }
  };

  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          onClose={() => setShowToast(false)}
        />
      )}
      <div
        className="modal fade popup login-form"
        id="popup_bid2"
        tabIndex={-1}
        role="dialog"
        style={{ paddingTop: "2%", paddingBottom: "2%" }}
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div
            className="modal-content"
            style={{ display: "flex", flexDirection: "column" }}
          >
            <button
              type="button"
              className="close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">×</span>
            </button>
            <div style={{ marginTop: "15px" }} className="stepper-container">
              <div className="stepper">
                {/* Step 1 */}
                <div className={`step ${currentStep >= 1 ? "active" : ""}`}>
                  <div className="step-icon"  style={{backgroundColor:"#FF7102",borderColor:"#FF7102"}}>
                    {currentStep > 1 ? <Check size={18} /> : "1"}
                  </div>
                  <div className="step-content">
                    <div className="step-title" style={{color:"#FF7102"}}>Account Details</div>
                    <div className="step-description">
                      Create your login credentials
                    </div>
                  </div>
                </div>

                <div className="step-connector">
                  <div
                    className={`connector-line ${
                      currentStep > 1 ? "completed" : ""
                    }`}
                    style={{backgroundColor:"#FF7102"}}
                  ></div>
                </div>

                {/* Step 2 */}
                <div className={`step ${currentStep >= 2 ? "active" : ""}`}>
                  <div className="step-icon" style={{backgroundColor:"#FF7102",borderColor:"#FF7102",color:"white"}} >
                    {currentStep > 2 ? <Check size={18} /> : "2"}
                  </div>
                  <div className="step-content">
                    <div className="step-title" style={{color:"#FF7102"}}>Personal Info</div>
                    <div className="step-description">
                      Complete your profile
                    </div>
                  </div>
                </div>

                <div className="step-connector" >
                  <div
                    className={`connector-line ${
                      currentStep > 2 ? "completed" : ""
                    }`}
                    style={{backgroundColor:"#FF7102"}}
                  ></div>
                </div>

                {/* Step 3 */}
                <div className={`step ${currentStep === 3 ? "active" : ""}`}>
                  <div className="step-icon" style={{backgroundColor:"#FF7102",borderColor:"#FF7102",color:"white"}}>3</div>
                  <div className="step-content">
                    <div className="step-title" style={{color:"#FF7102"}}>Add Garage</div>
                    <div className="step-description">
                      Enter your car details
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-body space-y-20 pd-40 style2">
              <div className="wrap-modal flex">
                {currentStep === 1 && (
                  <div className="images flex-none relative">
                    <img
                      alt="images"
                      src="/assets/images/section/register.jpg"
                      width={384}
                      height={854}
                    />
                  </div>
                )}

                <div className="content">
                  {currentStep === 1 ? (
                    <>
                      <h1 className="title-login">Create Your Account</h1>
                      <div className="comments">
                        <div className="respond-comment">
                          <form
                            onSubmit={handleSubmit(onSignupSubmit)}
                            className="comment-form form-submit"
                            acceptCharset="utf-8"
                          >
                            <div className="row">
                              {/* First name */}
                              <div className="col-12 col-lg-6 custom-mb">
                                <div
                                  className="input-icon-group"
                                  style={{ position: "relative" }}
                                >
                                  <label className="fw-6">First name</label>
                                  <input
                                    type="text"
                                    className="tb-my-input"
                                    placeholder="First name"
                                    {...register("firstName")}
                                    style={{ paddingLeft: "38px" }}
                                  />
                                  <div
                                    className="icon"
                                    style={{
                                      position: "absolute",
                                      left: "10px",
                                      top: "45px",
                                      pointerEvents: "none",
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={18}
                                      height={18}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="#B6B6B6"
                                      strokeWidth={1.5}
                                    >
                                      {" "}
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.25a7.25 7.25 0 1115 0v.25a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.25z"
                                      />{" "}
                                    </svg>
                                  </div>
                                  {errors.firstName && (
                                    <p className="label error text-sm mt-1">
                                      {errors.firstName.message}
                                    </p>
                                  )}
                                </div>
                              </div>

                              {/* Last name */}
                              <div className="col-12 col-lg-6">
                                <div
                                  className="input-icon-group"
                                  style={{ position: "relative" }}
                                >
                                  <label className="fw-6">Last name</label>
                                  <input
                                    type="text"
                                    className="tb-my-input"
                                    placeholder="Last name"
                                    {...register("lastName")}
                                    style={{ paddingLeft: "38px" }}
                                  />
                                  <div
                                    className="icon"
                                    style={{
                                      position: "absolute",
                                      left: "10px",
                                      top: "45px",
                                      pointerEvents: "none",
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      width={18}
                                      height={18}
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="#B6B6B6"
                                      strokeWidth={1.5}
                                    >
                                      {" "}
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15.75 7.5a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 19.25a7.25 7.25 0 1115 0v.25a.75.75 0 01-.75.75h-13.5a.75.75 0 01-.75-.75v-.25z"
                                      />{" "}
                                    </svg>
                                  </div>
                                  {errors.lastName && (
                                    <p className="label error text-sm mt-1">
                                      {errors.lastName.message}
                                    </p>
                                  )}
                                </div>
                              </div>
                            </div>

                            <fieldset
                              style={{ marginTop: "20px" }}
                              className="t"
                            >
                              <label className="fw-6">Email address</label>
                              <input
                                type="email"
                                className="tb-my-input"
                                placeholder="Email address"
                                {...register("email")}
                              />
                              {errors.email && (
                                <p className="label error text-sm mt-1">
                                  {errors.email.message}
                                </p>
                              )}
                              <div className="icon">
                                <Mail
                                  size={18}
                                  stroke="#B6B6B6"
                                  strokeWidth={1.5}
                                />
                              </div>
                            </fieldset>
                            <fieldset className="">
                              <label className="fw-6">Password</label>
                              <input
                                id="password-field"
                                type="password"
                                className="input-form password-input"
                                placeholder="Your password"
                                {...register("password")}
                              />
                              {errors.password && (
                                <p className="label error text-sm mt-1">
                                  {errors.password.message}
                                </p>
                              )}
                              <span
                                toggle="#password-field"
                                className="fa fa-fw fa-eye field-icon toggle-password"
                              />
                              <div className="icon">
                                <Lock
                                  size={18}
                                  stroke="#B6B6B6"
                                  strokeWidth={1.5}
                                />
                              </div>
                            </fieldset>
                            <fieldset className="">
                              <label className="fw-6">Confirm password</label>
                              <input
                                id="password-field1"
                                type="password"
                                className="input-form password-input"
                                placeholder="Confirm password"
                                {...register("confirmPassword")}
                              />
                              {errors.confirmPassword && (
                                <p className="label error text-sm mt-1">
                                  {errors.confirmPassword.message}
                                </p>
                              )}
                              <span
                                toggle="#password-field1"
                                className="fa fa-fw fa-eye field-icon toggle-password"
                              />
                              <div className="icon">
                                <Lock
                                  size={18}
                                  stroke="#B6B6B6"
                                  strokeWidth={1.5}
                                />
                              </div>
                            </fieldset>
                            <button
                              className="sc-button next-button"
                              name="submit"
                              type="submit"
                              style={{backgroundColor:"#FF7102"}}
                              disabled={isSignupLoading}
                            >
                              <span>
                                {isSignupLoading
                                  ? "Creating Account..."
                                  : "Continue to Profile"}
                              </span>
                              <ChevronRight size={16} />
                            </button>
                          </form>
                        </div>
                      </div>
                      <div className="text-box text-center fs-14">
                        Already have an account?{" "}
                        <a
                          className="font-2 fw-7 fs-14 color-popup text-color-3"
                          data-bs-toggle="modal"
                          data-bs-target="#popup_bid"
                        >
                          Login
                        </a>
                      </div>
                      {/* <p className="texts line fs-12 text-center">
                        or Register with
                      </p>
                      <div className="button-box flex">
                        <a
                          href="#"
                          className="social-btn flex align-center hover-login-social"
                        >
                          <GoogleIcon />
                          <span className="fw-6">Google</span>
                        </a>
                        <a
                          href="#"
                          className="social-btn flex align-center hover-login-social"
                        >
                          <Facebook size={21} color="#1877F2" />
                          <span className="fw-6">Facebook</span>
                        </a>
                      </div> */}
                    </>
                  ) : currentStep === 2 ? (
                    <>
                      <h1 className="title-login">Complete Your Profile</h1>

                      <MyProfile modal={true} onComplete={onProfileComplete} />
                    </>
                  ) : (
                    <MyGarage onComplete={onGarageComplete} />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .stepper-container {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          padding: 20px;

          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
        }

        div.custom-mb {
          margin-bottom: 0;
        }

        @media (max-width: 991.98px) {
          div.custom-mb {
            margin-bottom: 12px;
          }
        }

        .stepper {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          width: 100%;
        }

        .step {
          display: flex;
          width: 33%;
          min-width: 0;
        }

        .step-icon {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #e9ecef;
          color: #6c757d;
          display: flex;
          justify-content: center;
          align-items: center;
          font-weight: bold;
          font-size: 16px;
          margin-right: 12px;
          border: 2px solid #dee2e6;
          flex-shrink: 0;
          transition: all 0.3s ease;
        }

        .step.active .step-icon {
          background-color: #3772ff;
          color: white;
          border-color: #2a5cd6;
          box-shadow: 0 0 0 4px rgba(55, 114, 255, 0.2);
        }

        .step-content {
          display: flex;
          flex-direction: column;
        }

        .step-title {
          font-size: 16px;
          font-weight: 600;
          color: #343a40;
          margin-bottom: 2px;
          white-space: nowrap;
        }

        .step-description {
          font-size: 12px;
          color: #6c757d;
          white-space: nowrap;
        }

        .step.active .step-title {
          color: #3772ff;
        }

        .step-connector {
          flex: 1;
          padding: 0 15px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-width: 180px;
        }

        .connector-line {
          height: 3px;
          width: 100%;
          background-color: #dee2e6;
          position: relative;
          margin-top: 2px;
          transition: background-color 0.3s ease;
        }

        .connector-line.completed {
          background-color: #3772ff;
        }

        .back-btn {
          border: none;
          background: transparent;
          color: #3772ff;
          font-weight: 500;
          cursor: pointer;
          transition: color 0.2s;
          padding: 6px 12px;
          border-radius: 6px;
          margin-bottom: 10px;
        }

        .back-btn:hover {
          color: #2a5cd6;
          background-color: rgba(55, 114, 255, 0.1);
        }

        .next-button {
          background-color: #3772ff;
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 8px;
          transition: all 0.3s ease;
        }

        .next-button:hover {
          background-color: #2a5cd6;
          transform: translateY(-2px);
        }

        .social-btn {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 10px 16px;
          transition: all 0.2s ease;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.05);
        }

        .social-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .title-login {
          font-size: 24px;
          font-weight: 700;
          color: #343a40;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #f1f3f5;
        }

        /* Responsive adjustments */
        @media (max-width: 767px) {
          /* Mobile-only scrollable modal body */
          .modal-content {
            max-height: 90vh;
          }

          .modal-body {
            overflow-y: auto;
          }

          .stepper-container {
            padding: 12px 8px;
          }

          .stepper {
            flex-direction: column;
            align-items: center;
            gap: 12px;
          }

          .step {
            width: 100%;
            align-items: center;
            justify-content: center;
          }

          .step-content {
            flex: 0;
            align-items: center;
            text-align: center;
          }

          .step-title {
            font-size: 14px;
          }

          .step-description {
            font-size: 12px;
            white-space: normal;
          }

          .step-connector {
            display: none;
          }

          .connector-line {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
