import React, { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Award, Search, Edit, Trash2, Car, Star } from "lucide-react";

import DropdownSelect from "../common/DropDownSelect";
import Pagination2 from "../common/Pagination2";
import {
  useGetMyEventsQuery,
  useDeleteEventMutation,
} from "../../redux/slices/api.slice";
import {
  formatDateRange,
  formatDuration,
  metersToMiles,
  getImage,
} from "@/utlis/helpers";
import MapWithRadius from "../common/MapWithRadius";
import Toast, { errorToast, successToast } from "../common/Toast";
import RallyMasterInviteModal from "../modals/RallyMasterInvite";

export default function DashBoard() {
  const { data: eventsData, isLoading, refetch } = useGetMyEventsQuery();
  const [deleteEvent, { isLoading: isDeleting }] = useDeleteEventMutation();
  const navigate = useNavigate();

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [mapFilteredIds, setMapFilteredIds] = useState(null);
  const [mapInteracted, setMapInteracted] = useState(false);
  const [numberOfVehicles, setNumberOfVehicles] = useState(0);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showToast, setShowToast] = useState(false);

  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteRallyId, setInviteRallyId] = useState(null);

  useEffect(() => {
    if (eventsData) {
      const parsedData = eventsData.map((event) => {
        let thumbnail = event.thumbnail;
        let thumbnail_url = event.thumbnail_url;

        try {
          if (typeof thumbnail === "string") {
            thumbnail = JSON.parse(thumbnail);
          }
          if (typeof thumbnail_url === "string") {
            thumbnail_url = JSON.parse(thumbnail_url);
          }
        } catch (err) {
          console.error("Thumbnail parsing failed:", err, event);
        }

        return {
          ...event,
          thumbnail,
          thumbnail_url,
        };
      });

      setEvents(parsedData);
    }
  }, [eventsData]);

  const typeMap = useMemo(() => {
    const rawTypes = [...new Set(events.map((e) => e.type))];

    return {
      All: null,
      ...Object.fromEntries(
        rawTypes.map((type) => [type.replace(/_/g, " "), type])
      ),
    };
  }, [events]);

  useEffect(() => {
    const base = events.filter((event) => {
      const typeMatch = selectedType ? event.type === selectedType : true;
      const searchMatch = event.name
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      return typeMatch && searchMatch;
    });
    const withMap =
      mapFilteredIds === null
        ? base
        : base.filter((e) => mapFilteredIds.has(e.id));
    setFilteredEvents(withMap);
  }, [selectedType, events, searchQuery, mapFilteredIds]);

  const onDeleteEvent = async (id) => {
    try {
      await deleteEvent(id).unwrap();
      setEvents((prev) => prev.filter((e) => e.id !== id));
      refetch();
      successToast("Event has been Deleted");
    } catch (e) {
      errorToast("Error Deleting Event");
    }
  };

  return (
    <>
      <div className="container">
        <div className="row">
          <div className="col-md-12">
            <div className="content-area">
              <main id="main" className="main-content">
                <div className="tfcl-dashboard">
                  <h1 className="admin-title">Dashboard</h1>
                  <div className="tfcl-dashboard-overview">
                    <div className="row">
                      <div className="col-sm-6 col-xl-3">
                        <a className="tfcl-card" href="#">
                          <div className="card-body">
                            <div className="tfcl-icon-overview">
                              <Car size={36} />
                            </div>
                            <div className="content-overview">
                              <h5>Total Events</h5>
                              <div className="tfcl-dashboard-title">
                                <div className="listing-text d-flex">
                                  <b>{events?.length || 0} </b>
                                </div>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                      <div className="col-sm-6 col-xl-3">
                        <a className="tfcl-card" href="#">
                          <div className="card-body">
                            <div className="tfcl-icon-overview">
                              <Car size={36} />
                            </div>
                            <div className="content-overview">
                              <h5>Grand Touring Rallies</h5>
                              <div className="tfcl-dashboard-title">
                                <span>
                                  <b>
                                    {events?.filter(
                                      (e) => e.type === "GRAND_TOURING_RALLY"
                                    ).length || 0}
                                  </b>
                                </span>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                      <div className="col-sm-6 col-xl-3">
                        <a className="tfcl-card" href="#">
                          <div className="card-body">
                            <div className="tfcl-icon-overview">
                              <Car size={36} />
                            </div>
                            <div className="content-overview">
                              <h5>Custom Drive</h5>
                              <div className="tfcl-dashboard-title">
                                <span>
                                  <b>
                                    {events?.filter(
                                      (e) => e.type === "CUSTOM_DRIVE"
                                    ).length || 0}
                                  </b>
                                </span>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                      <div className="col-sm-6 col-xl-3">
                        <a className="tfcl-card" href="#">
                          <div className="card-body">
                            <div className="tfcl-icon-overview">
                              <Car size={36} />
                            </div>
                            <div className="content-overview">
                              <h5>Car Meets</h5>
                              <div className="tfcl-dashboard-title">
                                <span>
                                  <b>
                                    {events?.filter(
                                      (e) => e.type === "CAR_MEETS"
                                    ).length || 0}
                                  </b>
                                </span>
                              </div>
                            </div>
                          </div>
                        </a>
                      </div>
                    </div>
                  </div>
                  <div className="tfcl-dashboard-middle mt-2">
                    <div className="row">
                      <div className="tfcl-dashboard-middle-left col-md-12">
                        <div className="tfcl-dashboard-listing">
                          <h5 className="title-dashboard-table">
                            Your Rallies
                          </h5>

                          <MapWithRadius
                            events={events}
                            onFilter={(evts) => {
                              if (!Array.isArray(evts)) {
                                setMapFilteredIds(null);
                                return;
                              }
                              if (evts.length === 0) {
                                setMapFilteredIds(
                                  mapInteracted ? new Set() : null
                                );
                                return;
                              }
                              setMapFilteredIds(new Set(evts.map((e) => e.id)));
                            }}
                            onUserInteraction={() => setMapInteracted(true)}
                          />

                          <div className="row mt-3">
                            <div className="col-xl-4 col-lg-6 mb-2">
                              <div className="group-input-icon search">
                                <input
                                  type="text"
                                  name="title_search"
                                  className="form-control"
                                  id="title_search"
                                  defaultValue=""
                                  placeholder="Search..."
                                  onChange={(e) =>
                                    setSearchQuery(e.target.value)
                                  }
                                />
                                <span className="datepicker-icon">
                                  <Search size={18} />
                                </span>
                              </div>
                            </div>
                            <div className="col-xl-3 col-lg-2 col-md-2 mb-2">
                              <DropdownSelect
                                addtionalParentClass="form-control"
                                defaultOption={"Select Type"}
                                options={Object.keys(typeMap)}
                                onChange={(value) => {
                                  setSelectedType(typeMap[value]);
                                }}
                              />
                            </div>
                          </div>
                          <div className="tfcl-table-listing">
                            <div className="table-responsive">
                              <span className="result-text">
                                <b>{events?.length || 0}</b> results found
                              </span>
                              <table
                                className="table"
                                style={{ width: "100%" }}
                              >
                                <thead>
                                  <tr>
                                    <th
                                      style={{
                                        textAlign: "center",
                                        width: "30%",
                                      }}
                                    >
                                      Rally
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      Status
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      Type
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      Date
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      Distance-Duration
                                    </th>

                                    <th style={{ textAlign: "center" }}>
                                      Action
                                    </th>
                                  </tr>
                                </thead>
                                <tbody className="tfcl-table-content">
                                  {isLoading ? (
                                    <tr>
                                      <td colSpan="7" className="text-center">
                                        Loading...
                                      </td>
                                    </tr>
                                  ) : filteredEvents &&
                                    filteredEvents.length > 0 ? (
                                    filteredEvents.map((event, i) => (
                                      <tr key={event.id}>
                                        <td className="column-listing">
                                          <div className="tfcl-listing-product">
                                            <Link to={`/events/${event.id}`}>
                                              <img
                                                alt="Rally thumbnail"
                                                src={
                                                  event.thumbnail[0]
                                                    ? getImage(
                                                        event.thumbnail[0]
                                                      )
                                                    : "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Image_not_available.png/800px-Image_not_available.png"
                                                }
                                                width={168}
                                                height={95}
                                              />
                                            </Link>
                                            <div className="tfcl-listing-summary">
                                              <h4 className="tfcl-listing-title">
                                                <Link
                                                  to={`/events/${event.id}`}
                                                >
                                                  {event.name}
                                                </Link>
                                              </h4>
                                              <div className="features-text">
                                                {event.startMapboxDistrict ||
                                                  "No points of interest"}{" "}
                                                -{" "}
                                                {event.checkpoints?.length || 0}{" "}
                                                checkpoints
                                              </div>
                                              <div className="price">
                                                <div className="inner tfcl-listing-price">
                                                  {event.noOfVehicles} vehicles
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </td>
                                        <td
                                          className="column-status"
                                          style={{
                                            textAlign: "center",
                                            paddingRight: "30px",
                                            paddingTop: "60px",
                                          }}
                                        >
                                          <span
                                            className={`tfcl-listing-status status-${
                                              event.isActive
                                                ? "publish"
                                                : "pending"
                                            }`}
                                          >
                                            {event.isActive
                                              ? "Active"
                                              : "Inactive"}
                                          </span>
                                        </td>
                                        <td
                                          style={{
                                            textAlign: "center",
                                            paddingRight: "30px",
                                          }}
                                          className="column-date"
                                        >
                                          <div className="tfcl-listing-date">
                                            {event.type?.replace(/_/g, " ")}
                                          </div>
                                        </td>
                                        <td
                                          style={{
                                            textAlign: "center",
                                            paddingRight: "30px",
                                          }}
                                          className="column-date"
                                        >
                                          <div className="tfcl-listing-date">
                                            {formatDateRange(
                                              event.startDate || "",
                                              event.endDate || ""
                                            )}
                                          </div>
                                        </td>
                                        <td
                                          style={{
                                            textAlign: "center",
                                            paddingRight: "30px",
                                          }}
                                          className="column-date"
                                        >
                                          <div className="tfcl-listing-date">
                                            {metersToMiles(event.distance)} -{" "}
                                            {formatDuration(event.duration)}
                                          </div>
                                        </td>

                                        <td
                                          className="column-controller"
                                          style={{ verticalAlign: "middle" }}
                                        >
                                          <div className="inner-controller">
                                            <span className="icon">
                                              <Edit size={16} />
                                            </span>{" "}
                                            <a
                                              href="#"
                                              className="btn-action tfcl-dashboard-action-edit"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                navigate("/update-event", {
                                                  state: { rallyId: event.id },
                                                });
                                              }}
                                            >
                                              Edit
                                            </a>
                                          </div>

                                          <div className="inner-controller">
                                            <span className="icon">
                                              <Trash2 size={16} />
                                            </span>{" "}
                                            <a
                                              onClick={(e) => {
                                                e.preventDefault();
                                                if (!isDeleting) {
                                                  onDeleteEvent(event.id);
                                                }
                                              }}
                                              href="#"
                                              className="btn-action tfcl-dashboard-action-edit"
                                              style={{
                                                position: "relative",
                                                pointerEvents: isDeleting
                                                  ? "none"
                                                  : "auto",
                                                opacity: isDeleting ? 0.6 : 1,
                                              }}
                                            >
                                              {isDeleting ? (
                                                <span
                                                  className="spinner-border spinner-border-sm me-1"
                                                  role="status"
                                                  aria-hidden="true"
                                                  style={{
                                                    verticalAlign: "middle",
                                                  }}
                                                ></span>
                                              ) : (
                                                "Delete"
                                              )}
                                            </a>
                                          </div>

                                          <div className="inner-controller text-nowrap">
                                            <span className="icon">
                                              <Award size={16} />
                                            </span>{" "}
                                            <a
                                              href="#"
                                              className="btn-action text-nowrap tfcl-dashboard-action-edit"
                                              onClick={(e) => {
                                                e.preventDefault();
                                                setInviteRallyId(event.id);
                                                setShowInviteModal(true);
                                                setNumberOfVehicles(
                                                  event.noOfVehicles
                                                );
                                              }}
                                            >
                                              Manage Participants
                                            </a>
                                          </div>
                                        </td>
                                      </tr>
                                    ))
                                  ) : (
                                    <tr>
                                      <td colSpan="7" className="text-center">
                                        No rallies found
                                      </td>
                                    </tr>
                                  )}
                                </tbody>
                              </table>
                            </div>
                            {/* <div className="themesflat-pagination clearfix mt-40">
                              <ul>
                                <Pagination2 />
                              </ul>
                            </div> */}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
        </div>
      </div>
      {showInviteModal && (
        <RallyMasterInviteModal
          rallyId={inviteRallyId}
          noOfVehicles={numberOfVehicles}
          show={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          onSuccess={() => {
            setShowInviteModal(false);
          }}
        />
      )}
    </>
  );
}
