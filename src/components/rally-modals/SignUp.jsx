import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  User,
  Mail,
  Lock,
  Facebook,
} from "lucide-react";
import { useSignupMutation } from "@/redux/slices/api.slice";
import { Modal } from "bootstrap";
import Toast from "../common/Toast";

// Validation schema
const schema = yup.object().shape({
  username: yup.string().required("Username is required"),
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

  const [signup, { isLoading }] = useSignupMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    try {
      const { confirmPassword, ...userData } = data;

      const response = await signup(userData).unwrap();

      setToastMessage("Account created successfully!");
      setToastType("success");
      setShowToast(true);

      // Reset form
      reset();
      Modal.getInstance(document.getElementById("popup_bid2"))?.hide();
      Modal.getOrCreateInstance(document.getElementById("popup_bid")).show();

      // Hide toast after 5 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } catch (error) {
      // Show error toast
      setToastMessage(
        error.data?.message || "Registration failed. Please try again."
      );
      setToastType("error");
      setShowToast(true);

      // Hide toast after 5 seconds
      setTimeout(() => {
        setShowToast(false);
      }, 5000);
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
        aria-hidden="true"
      >
        <div className="modal-dialog modal-dialog-centered" role="document">
          <div className="modal-content">
            <button
              type="button"
              className="close"
              data-bs-dismiss="modal"
              aria-label="Close"
            >
              <span aria-hidden="true">×</span>
            </button>
            <div className="modal-body space-y-20 pd-40 style2">
              <div className="wrap-modal flex">
                <div className="images flex-none relative">
                  <img
                    alt="images"
                    src="/assets/images/section/register.jpg"
                    width={384}
                    height={854}
                  />
                </div>
                <div className="content">
                  <h1 className="title-login">Register</h1>
                  <div className="comments">
                    <div className="respond-comment">
                      <form
                        onSubmit={handleSubmit(onSubmit)}
                        className="comment-form form-submit"
                        acceptCharset="utf-8"
                      >
                        <fieldset className="">
                          <label className="fw-6">User name</label>
                          <input
                            type="text"
                            className="tb-my-input"
                            placeholder="User name"
                            {...register("username")}
                          />
                          {errors.username && (
                            <p
                              className="label error text-sm mt-1"
                              style={{ color: "red", marginLeft: "5px" }}
                            >
                              {errors.username.message}
                            </p>
                          )}
                          <div className="icon">
                            <User
                              size={18}
                              stroke="#B6B6B6"
                              strokeWidth={1.5}
                            />
                          </div>
                        </fieldset>
                        <div style={{ display: "flex" }}>
                          <div className="" style={{ width: "310px" }}>
                            <label className="fw-6">First name</label>
                            <input
                              type="text"
                              className="tb-my-input"
                              placeholder="First name"
                              {...register("firstName")}
                            />
                            {errors.firstName && (
                              <p className="label error text-sm mt-1">
                                {errors.firstName.message}
                              </p>
                            )}
                            <div className="icon">
                              <User
                                size={18}
                                stroke="#B6B6B6"
                                strokeWidth={1.5}
                              />
                            </div>
                          </div>

                          <div
                            className=""
                            style={{ width: "310px", marginLeft: "20px" }}
                          >
                            <label className="fw-6">Last name</label>
                            <input
                              type="text"
                              className="tb-my-input"
                              placeholder="Last name"
                              {...register("lastName")}
                            />
                            {errors.lastName && (
                              <p className="label error text-sm mt-1">
                                {errors.lastName.message}
                              </p>
                            )}
                            <div className="icon">
                              <User
                                size={18}
                                stroke="#B6B6B6"
                                strokeWidth={1.5}
                              />
                            </div>
                          </div>
                        </div>

                        <fieldset style={{ marginTop: "20px" }} className="t">
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
                          className="sc-button"
                          name="submit"
                          type="submit"
                        >
                          <span>Sign Up</span>
                        </button>
                      </form>
                    </div>
                  </div>
                  <div className="text-box text-center fs-14">
                    Don't you have an account?{" "}
                    <a
                      className="font-2 fw-7 fs-14 color-popup text-color-3"
                      data-bs-toggle="modal"
                      data-bs-target="#popup_bid"
                    >
                      Login
                    </a>
                  </div>
                  <p className="texts line fs-12 text-center">
                    or Register with
                  </p>
                  <div className="button-box flex">
                    <a
                      href="#"
                      className="flex align-center hover-login-social"
                    >
                      <GoogleIcon />
                      <span className="fw-6">Google</span>
                    </a>
                    <a
                      href="#"
                      className="flex align-center hover-login-social"
                    >
                      <Facebook size={21} color="#1877F2" />
                      <span className="fw-6">Facebook</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Custom Google icon (keeping the original SVG as Lucide doesn't have a Google icon)
const GoogleIcon = () => (
  <svg
    width={20}
    height={21}
    viewBox="0 0 20 21"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M4.43242 12.5863L3.73625 15.1852L1.19176 15.239C0.431328 13.8286 0 12.2149 0 10.5C0 8.84179 0.403281 7.27804 1.11812 5.90112H1.11867L3.38398 6.31644L4.37633 8.56815C4.16863 9.17366 4.05543 9.82366 4.05543 10.5C4.05551 11.2341 4.18848 11.9374 4.43242 12.5863Z"
      fill="#FBBB00"
    />
    <path
      d="M19.8242 8.6319C19.939 9.23682 19.9989 9.86155 19.9989 10.5C19.9989 11.216 19.9236 11.9143 19.7802 12.588C19.2934 14.8803 18.0214 16.8819 16.2594 18.2984L16.2588 18.2978L13.4055 18.1522L13.0017 15.6314C14.1709 14.9456 15.0847 13.8726 15.566 12.588H10.2188V8.6319H19.8242Z"
      fill="#518EF8"
    />
    <path
      d="M16.2595 18.2978L16.2601 18.2984C14.5464 19.6758 12.3694 20.5 9.99965 20.5C6.19141 20.5 2.88043 18.3715 1.19141 15.239L4.43207 12.5863C5.27656 14.8401 7.45074 16.4445 9.99965 16.4445C11.0952 16.4445 12.1216 16.1484 13.0024 15.6313L16.2595 18.2978Z"
      fill="#28B446"
    />
    <path
      d="M16.382 2.80219L13.1425 5.45437C12.2309 4.88461 11.1534 4.55547 9.99906 4.55547C7.39246 4.55547 5.17762 6.23348 4.37543 8.56812L1.11773 5.90109H1.11719C2.78148 2.6923 6.13422 0.5 9.99906 0.5C12.4254 0.5 14.6502 1.3643 16.382 2.80219Z"
      fill="#F14336"
    />
  </svg>
);
