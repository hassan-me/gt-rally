import React, { useEffect, useState, useMemo } from "react";
import DashboardChart from "./DashboardChart";
import { Link } from "react-router-dom";
import {
  Award,
  Search,
  Edit,
  EyeOff,
  Trash2,
  Car,
  MapPin,
  Clock,
  CheckSquare,
  Star
} from "lucide-react";

import DropdownSelect from "../common/DropDownSelect";
import Pagination2 from "../common/Pagination2";
import { useGetMyEventsQuery } from "../../redux/slices/api.slice";
import {
  formatDateRange,
  formatDuration,
  metersToMiles,
  getImage,
} from "@/utlis/helpers";
import MapWithRadius from "../common/MapWithRadius";
import SponsorForm from "../otherPages/SponsorForm";
import { Modal } from "bootstrap";
import Toast from "../common/Toast";

export default function DashBoard() {
  const { data: eventsData, isLoading, error } = useGetMyEventsQuery();

  const [filteredEvents, setFilteredEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRow, setSelectedRow] = useState(null);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [showToast, setShowToast] = useState(false);
  const [sponsoredEventIds, setSponsoredEventIds] = useState([]);

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
    if (events?.length > 0) {
      const filterdata = events.filter((event) => {
        const typeMatch = selectedType ? event.type === selectedType : true;
        const SearchMatch = event.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase());

        return typeMatch && SearchMatch;
      });
      setFilteredEvents(filterdata);
    }
  }, [selectedType, events, searchQuery]);


  const handleSponserModalSubmit = () => {
    setSponsoredEventIds([...sponsoredEventIds, selectedRow.id])
    Modal.getInstance(document.getElementById("popup_bid_sponser"))?.hide();
    setToastMessage(
      "Sponsorship inquiry submitted successfully! We'll contact you soon."
    );
    setToastType("success");
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 5000);
  };

  const isEventSponsored = (eventId) => {
    return sponsoredEventIds.includes(eventId);
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
                              <h5>Your Rallies</h5>
                              <div className="tfcl-dashboard-title">
                                <div className="listing-text d-flex">
                                  <b>{events?.length || 0} </b>
                                  <div className="per">/50 remaining</div>
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
                              <Clock size={36} />
                            </div>
                            <div className="content-overview">
                              <h5>Pending</h5>
                              <div className="tfcl-dashboard-title">
                                <span>
                                  <b>
                                    {events?.filter((e) => !e.isActive)
                                      .length || 0}
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
                              <CheckSquare size={36} />
                            </div>
                            <div className="content-overview">
                              <h5>Active</h5>
                              <div className="tfcl-dashboard-title">
                                <span>
                                  <b>
                                    {events?.filter((e) => e.isActive).length ||
                                      0}
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
                              <MapPin size={36} />
                            </div>
                            <div className="content-overview">
                              <h5>Checkpoints</h5>
                              <div className="tfcl-dashboard-title">
                                <span>
                                  <b>
                                    {events?.reduce(
                                      (acc, event) =>
                                        acc + (event.checkpoints?.length || 0),
                                      0
                                    )}
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
                        
                            <MapWithRadius />
                         
                          <div className="row">
                            <div className="col-xl-3 col-lg-6 mb-2">
                              <div className="group-input-icon search">
                                <input
                                  type="text"
                                  name="title_search"
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
                            <div className="col-xl-3 col-lg-6 mb-2">
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
                                style={{width: "100%" }}
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
                                    <th style={{ textAlign: "center" }}>Type</th>
                                    <th style={{ textAlign: "center" }}>Date</th>
                                    <th style={{ textAlign: "center" }}>
                                      Distance-Duration
                                    </th>
                                    <th style={{ textAlign: "center" }}>
                                      Sponsored
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
                                      <tr key={i}>
                                        <td className="column-listing">
                                          <div className="tfcl-listing-product">
                                            <Link to={`/events/${event.id}`}>
                                              <img
                                                alt="Rally thumbnail"
                                                src={
                                                  event.thumbnail[0]
                                                    ? getImage(event.thumbnail[0])
                                                    : "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Image_not_available.png/800px-Image_not_available.png"
                                                }
                                                width={168}
                                                height={95}
                                              />
                                            </Link>
                                            <div className="tfcl-listing-summary">
                                              <h4 className="tfcl-listing-title">
                                                <Link to={`/events/${event.id}`}>
                                                  {event.name}
                                                </Link>
                                              </h4>
                                              <div className="features-text">
                                                {event.startMapboxDistrict ||
                                                  "No points of interest"}{" "}
                                                - {event.checkpoints?.length || 0}{" "}
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
                                          style={{
                                            textAlign: "center",
                                            paddingRight: "20px",
                                          }}
                                          className="column-date"
                                        >
                                          <div className="tfcl-listing-date">
                                          {isEventSponsored(event.id) ? (
                                            <div>
                                              <Star size={20} fill="#FFD700" color="#FFD700" />
                                              <span className="ms-1 text-warning">Sponsored</span>
                                            </div>
                                          ) : (
                                            <span className="text-muted">Not Sponsored</span>
                                          )}
                                          </div>
                                        </td>
                                    
                                        <td className="column-controller" style={{ verticalAlign: "middle" }}>

                                          <div className="inner-controller">
                                            <span className="icon">
                                              <Edit size={16} />
                                            </span>{" "}
                                            <a
                                              href="#"
                                              className="btn-action tfcl-dashboard-action-edit"
                                            >
                                              Edit
                                            </a>
                                          </div>
                                          <div className="inner-controller">
                                            <span className="icon">
                                              <EyeOff size={16} />
                                            </span>{" "}
                                            <a
                                              href="#"
                                              className="btn-action tfcl-dashboard-action-edit"
                                            >
                                              {event.is_active
                                                ? "Deactivate"
                                                : "Activate"}
                                            </a>
                                          </div>
                                          <div className="inner-controller">
                                            <span className="icon">
                                              <Trash2 size={16} />
                                            </span>{" "}
                                            <a
                                              href="#"
                                              className="btn-action tfcl-dashboard-action-edit"
                                            >
                                              Delete
                                            </a>
                                          </div>
                                          {!isEventSponsored(event.id) && (
                                            <div className="inner-controller">
                                              <span className="icon">
                                                <Award size={16} />
                                              </span>{" "}
                                              <a
                                                href="#"
                                                data-bs-toggle="modal"
                                                data-bs-target="#popup_bid_sponser"
                                                className="btn-action tfcl-dashboard-action-edit"
                                                onClick={() => setSelectedRow(event)}
                                              >
                                                Sponsor
                                              </a>
                                            </div>
                                          )}
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
                            <div className="themesflat-pagination clearfix mt-40">
                              <ul>
                                <Pagination2 />
                              </ul>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div
                    className="modal fade popup login-form"
                    id="popup_bid_sponser"
                    tabIndex={-1}
                    aria-hidden="true"
                  >
                    <div
                      className="modal-dialog modal-dialog-centered"
                      role="document"
                    >
                      <div className="modal-content">
                        <button
                          type="button"
                          className="close"
                          data-bs-dismiss="modal"
                          aria-label="Close"
                        >
                          <span aria-hidden="true">×</span>
                        </button>
                        <div className="modal-body space-y-20 pd-40">
                          {selectedRow && (
                            <SponsorForm
                              modal={true}
                              event={selectedRow}
                              onFormsubmit={handleSponserModalSubmit}
                            />
                          )}
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
    </>
  );
}