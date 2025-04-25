import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { CarMakes, CarModels } from "@/data/garage";

import DropdownSelect from "../common/DropDownSelect";

export default function MyGarage({ onComplete }) {
  const [preview, setPreview] = useState(null);
  const [uploadedFile, setUploadedFile] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      carMake: "Toyota",
      carModel: null,
    },
  });

  const selectedMake = watch("carMake");

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      setUploadedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (uploadedFile) {
      formData.append("car_image", uploadedFile);
    }

    // Call onComplete with FormData
    if (onComplete) {
      onComplete(formData);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <form
            className="tfcl-add-listing profile-inner"
            onSubmit={handleSubmit(onSubmit)}
          >
            <h2 className="admin-title mb-3" style={{ textAlign: "left" }}>
              Add Garage
            </h2>

            {/* Car Image */}
            <div className="tfcl_choose_avatar">
              <div className="avatar" style={{ alignItems: "center" }}>
                {preview && (
                  <div
                    style={{
                      position: "relative",
                      display: "inline-block",
                      borderRadius: "10px",
                      overflow: "hidden",
                    }}
                  >
                    <button
                      onClick={() => setPreview(null)}
                      style={{
                        position: "absolute",
                        top: "10px",
                        right: "10px",
                        zIndex: 2,
                        background: "#ff4d4f",
                        color: "white",
                        border: "none",
                        borderRadius: "50%",
                        width: "30px",
                        height: "30px",
                        cursor: "pointer",
                        fontSize: "18px",
                        lineHeight: "30px",
                        textAlign: "center",
                        padding: 0,
                      }}
                    >
                      ×
                    </button>
                    <img
                      loading="lazy"
                      decoding="async"
                      alt="car-preview"
                      src={preview}
                      style={{
                        maxHeight: "250px",
                        maxWidth: "250px",
                        borderRadius: "10px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                )}

                <div className="choose-box">
                  <div className="form-group relative pb-2 pt-2">
                    <input
                      type="file"
                      className="form-control ip-file"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                    <label htmlFor="tfcl_avatar">
                      <button
                        type="button"
                        style={{ width: "180px", backgroundColor: "#EE6742" }}
                      >
                        Upload Car Image
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Car Info */}
            <h3 className="form-title" style={{ marginTop: "50px" }}>
              Car Information
            </h3>
            <div className="form-group-2">
              <div className="form-group">
                <input
                  type="text"
                  className="form-control"
                  {...register("carName", { required: true })}
                  placeholder="Car Name"
                />
                {errors.carName && (
                  <span className="text-danger">Car name is required</span>
                )}
              </div>
              <div className="form-group">
                <input
                  type="number"
                  className="form-control"
                  {...register("carYear", { required: true })}
                  placeholder="Car Year"
                />
                {errors.carName && (
                  <span className="text-danger">Car Year is required</span>
                )}
              </div>
              <div className="form-group">
                <DropdownSelect
                  addtionalParentClass="form-control"
                  defaultOption="Select Make"
                  options={CarMakes}
                  value={selectedMake}
                  onChange={(value) => {
                    setValue("carMake", value);
                    setValue("carModel", null);
                  }}
                />
              </div>
              <div className="form-group">
                <DropdownSelect
                  addtionalParentClass="form-control"
                  defaultOption="Select Model"
                  options={CarModels[selectedMake] || []}
                  onChange={(value) => {
                    setValue("carModel", value);
                  }}
                />
              </div>
            </div>

            <div className="group-button-submit left mb-3">
              <button type="submit" className="pre-btn">
                Save Car
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
