import "mapbox-gl/dist/mapbox-gl.css";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import MapboxLocationModal from "../common/MapboxLocationModal";
import { errorToast, successToast } from "../common/Toast";
import {
  useCreateEditCheckpointMutation,
  useGetEventByIdQuery,
  useUpdateCheckpointOrderMutation,
  useDeleteCheckpointMutation,
} from "@/redux/slices/api.slice";

import {
  normalizeMapboxFeature,
  getImage,
  toIsoStringOrEmpty,
} from "@/utlis/helpers";

// Sortable item component
function SortableItem({
  id,
  checkpoint,
  onCheckpointClick,
  onDelete,
  isDeleting,
  disabled,
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id, disabled });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "20px 26px",
    marginBottom: "16px",
    borderRadius: "12px",
    background: "transparent",
    boxShadow: "3px 3px 5px 2px rgba(0,0,0,0.1)",
    cursor: disabled ? "not-allowed" : "pointer",
  };

  const handleClick = () => {
    if (checkpoint && onCheckpointClick) {
      onCheckpointClick(checkpoint);
    }
  };

  return (
    <div ref={setNodeRef} style={style} onClick={handleClick}>
      <span>{id}</span>
      {/* Drag Handle */}
      <div>
        <button
          {...attributes}
          {...listeners}
          style={{
            background: "transparent",
            border: "none",
            cursor: disabled ? "not-allowed" : "grab",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <GripVertical size={18} />
        </button>
        <button
          style={{
            background: "transparent",
            border: "none",
            marginLeft: 8,
            cursor: disabled || isDeleting ? "not-allowed" : "pointer",
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled && !isDeleting) onDelete?.(checkpoint?.id);
          }}
          disabled={disabled || isDeleting}
          aria-label="Delete checkpoint"
          title="Delete checkpoint"
        >
          {isDeleting ? (
            <span
              className="spinner-border spinner-border-sm"
              role="status"
              aria-hidden="true"
            ></span>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={16}
              height={16}
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M9.82667 6.00035L9.596 12.0003M6.404 12.0003L6.17333 6.00035M12.8187 3.86035C13.0467 3.89501 13.2733 3.93168 13.5 3.97101M12.8187 3.86035L12.1067 13.1157C12.0776 13.4925 11.9074 13.8445 11.63 14.1012C11.3527 14.3579 10.9886 14.5005 10.6107 14.5003H5.38933C5.0114 14.5005 4.64735 14.3579 4.36999 14.1012C4.09262 13.8445 3.92239 13.4925 3.89333 13.1157L3.18133 3.86035M12.8187 3.86035C12.0492 3.74403 11.2758 3.65574 10.5 3.59568M3.18133 3.86035C2.95333 3.89435 2.72667 3.93101 2.5 3.97035M3.18133 3.86035C3.95076 3.74403 4.72416 3.65575 5.5 3.59568M10.5 3.59568V2.98501C10.5 2.19835 9.89333 1.54235 9.10667 1.51768C8.36908 1.49411 7.63092 1.49411 6.89333 1.51768C6.10667 1.54235 5.5 2.19901 5.5 2.98501V3.59568M10.5 3.59568C8.83581 3.46707 7.16419 3.46707 5.5 3.59568"
                stroke="#dc3545"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export default function CreateCheckpoint({ rallyId, isCreate = true, goBack }) {
  const [items, setItems] = useState([]);
  const [checkpoints, setCheckpoints] = useState([]);
  const storageKey = `event_${rallyId}`;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors },
  } = useForm();

  const [createEditCheckpoint, { isLoading: updateCheckpointLoading }] =
    useCreateEditCheckpointMutation();
  const [deleteCheckpoint] = useDeleteCheckpointMutation();
  const {
    data: eventDetails,
    isLoading: isGetEventLoading,
    refetch: refetchEvent,
  } = useGetEventByIdQuery({ id: rallyId });
  const [isDragging, setIsDragging] = useState(false);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isReordering, setIsReordering] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (imageFiles.length >= 4) {
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
    setValue("deleteImages", [
      ...(watch("deleteImages") || []),
      imagePreviews[index],
    ]);
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
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

  const [locationLabel, setLocationLabel] = useState("");
  const [waypoint1Label, setWaypoint1Label] = useState("");
  const [waypoint2Label, setWaypoint2Label] = useState("");
  const [activeLocationPicker, setActiveLocationPicker] = useState(null);

  const getOrderValue = () => {
    const checkpointsData = eventDetails?.checkpoints ?? [];
    let orderValue = 1;
    if (checkpointsData && checkpointsData.length > 0) {
      const lastOrder = checkpointsData[checkpointsData.length - 1]?.order;
      orderValue = (lastOrder ?? 0) + 1;
    }
    return orderValue;
  };

  useEffect(() => {
    if (eventDetails) {
      setValue("rally_id", eventDetails?.id ?? "");
      console.log(eventDetails);
      const checkpointsData = eventDetails?.checkpoints ?? [];
      const checkpointNames = checkpointsData.map(
        (cp, index) => `${cp?.name ?? ""}`
      );
      setItems(checkpointNames);
      setCheckpoints(checkpointsData);
      if (isCreate) {
        let orderValue = getOrderValue();
        setValue("order", orderValue);
      }
      // Persist latest event data for reload continuity
      try {
        localStorage.setItem(storageKey, JSON.stringify(eventDetails));
      } catch {}
    }
  }, [eventDetails, isCreate]);

  const handleCheckpointClick = (checkpoint) => {
    // Prepare form data for reset
    const formData = {
      id: checkpoint.id,
      name: checkpoint.name,
      description: checkpoint.description,
      activities: checkpoint.activities,
      order: checkpoint.order,
      rally_id: checkpoint.rallyId,
      _isEditing: true,
    };
    if (checkpoint.departureTime) {
      const date = new Date(checkpoint.departureTime);
      const timeString = `${date.getHours().toString().padStart(2, "0")}:${date
        .getMinutes()
        .toString()
        .padStart(2, "0")}`;
      formData.departure_time = timeString;
    }

    // Set location data
    if (checkpoint.mapboxLocationJson) {
      try {
        const locationData =
          typeof checkpoint.mapboxLocationJson === "string"
            ? JSON.parse(checkpoint.mapboxLocationJson)
            : checkpoint.mapboxLocationJson;
        formData.location_json = locationData;
        setLocationLabel(
          locationData?.features?.[0]?.place_name || "Location selected"
        );
      } catch (e) {
        console.error("Error parsing mapboxLocationJson:", e);
      }
    }

    // Set waypoint data if they exist
    if (checkpoint.mapboxWaypoint1Json) {
      try {
        const waypoint1Data =
          typeof checkpoint.mapboxWaypoint1Json === "string"
            ? JSON.parse(checkpoint.mapboxWaypoint1Json)
            : checkpoint.mapboxWaypoint1Json;
        formData.waypoint1_json = waypoint1Data;
        setWaypoint1Label(
          waypoint1Data?.features?.[0]?.place_name || "Waypoint 1 selected"
        );
      } catch (e) {
        console.error("Error parsing mapboxWaypoint1Json:", e);
      }
    }

    if (checkpoint.mapboxWaypoint2Json) {
      try {
        const waypoint2Data =
          typeof checkpoint.mapboxWaypoint2Json === "string"
            ? JSON.parse(checkpoint.mapboxWaypoint2Json)
            : checkpoint.mapboxWaypoint2Json;
        formData.waypoint2_json = waypoint2Data;
        setWaypoint2Label(
          waypoint2Data?.features?.[0]?.place_name || "Waypoint 2 selected"
        );
      } catch (e) {
        console.error("Error parsing waypoint2_json:", e);
      }
    }

    // Reset form with checkpoint data
    reset(formData);

    // Populate existing images as previews (do not add to files)
    const existingImages = Array.isArray(checkpoint?.images)
      ? checkpoint.images
      : [];
    const previewUrls = existingImages.map((imgId) => getImage(imgId));
    setImagePreviews(previewUrls);
    setImageFiles([]);
  };

  const handleNewCheckpoint = () => {
    reset({
      rally_id: eventDetails?.id ?? "",
      order: getOrderValue(),
      name: "",
      description: "",
      location_json: "",
      waypoint1_json: "",
      waypoint2_json: "",
      departure_time: "",
      _isEditing: false,
    });

    setLocationLabel("");
    setWaypoint1Label("");
    setWaypoint2Label("");

    setImagePreviews([]);
    setImageFiles([]);
  };

  function safeStringifyLocation(raw) {
    const normalized = normalizeMapboxFeature(raw);
    return normalized ? JSON.stringify(normalized) : "";
  }

  const onSubmit = async (data) => {
    const formData = new FormData();
    const {
      location_json,
      waypoint1_json,
      waypoint2_json,
      departure_time,
      ...rest
    } = data;

    const eventDateStr = eventDetails?.startDate
      ? new Date(eventDetails.startDate).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0];
    const departureLocal = toIsoStringOrEmpty(eventDateStr, departure_time);
    if (departureLocal) {
      const departureUTC = new Date(departureLocal).toISOString();
      formData.append("departure_time", departureUTC);
    }

    Object.entries(rest).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (data?.location_json) {
      formData.append(
        "location_json",
        safeStringifyLocation(data.location_json)
      );
    }
    if (data?.waypoint1_json) {
      formData.append(
        "waypoint1_json",
        safeStringifyLocation(data.waypoint1_json)
      );
    }
    if (data?.waypoint2_json) {
      formData.append(
        "waypoint2_json",
        safeStringifyLocation(data.waypoint2_json)
      );
    }

    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    try {
      await createEditCheckpoint(formData).unwrap();
      refetchEvent();
      if (watch("_isEditing")) {
        successToast("Checkpoint Updated successfully");
      } else {
        handleNewCheckpoint();
      }
    } catch (e) {
      errorToast("Error creating checkpoint");
    }
  };

  const sensors = useSensors(useSensor(PointerSensor));
  const [updateCheckpointOrder] = useUpdateCheckpointOrderMutation();

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (isReordering) return;
    if (!over) return;
    if (active.id === over.id) return;

    const oldIndex = items.indexOf(active.id);
    const newIndex = items.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const fromId = checkpoints[oldIndex]?.id;
    const toId = checkpoints[newIndex]?.id;
    if (!fromId || !toId) return;

    setIsReordering(true);
    setItems((prev) => arrayMove(prev, oldIndex, newIndex));
    setCheckpoints((prev) => arrayMove(prev, oldIndex, newIndex));

    updateCheckpointOrder({ from: fromId, to: toId })
      .unwrap()
      .then(() => {
        successToast("Checkpoint order updated");
      })
      .catch(() => {
        refetchEvent();
        errorToast("Could not update order");
      })
      .finally(() => setIsReordering(false));
  };

  const handleDeleteCheckpoint = async (checkpointId) => {
    if (!checkpointId) return;
    try {
      setDeletingId(checkpointId);
      await deleteCheckpoint(checkpointId).unwrap();
      await refetchEvent();
      successToast("Checkpoint deleted");
    } catch (e) {
      errorToast("Could not delete checkpoint");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="container">
      <div className="row">
        <div className="col-md-8">
          <div className="content-area">
            <main id="main" className="main-content">
              <div className="tfcl-dashboard">
                <h1 className="admin-title mb-3">
                  {" "}
                  {watch("_isEditing")
                    ? "Update Checkpoint"
                    : "Create Checkpoint (Optional)"}
                </h1>

                <div className="tfcl-add-listing upload-photo">
                  <h3>Upload Photos</h3>
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
                    {imagePreviews.map((imgSrc, index) => (
                      <div key={index} className="item">
                        <img alt="img" src={imgSrc} width={615} height={405} />
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
                    <h3>Checkpoint Details</h3>
                    <div className="form-group-2">
                      <div className="form-group">
                        <label htmlFor="cp_name">Name *</label>
                        <input
                          id="cp_name"
                          type="text"
                          className="form-control"
                          {...register("name", {
                            required: "Name is required",
                          })}
                          placeholder="Enter checkpoint name"
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
                        <label htmlFor="cp_departure">Departure Time *</label>
                        <input
                          id="cp_departure"
                          type="time"
                          className="form-control"
                          {...register("departure_time", {
                            required: "Departure time is required",
                          })}
                        />
                        {errors.departure_time && (
                          <small
                            style={{ marginLeft: 3 }}
                            className="text-danger"
                          >
                            {errors.departure_time.message}
                          </small>
                        )}
                      </div>
                    </div>

                    <div className="form-group-2">
                      <div className="form-group">
                        <label htmlFor="cp_description">Description *</label>
                        <textarea
                          id="cp_description"
                          className="form-control"
                          rows={4}
                          {...register("description", {
                            required: "Description is required",
                          })}
                          placeholder="Describe the checkpoint"
                        />
                        {errors.description && (
                          <small
                            style={{ marginLeft: 3 }}
                            className="text-danger"
                          >
                            {errors.description.message}
                          </small>
                        )}
                      </div>
                      <div className="form-group">
                        <label htmlFor="cp_activities">Activities</label>
                        <textarea
                          id="cp_activities"
                          className="form-control"
                          rows={4}
                          {...register("activities")}
                          placeholder="List activities"
                        />
                      </div>
                    </div>

                    <div className="form-group-2">
                      <div className="form-group">
                        <label htmlFor="location_json">Location *</label>
                        <div className="d-flex gap-2">
                          <input
                            id="location_json"
                            type="text"
                            className="form-control"
                            readOnly
                            value={locationLabel}
                            placeholder="Select on map"
                            data-bs-toggle="modal"
                            data-bs-target="#mapbox_location_modal"
                            onClick={() => setActiveLocationPicker("location")}
                          />
                          <input
                            type="hidden"
                            {...register("location_json", {
                              required: "Location is required",
                            })}
                          />
                        </div>
                        {errors.location_json && (
                          <small
                            style={{ marginLeft: 3 }}
                            className="text-danger"
                          >
                            {errors.location_json.message}
                          </small>
                        )}
                      </div>

                      {eventDetails?.type === "CUSTOM_DRIVE" && (
                        <div className="form-group">
                          <label htmlFor="waypoint1_json">Waypoint 1 *</label>
                          <div className="d-flex gap-2">
                            <input
                              id="waypoint1_json"
                              type="text"
                              className="form-control"
                              readOnly
                              value={waypoint1Label}
                              placeholder="Select on map"
                              data-bs-toggle="modal"
                              data-bs-target="#mapbox_location_modal"
                              onClick={() =>
                                setActiveLocationPicker("waypoint1")
                              }
                            />
                            <input
                              type="hidden"
                              {...register("waypoint1_json", {
                                required: "Waypoint 1 is required",
                              })}
                            />
                          </div>
                          {errors.waypoint1_json && (
                            <small
                              style={{ marginLeft: 3 }}
                              className="text-danger"
                            >
                              {errors.waypoint1_json.message}
                            </small>
                          )}
                        </div>
                      )}
                    </div>
                    {eventDetails?.type === "CUSTOM_DRIVE" && (
                      <div className="form-group-2">
                        <div className="form-group">
                          <label htmlFor="waypoint2_json">Waypoint 2 *</label>
                          <div className="d-flex gap-2">
                            <input
                              id="waypoint2_json"
                              type="text"
                              className="form-control"
                              readOnly
                              value={waypoint2Label}
                              placeholder="Select on map"
                              data-bs-toggle="modal"
                              data-bs-target="#mapbox_location_modal"
                              onClick={() =>
                                setActiveLocationPicker("waypoint2")
                              }
                            />
                            <input
                              type="hidden"
                              {...register("waypoint2_json", {
                                required: "Waypoint 2 is required",
                              })}
                            />
                          </div>
                          {errors.waypoint2_json && (
                            <small
                              style={{ marginLeft: 3 }}
                              className="text-danger"
                            >
                              {errors.waypoint2_json.message}
                            </small>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="group-button-submit">
                    <button
                      type="button"
                      className="pre-btn"
                      style={{
                        marginRight: "10px",
                        backgroundColor: "#f5f5f5",
                        color: "#333",
                        border: "1px solid #ccc",
                      }}
                      onClick={() => goBack()}
                    >
                      Go Back
                    </button>
                    <button type="submit" className="pre-btn">
                      {updateCheckpointLoading ? (
                        <>
                          <span
                            className="spinner-border spinner-border-sm me-2"
                            role="status"
                            aria-hidden="true"
                          ></span>
                          Saving...
                        </>
                      ) : watch("_isEditing") ? (
                        "Update Checkpoint"
                      ) : (
                        "Create Checkpoint"
                      )}
                    </button>
                    {watch("_isEditing") && (
                      <button
                        type="button"
                        disabled={updateCheckpointLoading}
                        className="pre-btn"
                        style={{
                          marginLeft: "10px",
                          backgroundColor: "#6c757d",
                        }}
                        onClick={handleNewCheckpoint}
                      >
                        New Checkpoint
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={updateCheckpointLoading}
                      className="pre-btn"
                      style={{ marginLeft: "10px", backgroundColor: "green" }}
                      onClick={() => {
                        localStorage.removeItem("createEventDraft");
                        localStorage.removeItem("createCheckpointDraft");
                        window.location.href = "/dashboard";
                      }}
                    >
                      Finish
                    </button>
                  </div>
                </form>
              </div>
            </main>
          </div>
        </div>

        <div className="col-md-4">
          <div className="content-area">
            <div>
              <h1 className="admin-title mb-3 text-center">
                Event Checkpoint List
              </h1>
              {isGetEventLoading ? (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: "100px",
                  }}
                >
                  <span
                    className="spinner-border"
                    style={{ width: "3rem", height: "3rem" }}
                    role="status"
                    aria-hidden="true"
                  ></span>
                </div>
              ) : eventDetails?.checkpoints?.length > 0 ? (
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={items}
                    strategy={verticalListSortingStrategy}
                  >
                    {items.map((item, index) => (
                      <SortableItem
                        key={item}
                        id={item}
                        checkpoint={checkpoints[index]}
                        onCheckpointClick={handleCheckpointClick}
                        onDelete={handleDeleteCheckpoint}
                        isDeleting={deletingId === checkpoints[index]?.id}
                        disabled={isReordering}
                      />
                    ))}
                  </SortableContext>
                </DndContext>
              ) : (
                <div
                  style={{
                    textAlign: "center",
                    color: "#888",
                    padding: "32px 0",
                    fontSize: "1.1rem",
                  }}
                >
                  No existing Checkpoints
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <MapboxLocationModal
        id="mapbox_location_modal"
        eventDetails={eventDetails}
        initialCoordinates={
          activeLocationPicker === "waypoint2"
            ? watch("waypoint2_json")?.query
            : activeLocationPicker === "waypoint1"
            ? watch("waypoint1_json")?.query
            : watch("location_json")?.query
        }
        onSelect={({ coordinates, label, retrievedLocation }) => {
          const display =
            label ||
            `${coordinates[0].toFixed(5)}, ${coordinates[1].toFixed(5)}`;
          if (activeLocationPicker === "waypoint2") {
            setWaypoint2Label(display);
            setValue("waypoint2_json", retrievedLocation, {
              shouldValidate: true,
            });
          } else if (activeLocationPicker === "waypoint1") {
            setWaypoint1Label(display);
            setValue("waypoint1_json", retrievedLocation, {
              shouldValidate: true,
            });
          } else {
            setLocationLabel(display);
            setValue("location_json", retrievedLocation, {
              shouldValidate: true,
            });
          }
        }}
      />
    </div>
  );
}
