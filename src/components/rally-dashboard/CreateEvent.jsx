import "mapbox-gl/dist/mapbox-gl.css";
import { useForm } from "react-hook-form";
import React, { useEffect, useState } from "react";
import DropdownSelect from "../common/DropDownSelect";

import { errorToast, successToast } from "../common/Toast";
import MapboxLocationModal from "../common/MapboxLocationModal";

import {
  useGetEventByIdQuery,
  useCreateEditEventMutation,
} from "@/redux/slices/api.slice";
import {
  getImage,
  toUtcIso,
  toLocalHHMM,
  normalizeMapboxFeature,
  toIsoStringOrEmpty,
  toLocalYYYYMMDD,
} from "@/utlis/helpers";

export default function CreateEvent({
  onEventComplete,
  rallyId,
  forceCreateEvent,
}) {
  const defaultValues = {
    name: "",
    type: "",
    no_of_vehicles: "",
    point_of_interests: "",
    start_date: "",
    start_time: "",
    end_date: "",
    end_time: "",
    start_location_json: "",
    end_location_json: "",
    inspection_form: false,
    avoid_highway: false,
    avoid_toll: false,
    checkpoints: [],
  };
  const {
    watch,
    setValue,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ defaultValues });
  const [imageFiles, setImageFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [existingThumbnails, setExistingThumbnails] = useState([]);
  const [createEvent, { isLoading: createEventLoading }] =
    useCreateEditEventMutation();

  const { data: eventData, isLoading: eventLoading } = useGetEventByIdQuery(
    { id: rallyId },
    {
      skip: !rallyId,
      refetchOnMountOrArgChange: true,
      refetchOnReconnect: true,
      refetchOnFocus: true,
    }
  );

  const handleClearAll = () => {
    try {
      localStorage.removeItem("createEventDraft");
    } catch (_) {}
    reset(defaultValues);
    setStartLocationLabel("");
    setEndLocationLabel("");
    setImagePreviews([]);
    setImageFiles([]);
    setExistingThumbnails([]);
    if (!forceCreateEvent) {
      successToast("Cleared draft and reset form");
    }
  };

  useEffect(() => {
    if (forceCreateEvent) {
      handleClearAll();
    }
  }, [forceCreateEvent]);

  const mapLabelToType = (val) => {
    if (val === "Grand Touring Rally") return "GRAND_TOURING_RALLY";
    if (val === "Custom Drive") return "CUSTOM_DRIVE";
    if (val === "Car Meets") return "CAR_MEETS";
    return "";
  };

  const mapTypeToLabel = (type) => {
    if (type === "GRAND_TOURING_RALLY") return "Grand Touring Rally";
    if (type === "CUSTOM_DRIVE") return "Custom Drive";
    if (type === "CAR_MEETS") return "Car Meets";
    return undefined;
  };

  useEffect(() => {
    try {
      if (!rallyId) {
        const raw = localStorage.getItem("createEventDraft");
        if (!raw) return;
        const draft = JSON.parse(raw);
        console.log(draft);
        if (draft?.form) {
          Object.entries(draft.form).forEach(([key, value]) => {
            setValue(key, value, { shouldValidate: false });
          });
        }

        const start = draft?.form?.start_location_json;
        if (start) {
          const label =
            start?.features?.[0]?.placeName ||
            start?.features?.[0]?.place_name ||
            "";
          setStartLocationLabel(label);
        }
        const end = draft?.form?.end_location_json;
        if (end) {
          const label =
            end?.features?.[0]?.placeName ||
            end?.features?.[0]?.place_name ||
            "";
          setEndLocationLabel(label);
        }
        if (draft?.imagePreviews && Array.isArray(draft.imagePreviews)) {
          setImagePreviews(draft.imagePreviews);
        }
        if (draft?.form?.thumbnails && Array.isArray(draft?.form?.thumbnails)) {
          setExistingThumbnails(draft?.form?.thumbnails);
        }
      }
    } catch (_) {}
  }, [setValue, rallyId]);

  useEffect(() => {
    const subscription = watch((value) => {
      try {
        const payload = {
          form: value,
          imagePreviews,
          thumbnails: existingThumbnails,
        };
        localStorage.setItem("createEventDraft", JSON.stringify(payload));
      } catch (_) {}
    });
    return () => subscription.unsubscribe?.();
  }, [watch, imagePreviews, existingThumbnails]);

  useEffect(() => {
    if (!eventData || !rallyId || forceCreateEvent) return;

    const parseLoc = (raw) => {
      if (!raw) return undefined;
      try {
        return JSON.parse(raw);
      } catch (_) {
        return undefined;
      }
    };
    const startDateTime = eventData.startDate
      ? new Date(eventData.startDate)
      : null;
    const endDateTime = eventData.endDate ? new Date(eventData.endDate) : null;

    const mapped = {
      name: eventData.name ?? "",
      type: eventData.type ?? "",
      no_of_vehicles: eventData.noOfVehicles ?? 0,
      point_of_interests: eventData.pointOfInterests ?? "",
      start_date: startDateTime ? toLocalYYYYMMDD(eventData.startDate) : "",
      start_time: toLocalHHMM(eventData.startTime),
      end_date: endDateTime ? toLocalYYYYMMDD(eventData.endDate) : "",
      end_time: toLocalHHMM(eventData.endTime),
      inspection_form: eventData.inspectionForm || false,
      avoid_highway: eventData.avoidHighway || false,
      avoid_toll: eventData.avoidToll || false,
      start_location_json: parseLoc(eventData.startMapboxLocationJson),
      end_location_json: parseLoc(eventData.endMapboxLocationJson),
      checkpoints: eventData.checkpoints || [],
    };

    reset(mapped, {
      keepDirtyValues: true,
      keepErrors: true,
      keepTouched: true,
    });

    const s = mapped.start_location_json;
    const e = mapped.end_location_json;
    setStartLocationLabel(
      s?.features?.[0]?.place_name ||
        (s?.query ? `${s.query[0]?.toFixed(5)}, ${s.query[1]?.toFixed(5)}` : "")
    );
    setEndLocationLabel(
      e?.features?.[0]?.place_name ||
        (e?.query ? `${e.query[0]?.toFixed(5)}, ${e.query[1]?.toFixed(5)}` : "")
    );

    if (Array.isArray(eventData.thumbnail)) {
      setExistingThumbnails(eventData.thumbnail);
    }
  }, [eventData, rallyId, reset, forceCreateEvent]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (existingThumbnails.length + imagePreviews.length >= 4) {
      errorToast("Maximum Image upload limit reached");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviews((prev) => [...prev, reader.result]);
      setImageFiles((prev) => [...prev, file]);
    };
    reader.readAsDataURL(file);
  };
  const handleDelete = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const handleDeleteExisting = (index) => {
    const name = existingThumbnails[index];
    if (name) {
      setValue("deleteImages", [...(watch("deleteImages") || []), name]);
    }
    setExistingThumbnails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const remaining = 4 - imageFiles.length;
    if (remaining <= 0) return errorToast("Maximum Image upload limit reached");
    const files = Array.from(e.dataTransfer.files).slice(0, remaining);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
        setImageFiles((prev) => [...prev, file]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };
  const [startLocationLabel, setStartLocationLabel] = useState("");
  const [endLocationLabel, setEndLocationLabel] = useState("");
  const [activeLocationPicker, setActiveLocationPicker] = useState(null);
  const formValues = watch();

  function safeStringifyLocation(raw) {
    const normalized = normalizeMapboxFeature(raw);
    return normalized ? JSON.stringify(normalized) : "";
  }

  const onSubmit = async (data) => {
    const formData = new FormData();

    if (imageFiles.length === 0 && existingThumbnails.length === 0) {
      errorToast("At least one image is required");
      return;
    }

    const { start_location_json, end_location_json, ...rest } = data;

    const startLocal = toIsoStringOrEmpty(data.start_date, data.start_time);

    if (data.type !== "CAR_MEETS") {
      const endLocal = toIsoStringOrEmpty(data.end_date, data.end_time);
      const endUTC = toUtcIso(endLocal);
      if (endUTC) {
        rest.end_date = endUTC;
        rest.end_time = endUTC;
      }
    } else {
      const endIsoLocal = toIsoStringOrEmpty(data.start_date, data.end_time);
      const endUTC = toUtcIso(endIsoLocal);
      delete rest.end_date;
      if (endUTC) {
        rest.end_time = endUTC;
      }
    }

    const startUTC = toUtcIso(startLocal);
    if (startUTC) {
      rest.start_date = startUTC;
      rest.start_time = startUTC;
    }

    if (rallyId) {
      formData.append("id", rallyId);
    }

    Object.entries(rest).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (data?.start_location_json) {
      formData.append(
        "start_location_json",
        safeStringifyLocation(data.start_location_json)
      );
    }
    if (data.type !== "CAR_MEETS") {
      if (data?.end_location_json) {
        formData.append(
          "end_location_json",
          safeStringifyLocation(data.end_location_json)
        );
      }
    }
    console.log(watch("start_location_json"));
    console.log(watch("end_location_json"));

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      const created = await createEvent(formData).unwrap();

      if (data.type !== "CAR_MEETS") {
        setValue("id", created.id, { shouldValidate: false });

        setValue("thumbnails", created.thumbnail);
        const draft = localStorage.getItem("createEventDraft");
        if (draft) {
          const draftObj = JSON.parse(draft);

          draftObj.form = {
            ...draftObj.form,
            id: created.id,
            thumbnails: created.thumbnail,
          };
          localStorage.setItem("createEventDraft", JSON.stringify(draftObj));
        }
        successToast(
          rallyId ? "Event Updated Successfully" : "Event Created Successfully"
        );
        onEventComplete(created.id);
      } else {
        successToast(
          rallyId ? "Event Updated Successfully" : "Event Created Successfully"
        );
        handleClearAll();
        window.location.href = "/dashboard";
      }
    } catch (err) {
      errorToast("Error Creating Event");
    }
  };
  console.log("watch form values", formValues);

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-12">
          <div className="content-area">
            {eventLoading ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minHeight: "70vh",
                  marginBottom: 40,
                }}
              >
                <span
                  className="spinner-border"
                  role="status"
                  aria-hidden="true"
                  style={{
                    width: 64,
                    height: 64,
                    marginBottom: 24,
                    fontSize: 48,
                  }}
                ></span>
                <span
                  style={{
                    fontSize: 32,
                    fontWeight: 600,
                    textAlign: "center",
                  }}
                >
                  Loading event...
                </span>
              </div>
            ) : (
              <main id="main" className="main-content">
                <div className="tfcl-dashboard">
                  <h1 className="admin-title mb-3">
                    {rallyId ? "Edit Event" : "Create Event"}
                  </h1>
                  <div className="tfcl-add-listing upload-photo">
                    <h3>Upload Event Photo</h3>
                    <div
                      className="upload-media"
                      style={
                        isDragging
                          ? { borderStyle: "solid", backgroundColor: "#f2f3f4" }
                          : {}
                      }
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                    >
                      <div className="inner">
                        <a href="#" className="relative">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width={18}
                            height={14}
                            viewBox="0 0 18 14"
                            fill="none"
                          >
                            <path
                              d="M0.875 10.125L5.17417 5.82583C5.34828 5.65172 5.55498 5.51361 5.78246 5.41938C6.00995 5.32515 6.25377 5.27665 6.5 5.27665C6.74623 5.27665 6.99005 5.32515 7.21754 5.41938C7.44502 5.51361 7.65172 5.65172 7.82583 5.82583L12.125 10.125M10.875 8.875L12.0492 7.70083C12.2233 7.52672 12.43 7.38861 12.6575 7.29438C12.885 7.20015 13.1288 7.15165 13.375 7.15165C13.6212 7.15165 13.865 7.20015 14.0925 7.29438C14.32 7.38861 14.5267 7.52672 14.7008 7.70083L17.125 10.125M2.125 13.25H15.875C16.2065 13.25 16.5245 13.1183 16.7589 12.8839C16.9933 12.6495 17.125 12.3315 17.125 12V2C17.125 1.66848 16.9933 1.35054 16.7589 1.11612C16.5245 0.881696 16.2065 0.75 15.875 0.75H2.125C1.79348 0.75 1.47554 0.881696 1.24112 1.11612C1.0067 1.35054 0.875 1.66848 0.875 2V12C0.875 12.3315 1.0067 12.6495 1.24112 12.8839C1.47554 13.1183 1.79348 13.25 2.125 13.25ZM10.875 3.875H10.8817V3.88167H10.875V3.875ZM11.1875 3.875C11.1875 3.95788 11.1546 4.03737 11.096 4.09597C11.0374 4.15458 10.9579 4.1875 10.875 4.1875C10.7921 4.1875 10.7126 4.15458 10.654 4.09597C10.5954 4.03737 10.5625 3.95788 10.5625 3.875C10.5625 3.79212 10.5954 3.71263 10.654 3.65403C10.7126 3.59542 10.7921 3.5625 10.875 3.5625C10.9579 3.5625 11.0374 3.59542 11.096 3.65403C11.1546 3.71263 11.1875 3.79212 11.1875 3.875Z"
                              stroke="white"
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                          Select photos
                          <input
                            type="file"
                            className="ip-file"
                            accept="image/*"
                            onChange={handleImageChange}
                          />
                        </a>
                        <div className="desc">
                          or drag photos here <br />
                          <span>(Up to 4 photos)</span>
                        </div>
                      </div>
                    </div>
                    <div
                      style={{ justifyContent: "center" }}
                      className="thumbnail-media"
                    >
                      {existingThumbnails.map((name, index) => (
                        <div key={`existing-${index}`} className="item">
                          <img
                            alt="img"
                            src={getImage(name)}
                            width={615}
                            height={405}
                          />
                          <a onClick={() => handleDeleteExisting(index)}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={16}
                              height={16}
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M9.82667 6.00035L9.596 12.0003M6.404 12.0003L6.17333 6.00035M12.8187 3.86035C13.0467 3.89501 13.2733 3.93168 13.5 3.97101M12.8187 3.86035L12.1067 13.1157C12.0776 13.4925 11.9074 13.8445 11.63 14.1012C11.3527 14.3579 10.9886 14.5005 10.6107 14.5003H5.38933C5.0114 14.5005 4.64735 14.3579 4.36999 14.1012C4.09262 13.8445 3.92239 13.4925 3.89333 13.1157L3.18133 3.86035M12.8187 3.86035C12.0492 3.74403 11.2758 3.65574 10.5 3.59568M3.18133 3.86035C2.95333 3.89435 2.72667 3.93101 2.5 3.97035M3.18133 3.86035C3.95076 3.74403 4.72416 3.65575 5.5 3.59568M10.5 3.59568V2.98501C10.5 2.19835 9.89333 1.54235 9.10667 1.51768C8.36908 1.49411 7.63092 1.49411 6.89333 1.51768C6.10667 1.54235 5.5 2.19901 5.5 2.98501V3.59568M10.5 3.59568C8.83581 3.46707 7.16419 3.46707 5.5 3.59568"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </a>
                        </div>
                      ))}

                      {imagePreviews.map((imgSrc, index) => (
                        <div key={`new-${index}`} className="item">
                          <img
                            alt="img"
                            src={imgSrc}
                            width={615}
                            height={405}
                          />
                          <a onClick={() => handleDelete(index)}>
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width={16}
                              height={16}
                              viewBox="0 0 16 16"
                              fill="none"
                            >
                              <path
                                d="M9.82667 6.00035L9.596 12.0003M6.404 12.0003L6.17333 6.00035M12.8187 3.86035C13.0467 3.89501 13.2733 3.93168 13.5 3.97101M12.8187 3.86035L12.1067 13.1157C12.0776 13.4925 11.9074 13.8445 11.63 14.1012C11.3527 14.3579 10.9886 14.5005 10.6107 14.5003H5.38933C5.0114 14.5005 4.64735 14.3579 4.36999 14.1012C4.09262 13.8445 3.92239 13.4925 3.89333 13.1157L3.18133 3.86035M12.8187 3.86035C12.0492 3.74403 11.2758 3.65574 10.5 3.59568M3.18133 3.86035C2.95333 3.89435 2.72667 3.93101 2.5 3.97035M3.18133 3.86035C3.95076 3.74403 4.72416 3.65575 5.5 3.59568M10.5 3.59568V2.98501C10.5 2.19835 9.89333 1.54235 9.10667 1.51768C8.36908 1.49411 7.63092 1.49411 6.89333 1.51768C6.10667 1.54235 5.5 2.19901 5.5 2.98501V3.59568M10.5 3.59568C8.83581 3.46707 7.16419 3.46707 5.5 3.59568"
                                stroke="white"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                  <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="tfcl-add-listing car-details">
                      <h3>Event Detail</h3>
                      <div
                        className="form-group-2"
                        style={
                          watch("type") === "CAR_MEETS"
                            ? { gridTemplateColumns: "1fr" }
                            : undefined
                        }
                      >
                        <div className="form-group">
                          <label htmlFor="listing_title">Event name *</label>
                          <input
                            type="text"
                            className="form-control"
                            {...register("name", {
                              required: "Event name is required",
                            })}
                            placeholder="Enter title"
                          />
                          {errors.name && (
                            <small
                              style={{ marginLeft: 3 }}
                              className="text-danger"
                            >
                              {errors.name.message}
                            </small>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="listing_title">Event Type *</label>

                          <DropdownSelect
                            addtionalParentClass="form-control"
                            defaultOption={"Select"}
                            options={[
                              "Grand Touring Rally",
                              "Custom Drive",
                              "Car Meets",
                            ]}
                            selectedValue={mapTypeToLabel(watch("type"))}
                            onChange={(val) => {
                              const key = mapLabelToType(val);
                              setValue("type", key, { shouldValidate: true });
                            }}
                          />

                          <input
                            type="hidden"
                            {...register("type", {
                              required: "Event type is required",
                            })}
                          />
                          {errors.type && (
                            <small
                              style={{ marginLeft: 3 }}
                              className="text-danger"
                            >
                              Event type is required
                            </small>
                          )}
                        </div>
                      </div>
                      <div
                        className="form-group-2"
                        style={
                          watch("type") === "CAR_MEETS"
                            ? { gridTemplateColumns: "1fr" }
                            : undefined
                        }
                      >
                        <div className="form-group">
                          <label htmlFor="listing_title">
                            Number of Vehicles *
                          </label>
                          <input
                            type="number"
                            className="form-control"
                            {...register("no_of_vehicles", {
                              required: "Number of vehicles is required",
                            })}
                            placeholder="Number of Vehicles"
                          />
                          {errors.no_of_vehicles && (
                            <small
                              style={{ marginLeft: 3 }}
                              className="text-danger"
                            >
                              {errors.no_of_vehicles.message}
                            </small>
                          )}
                        </div>

                        <div className="form-group">
                          <label htmlFor="listing_title">
                            Points of interest
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            {...register("point_of_interests")}
                            placeholder="Point on Interests"
                          />
                        </div>
                      </div>
                      <div
                        className="form-group-2"
                        style={
                          watch("type") === "CAR_MEETS"
                            ? { gridTemplateColumns: "1fr" }
                            : undefined
                        }
                      >
                        <div className="form-group">
                          <label htmlFor="listing_title">Start Date *</label>
                          <input
                            type="date"
                            className="form-control"
                            min={new Date().toISOString().split("T")[0]}
                            {...register("start_date", {
                              required: "Start date is required",
                            })}
                          />
                          {errors.start_date && (
                            <small
                              style={{ marginLeft: 3 }}
                              className="text-danger"
                            >
                              {errors.start_date.message}
                            </small>
                          )}
                        </div>
                        <div className="form-group">
                          <label htmlFor="listing_title">Start Time *</label>
                          <input
                            type="time"
                            className="form-control"
                            {...register("start_time", {
                              required: "Start time is required",
                            })}
                          />
                          {errors.start_time && (
                            <small
                              style={{ marginLeft: 3 }}
                              className="text-danger"
                            >
                              {errors.start_time.message}
                            </small>
                          )}
                        </div>
                      </div>
                      <div
                        className="form-group-2"
                        style={
                          watch("type") === "CAR_MEETS"
                            ? { gridTemplateColumns: "1fr" }
                            : undefined
                        }
                      >
                        {watch("type") !== "CAR_MEETS" && (
                          <div className="form-group">
                            <label htmlFor="listing_title">End Date *</label>
                            <input
                              type="date"
                              className="form-control"
                              min={watch("start_date") || undefined}
                              {...register("end_date", {
                                required: "End date is required",
                              })}
                            />
                            {errors.end_date && (
                              <small
                                style={{ marginLeft: 3 }}
                                className="text-danger"
                              >
                                {errors.end_date.message}
                              </small>
                            )}
                          </div>
                        )}

                        {watch("type") !== "CAR_MEETS" && (
                          <div className="form-group">
                            <label htmlFor="listing_title">End Time *</label>
                            <input
                              type="time"
                              className="form-control"
                              {...register("end_time", {
                                required: "End time is required",
                              })}
                            />
                            {errors.end_time && (
                              <small
                                style={{ marginLeft: 3 }}
                                className="text-danger"
                              >
                                {errors.end_time.message}
                              </small>
                            )}
                          </div>
                        )}
                      </div>
                      <div
                        className="form-group-2"
                        style={
                          watch("type") === "CAR_MEETS"
                            ? { gridTemplateColumns: "1fr 1fr" }
                            : undefined
                        }
                      >
                        {watch("type") === "CAR_MEETS" && (
                          <div className="form-group">
                            <label htmlFor="listing_title">End Time *</label>
                            <input
                              type="time"
                              className="form-control"
                              {...register("end_time", {
                                required: "End time is required",
                              })}
                            />
                            {errors.end_time && (
                              <small
                                style={{ marginLeft: 3 }}
                                className="text-danger"
                              >
                                {errors.end_time.message}
                              </small>
                            )}
                          </div>
                        )}
                        <div className="form-group">
                          <label htmlFor="start_location_json">
                            Start Location *
                          </label>
                          <div className="d-flex gap-2">
                            <input
                              id="start_location_json"
                              type="text"
                              className="form-control"
                              readOnly
                              value={startLocationLabel}
                              placeholder="Select on map"
                              data-bs-toggle="modal"
                              data-bs-target="#mapbox_location_modal"
                              onClick={() => setActiveLocationPicker("start")}
                            />
                            <input
                              type="hidden"
                              {...register("start_location_json", {
                                required: "Start location is required",
                              })}
                              value={startLocationLabel}
                            />
                          </div>
                          {errors.start_location_json && (
                            <small
                              style={{ marginLeft: 3 }}
                              className="text-danger"
                            >
                              {errors.start_location_json.message}
                            </small>
                          )}
                        </div>
                        {watch("type") !== "CAR_MEETS" && (
                          <div className="form-group">
                            <label htmlFor="end_location_json">
                              End Location *
                            </label>
                            <div className="d-flex gap-2">
                              <input
                                id="end_location_json"
                                type="text"
                                className="form-control"
                                readOnly
                                value={endLocationLabel}
                                placeholder="Select on map"
                                data-bs-toggle="modal"
                                data-bs-target="#mapbox_location_modal"
                                onClick={() => setActiveLocationPicker("end")}
                              />
                              <input
                                type="hidden"
                                {...register("end_location_json", {
                                  required: "End location is required",
                                })}
                                value={endLocationLabel}
                              />
                            </div>
                            {errors.end_location_json && (
                              <small
                                style={{ marginLeft: 3 }}
                                className="text-danger"
                              >
                                {errors.end_location_json.message}
                              </small>
                            )}
                          </div>
                        )}
                      </div>
                      {watch("type") !== "CAR_MEETS" && (
                        <div>
                          <div
                            style={{
                              flexDirection: "row",
                              display: "flex",
                              gap: "32px",
                              alignItems: "center",
                            }}
                          >
                            <div
                              className="parent-item group-checkbox"
                              style={{
                                whiteSpace: "nowrap",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                                marginBottom: 0,
                              }}
                            >
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="custom-checkbox-1"
                                style={{
                                  margin: 0,
                                  width: "16px",
                                  height: "16px",
                                }}
                                {...register("inspection_form")}
                              />
                              <label
                                htmlFor="custom-checkbox-1"
                                style={{ whiteSpace: "nowrap", paddingTop: 8 }}
                              >
                                Vehical Inspection Form
                              </label>
                            </div>

                            <div
                              className="parent-item group-checkbox"
                              style={{
                                whiteSpace: "nowrap",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",

                                marginBottom: 0,
                              }}
                            >
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="custom-checkbox-2"
                                style={{
                                  margin: 0,
                                  width: "16px",
                                  height: "18px",
                                }}
                                {...register("avoid_highway")}
                              />
                              <label
                                htmlFor="custom-checkbox-2"
                                style={{ whiteSpace: "nowrap", paddingTop: 8 }}
                              >
                                Avoid Highways
                              </label>
                            </div>

                            <div
                              className="group-checkbox"
                              style={{
                                whiteSpace: "nowrap",
                                display: "flex",
                                alignItems: "center",
                                gap: "8px",
                              }}
                            >
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id="custom-checkbox-3"
                                style={{
                                  margin: 0,
                                  width: "16px",
                                  height: "16px",
                                }}
                                {...register("avoid_toll")}
                              />
                              <label
                                htmlFor="custom-checkbox-3"
                                style={{ whiteSpace: "nowrap", paddingTop: 8 }}
                              >
                                Avoid tolls
                              </label>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="group-button-submit">
                      <button
                        type="submit"
                        className="pre-btn"
                        disabled={createEventLoading}
                      >
                        {createEventLoading ? (
                          <>
                            <span
                              className="spinner-border spinner-border-sm me-2"
                              role="status"
                              aria-hidden="true"
                            ></span>
                            Saving...
                          </>
                        ) : rallyId ? (
                          "Update Event"
                        ) : (
                          "Create Event"
                        )}
                      </button>
                      {!rallyId && (
                        <button
                          type="button"
                          className="pre-btn"
                          style={{
                            marginLeft: "10px",
                            backgroundColor: "#6c757d",
                          }}
                          disabled={createEventLoading}
                          onClick={handleClearAll}
                        >
                          Clear
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              </main>
            )}
          </div>
        </div>
      </div>
      <MapboxLocationModal
        id="mapbox_location_modal"
        eventDetails={formValues}
        initialCoordinates={
          activeLocationPicker === "end"
            ? watch("end_location_json")?.query
            : watch("start_location_json")?.query
        }
        onSelect={({ coordinates, label, retrievedLocation }) => {
          console.log(retrievedLocation);
          const display =
            label ||
            `${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}`;

          if (activeLocationPicker === "end") {
            setEndLocationLabel(display);
            setValue("end_location_json", retrievedLocation, {
              shouldValidate: true,
            });
          } else {
            setStartLocationLabel(display);
            setValue("start_location_json", retrievedLocation, {
              shouldValidate: true,
            });
          }
        }}
        onCancel={() => {
          if (activeLocationPicker == "end") {
            setValue(
              "end_location_json",
              eventData?.endMapboxLocationJson || ""
            );
            setEndLocationLabel("");
          } else if (activeLocationPicker == "start") {
            setValue(
              "start_location_json",
              eventData?.startMapboxLocationJson || ""
            );
            setStartLocationLabel("");
          }
        }}
      />
    </div>
  );
}
