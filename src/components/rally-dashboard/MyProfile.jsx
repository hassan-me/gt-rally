import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { States, Cities } from "@/data/locations";
import DropdownSelect from "../common/DropDownSelect";

export default function MyProfile({ modal = false, onComplete }) {
  const [preview, setPreview] = useState(
    "/assets/images/dashboard/avt-profile.jpg"
  );

  const [uploadedFile, setUploadedFile] = useState(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      state: "Alabama",
      city: null,
    },
  });

  const selectedState = watch("state");

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
      formData.append("profile_image", uploadedFile); 
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
          <div className="content-area">
            <main id="main" className="main-content">
              <div className="tfcl-dashboard">
                {!modal && <h1 className="admin-title mb-3">Edit profile</h1>}

                <form
                  className="tfcl-add-listing profile-inner"
                  onSubmit={handleSubmit(onSubmit)}
                >
                  <h3>Avatar</h3>
                  <div className="tfcl_choose_avatar">
                    <div className="avatar">
                      <div className="form-group">
                        <img
                          loading="lazy"
                          decoding="async"
                          width={158}
                          height={138}
                          id="tfcl_avatar_thumbnail"
                          alt="avatar"
                          src={preview}
                        />
                      </div>
                      <div className="choose-box">
                        <label>Upload a new Profile Picture</label>
                        <div className="form-group relative pb-2 pt-2">
                          <input
                            type="file"
                            className="form-control ip-file"
                            accept="image/*"
                            onChange={handleImageUpload}
                          />
                          <label htmlFor="tfcl_avatar">
                            <button type="button">Choose file</button>
                          </label>
                        </div>
                        <span className="notify-avatar">
                          PNG, JPG, SVG dimension (400 * 400) max file not more
                          than size 4 mb
                        </span>
                      </div>
                    </div>
                  </div>

                  <h3 className="form-title">Information</h3>
                  <div className="form-group-2">
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        {...register("username", { required: true })}
                        placeholder="User Name"
                      />
                      {errors.userName && (
                        <span className="text-danger">
                          Username is required
                        </span>
                      )}
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        className="form-control"
                        {...register("zipCode", { required: true })}
                        placeholder="Zip Code"
                      />
                      {errors.zipCode && (
                        <span className="text-danger">
                          Zip Code is required
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="form-group-2">
                    <div className="form-group">
                      <DropdownSelect
                        addtionalParentClass="form-control"
                        defaultOption="Select State"
                        options={States}
                        onChange={(value) => {
                          setValue("state", value);
                          setValue("city", null);
                        }}
                      />
                    </div>

                    <div className="form-group">
                      <DropdownSelect
                        addtionalParentClass="form-control"
                        defaultOption="Select City"
                        options={Cities[selectedState] || []}
                        onChange={(value) => {
                          setValue("city", value);
                        }}
                      />
                    </div>
                  </div>

                  <div className="group-button-submit left mb-3">
                    <button type="submit" className="pre-btn">
                      Save &amp; Update
                    </button>
                  </div>
                </form>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
