import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  User,
  Mail,
  Lock,
  Building,
  Phone,
  FileText,
  Globe,
} from "lucide-react";
import Toast from "@/components/common/Toast";
import emailjs from "@emailjs/browser";

// Validation schema
const schema = yup.object().shape({
  companyName: yup.string().required("Company name is required"),
  contactName: yup.string().required("Contact name is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone number is required"),
  website: yup.string().required("Website URL is required"),
  sponsorshipLevel: yup.string().required("Sponsorship level is required"),
  message: yup
    .string()
    .required("Please provide details about your sponsorship interests"),
});

export default function SponsorForm() {
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      const templateParams = {
        company_name: data.companyName,
        contact_name: data.contactName,
        from_email: data.email,
        phone: data.phone,
        website: data.website,
        sponsorship_level: data.sponsorshipLevel,
        message: data.message,
      };

      await emailjs.send(
        import.meta.env.VITE_SERIVCE_ID,
        import.meta.env.VITE_TEMPLATE_ID,
        templateParams,
        import.meta.env.VITE_EMAIL_PUBLIC_KEY
      );

      setToastMessage(
        "Sponsorship inquiry submitted successfully! We'll contact you soon."
      );
      setToastType("success");
      setShowToast(true);

      reset();

      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } catch (error) {
      console.error("Error sending email:", error);

      setToastMessage(
        "Failed to submit your inquiry. Please try again or contact us directly."
      );
      setToastType("error");
      setShowToast(true);

      setTimeout(() => {
        setShowToast(false);
      }, 5000);
    } finally {
      setIsSubmitting(false);
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
      <div className="sponsor-form-container ">
        <div className="container">
          <div className="row justify-content-center">
            <div className="">
              <div
                className="modal-content"
                style={{
                  backgroundColor: "#ffffff",
                  boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.1)",
                  borderRadius: "16px",
                  margin: "0 auto",
                  marginBottom: "50px",
                }}
              >
                <div className="modal-body space-y-20 pd-40 style2">
                  <div className="wrap-modal flex">
                    <div className="content">
                      <h1 style={{ marginBottom: "20px" }}>Become a Sponsor</h1>
                      <p style={{ marginBottom: "20px" }}>
                        Join GT Rally as a valued sponsor and connect with
                        passionate car enthusiasts around the world.
                      </p>
                      <div className="comments">
                        <div className="respond-comment">
                          <form
                            onSubmit={handleSubmit(onSubmit)}
                            className="comment-form form-submit"
                            acceptCharset="utf-8"
                          >
                            <fieldset className="">
                              <label className="fw-6">Company Name</label>
                              <input
                                type="text"
                                className="tb-my-input"
                                placeholder="Your company name"
                                style={{ paddingLeft: "50px" }}
                                {...register("companyName")}
                              />
                              {errors.companyName && (
                                <p
                                  className="label error text-sm mt-1"
                                  style={{ color: "red", marginLeft: "5px" }}
                                >
                                  {errors.companyName.message}
                                </p>
                              )}
                              <div className="icon">
                                <Building
                                  size={18}
                                  stroke="#B6B6B6"
                                  strokeWidth={1.5}
                                />
                              </div>
                            </fieldset>

                            <fieldset className="">
                              <label className="fw-6">Contact Person</label>
                              <input
                                type="text"
                                className="tb-my-input"
                                style={{ paddingLeft: "50px" }}
                                placeholder="Contact person's name"
                                {...register("contactName")}
                              />
                              {errors.contactName && (
                                <p
                                  className="label error text-sm mt-1"
                                  style={{ color: "red", marginLeft: "5px" }}
                                >
                                  {errors.contactName.message}
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

                            <div style={{ display: "flex", gap: "20px" }}>
                              <fieldset style={{ width: "50%" }} className="t">
                                <label className="fw-6">Email address</label>
                                <input
                                  type="email"
                                  className="tb-my-input"
                                  style={{ paddingLeft: "50px" }}
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

                              <fieldset style={{ width: "50%" }} className="t">
                                <label className="fw-6">Phone Number</label>
                                <input
                                  type="text"
                                  className="tb-my-input"
                                  style={{ paddingLeft: "50px" }}
                                  placeholder="Phone number"
                                  {...register("phone")}
                                />
                                {errors.phone && (
                                  <p className="label error text-sm mt-1">
                                    {errors.phone.message}
                                  </p>
                                )}
                                <div className="icon">
                                  <Phone
                                    size={18}
                                    stroke="#B6B6B6"
                                    strokeWidth={1.5}
                                  />
                                </div>
                              </fieldset>
                            </div>

                            <fieldset className="">
                              <label className="fw-6">Company Website</label>
                              <input
                                type="text"
                                className="tb-my-input"
                                placeholder="https://yourcompany.com"
                                style={{ paddingLeft: "50px" }}
                                {...register("website")}
                              />
                              {errors.website && (
                                <p
                                  className="label error text-sm mt-1"
                                  style={{ color: "red", marginLeft: "5px" }}
                                >
                                  {errors.website.message}
                                </p>
                              )}
                              <div className="icon">
                                <Globe
                                  size={18}
                                  stroke="#B6B6B6"
                                  strokeWidth={1.5}
                                />
                              </div>
                            </fieldset>

                            <div
                              className="form-group"
                              style={{ marginBottom: "20px" }}
                            >
                              <label>Sponsorship Level</label>
                              <div className="input-wrap">
                                <select
                                  className={`form-control ${
                                    errors.sponsorshipLevel ? "is-invalid" : ""
                                  }`}
                                  {...register("sponsorshipLevel")}
                                >
                                  <option value="">
                                    Select a sponsorship level
                                  </option>
                                  <option value="Platinum">
                                    Platinum Sponsor
                                  </option>
                                  <option value="Gold">Gold Sponsor</option>
                                  <option value="Silver">Silver Sponsor</option>
                                  <option value="Bronze">Bronze Sponsor</option>
                                  <option value="Custom">Custom Package</option>
                                </select>
                              </div>
                              {errors.sponsorshipLevel && (
                                <div className="invalid-feedback d-block">
                                  {errors.sponsorshipLevel.message}
                                </div>
                              )}
                            </div>

                            <fieldset className="">
                              <label className="fw-6">Message</label>
                              <textarea
                                className="tb-my-input"
                                rows="4"
                                placeholder="Tell us about your sponsorship interests and goals"
                                {...register("message")}
                              ></textarea>
                              {errors.message && (
                                <p
                                  className="label error text-sm mt-1"
                                  style={{ color: "red", marginLeft: "5px" }}
                                >
                                  {errors.message.message}
                                </p>
                              )}
                            </fieldset>

                            <button
                              className="sc-button"
                              name="submit"
                              type="submit"
                              disabled={isSubmitting}
                            >
                              <span>
                                {isSubmitting
                                  ? "Submitting..."
                                  : "Submit Sponsorship Inquiry"}
                              </span>
                            </button>
                          </form>
                        </div>
                      </div>
                      <p className="text-center mt-8">
                        Our team will contact you within 48 hours to discuss
                        partnership opportunities.
                      </p>
                      <div className="col-lg-12">
                        <div
                          className="box-text flex justify-center flex-wrap center"
                          style={{ marginTop: "70px" }}
                        >
                          <h4>
                            Visit Grand Touring Rally (GT Rally) online today
                            and be part of a movement that's redefining the car
                            event experience for all—participants, organizers,
                            and sponsors alike.
                          </h4>
                        </div>
                      </div>
                    </div>
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
