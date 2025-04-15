import React, { useEffect, useState } from "react";
import DashboardChart from "./DashboardChart";
import { Link } from "react-router-dom";
import {
  Calendar,
  Search,
  Edit,
  EyeOff,
  Trash2,
  Car,
  MapPin,
  Clock,
  CheckSquare,
} from "lucide-react";

import DropdownSelect from "../common/DropDownSelect";
import Pagination2 from "../common/Pagination2";
import { useGetMyEventsMutation } from "../../redux/slices/api.slice";
import {
  formatDateRange,
  formatDuration,
  metersToMiles,
  getImage,
} from "@/utlis/helpers";

export default function DashBoard() {
  const [getMyEvents, { data: eventsData, isLoading }] =
    useGetMyEventsMutation();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    getMyEvents();
  }, [getMyEvents]);

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

  return (
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
                                  {events?.filter((e) => !e.isActive).length ||
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
                        <h5 className="title-dashboard-table">Your Rallies</h5>
                        <div className="row">
                          <div className="col-xl-3 col-lg-6 mb-2">
                            <div className="group-input-icon search">
                              <input
                                type="text"
                                name="title_search"
                                id="title_search"
                                defaultValue=""
                                placeholder="Search..."
                              />
                              <span className="datepicker-icon">
                                <Search size={18} />
                              </span>
                            </div>
                          </div>
                          <div className="col-xl-3 col-lg-6 mb-2">
                            <div className="group-input-icon">
                              <input
                                type="text"
                                id="from-date"
                                className="datetimepicker hasDatepicker"
                                name="from_date"
                                defaultValue=""
                                placeholder="From Date"
                              />
                              <span className="datepicker-icon">
                                <Calendar size={18} />
                              </span>
                            </div>
                          </div>
                          <div className="col-xl-3 col-lg-6 mb-2">
                            <div className="group-input-icon">
                              <input
                                type="text"
                                id="to-date"
                                className="datetimepicker hasDatepicker"
                                name="to_date"
                                defaultValue=""
                                placeholder="To Date"
                              />
                              <span className="datepicker-icon">
                                <Calendar size={18} />
                              </span>
                            </div>
                          </div>
                          <div className="col-xl-3 col-lg-6 mb-2">
                            <DropdownSelect
                              addtionalParentClass="form-control"
                              defaultOption={"Select Status"}
                              options={["Active", "Inactive"]}
                            />
                          </div>
                        </div>
                        <div className="tfcl-table-listing">
                          <div className="table-responsive">
                            <span className="result-text">
                              <b>{events?.length || 0}</b> results found
                            </span>
                            <table className="table" >
                              <thead>
                                <tr>
                                  <th>Rally</th>
                                  <th>Status</th>
                                  <th>Type</th>
                                  <th>Date</th>
                                  <th>Distance-Duration</th>
                                  <th>Action</th>
                                </tr>
                              </thead>
                              <tbody className="tfcl-table-content">
                                {isLoading ? (
                                  <tr>
                                    <td colSpan="6" className="text-center">
                                      Loading...
                                    </td>
                                  </tr>
                                ) : events && events.length > 0 ? (
                                  events.map((event, i) => (
                                    <tr key={i}>
                                      <td className="column-listing" >
                                        <div className="tfcl-listing-product">
                                          <Link
                                            to={`/event-detail/${event.id}`}
                                          >
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
                                              <Link
                                                to={`/event-detail/${event.id}`}
                                              >
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
                                      <td className="column-status">
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
                                      <td className="column-date">
                                        <div className="tfcl-listing-date">
                                          {event.type?.replace(/_/g, " ")}
                                        </div>
                                      </td>
                                      <td className="column-date">
                                        <div className="tfcl-listing-date">
                                          {formatDateRange(
                                            event.startDate || "",
                                            event.endDate || ""
                                          )}
                                        </div>
                                      </td>
                                      <td className="column-date">
                                        <div className="tfcl-listing-date">
                                          {metersToMiles(event.distance)} -{" "}
                                          {formatDuration(event.duration)}
                                        </div>
                                      </td>
                                      <td className="column-controller">
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
                                      </td>
                                    </tr>
                                  ))
                                ) : (
                                  <tr>
                                    <td colSpan="6" className="text-center">
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
                {/* <div className="tfcl-page-insight tfcl-dashboard-listing">
                  <h5 className="mb-2">Page Insights</h5>
                  <div className="row">
                    <div className="col-md-12">
                      <div className="group-insight-controller">
                        <div className="group-btn-insignt">
                          <button>Day</button>
                          <button>Week</button>
                          <button>Month</button>
                          <button>Year</button>
                        </div>
                        <div className="group-input-insight">
                          <div className="group-input-icon">
                            <input
                              type="text"
                              id="from-date"
                              className="datetimepicker hasDatepicker"
                              name="from_date"
                              defaultValue=""
                              placeholder="From Date"
                            />
                            <span className="datepicker-icon">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={19}
                                height={18}
                                viewBox="0 0 19 18"
                                fill="none"
                              >
                                <path
                                  d="M5.5625 2.25V3.9375M13.4375 2.25V3.9375M2.75 14.0625V5.625C2.75 5.17745 2.92779 4.74823 3.24426 4.43176C3.56072 4.11529 3.98995 3.9375 4.4375 3.9375H14.5625C15.0101 3.9375 15.4393 4.11529 15.7557 4.43176C16.0722 4.74823 16.25 5.17745 16.25 5.625V14.0625M2.75 14.0625C2.75 14.5101 2.92779 14.9393 3.24426 15.2557C3.56072 15.5722 3.98995 15.75 4.4375 15.75H14.5625C15.0101 15.75 15.4393 15.5722 15.7557 15.2557C16.0722 14.9393 16.25 14.5101 16.25 14.0625M2.75 14.0625V8.4375C2.75 7.98995 2.92779 7.56073 3.24426 7.24426C3.56072 6.92779 3.98995 6.75 4.4375 6.75H14.5625C15.0101 6.75 15.4393 6.92779 15.7557 7.24426C16.0722 7.56073 16.25 7.98995 16.25 8.4375V14.0625M9.5 9.5625H9.506V9.5685H9.5V9.5625ZM9.5 11.25H9.506V11.256H9.5V11.25ZM9.5 12.9375H9.506V12.9435H9.5V12.9375ZM7.8125 11.25H7.8185V11.256H7.8125V11.25ZM7.8125 12.9375H7.8185V12.9435H7.8125V12.9375ZM6.125 11.25H6.131V11.256H6.125V11.25ZM6.125 12.9375H6.131V12.9435H6.125V12.9375ZM11.1875 9.5625H11.1935V9.5685H11.1875V9.5625ZM11.1875 11.25H11.1935V11.256H11.1875V11.25ZM11.1875 12.9375H11.1935V12.9435H11.1875V12.9375ZM12.875 9.5625H12.881V9.5685H12.875V9.5625ZM12.875 11.25H12.881V11.256H12.875V11.25Z"
                                  stroke="#B6B6B6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </div>
                          <div className="group-input-icon">
                            <input
                              type="text"
                              id="from-date"
                              className="datetimepicker hasDatepicker"
                              name="from_date"
                              defaultValue=""
                              placeholder="To date"
                            />
                            <span className="datepicker-icon">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width={19}
                                height={18}
                                viewBox="0 0 19 18"
                                fill="none"
                              >
                                <path
                                  d="M5.5625 2.25V3.9375M13.4375 2.25V3.9375M2.75 14.0625V5.625C2.75 5.17745 2.92779 4.74823 3.24426 4.43176C3.56072 4.11529 3.98995 3.9375 4.4375 3.9375H14.5625C15.0101 3.9375 15.4393 4.11529 15.7557 4.43176C16.0722 4.74823 16.25 5.17745 16.25 5.625V14.0625M2.75 14.0625C2.75 14.5101 2.92779 14.9393 3.24426 15.2557C3.56072 15.5722 3.98995 15.75 4.4375 15.75H14.5625C15.0101 15.75 15.4393 15.5722 15.7557 15.2557C16.0722 14.9393 16.25 14.5101 16.25 14.0625M2.75 14.0625V8.4375C2.75 7.98995 2.92779 7.56073 3.24426 7.24426C3.56072 6.92779 3.98995 6.75 4.4375 6.75H14.5625C15.0101 6.75 15.4393 6.92779 15.7557 7.24426C16.0722 7.56073 16.25 7.98995 16.25 8.4375V14.0625M9.5 9.5625H9.506V9.5685H9.5V9.5625ZM9.5 11.25H9.506V11.256H9.5V11.25ZM9.5 12.9375H9.506V12.9435H9.5V12.9375ZM7.8125 11.25H7.8185V11.256H7.8125V11.25ZM7.8125 12.9375H7.8185V12.9435H7.8125V12.9375ZM6.125 11.25H6.131V11.256H6.125V11.25ZM6.125 12.9375H6.131V12.9435H6.125V12.9375ZM11.1875 9.5625H11.1935V9.5685H11.1875V9.5625ZM11.1875 11.25H11.1935V11.256H11.1875V11.25ZM11.1875 12.9375H11.1935V12.9435H11.1875V12.9375ZM12.875 9.5625H12.881V9.5685H12.875V9.5625ZM12.875 11.25H12.881V11.256H12.875V11.25Z"
                                  stroke="#B6B6B6"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                />
                              </svg>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="map-chart">
                    <DashboardChart />
                  </div>
                </div>
                <div className="tfcl-dashboard-middle-right">
                  <div className="tfcl-card tfcl-dashboard-reviews">
                    <h5>Recent Reviews</h5>
                    <ul>
                      <li className="comment-by-user">
                        <div className="group-author">
                          <img
                            loading="lazy"
                            className="avatar"
                            width={56}
                            height={56}
                            alt="avatar"
                            src="/assets/images/dashboard/rate4.png"
                          />
                          <div className="group-name">
                            <div className="review-name">
                              <b>Bessie Cooper</b>
                              <span className="review-date">3 days ago</span>
                            </div>
                          </div>
                        </div>
                        <div className="content">
                          <p>
                            Maecenas eu lorem et urna accumsan vestibulum vel
                            vitae magna.
                          </p>
                        </div>
                        <div className="rating-wrap">
                          <div className="form-group">
                            <div className="star-rating-review">
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={1}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={2}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={3}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={4}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={5}
                              />
                            </div>
                          </div>
                        </div>
                      </li>
                      <li className="comment-by-user">
                        <div className="group-author">
                          <img
                            loading="lazy"
                            className="avatar"
                            width={56}
                            height={56}
                            alt="avatar"
                            src="/assets/images/dashboard/rate3.png"
                          />
                          <div className="group-name">
                            <div className="review-name">
                              <b>Annette Black</b>
                              <span className="review-date">3 days ago</span>
                            </div>
                          </div>
                        </div>
                        <div className="content">
                          <p>
                            Nullam rhoncus dolor arcu, et commodo tellus semper
                            vitae. Aenean finibus tristique lectus, ac lobortis
                            mauris venenatis ac.
                          </p>
                        </div>
                        <div className="rating-wrap">
                          <div className="form-group">
                            <div className="star-rating-review">
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={1}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={2}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={3}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={4}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={5}
                              />
                            </div>
                          </div>
                        </div>
                      </li>
                      <li className="comment-by-user">
                        <div className="group-author">
                          <img
                            loading="lazy"
                            className="avatar"
                            width={56}
                            height={56}
                            alt="avatar"
                            src="/assets/images/dashboard/rate2.png"
                          />
                          <div className="group-name">
                            <div className="review-name">
                              <b>Ralph Edwards</b>
                              <span className="review-date">3 days ago</span>
                            </div>
                          </div>
                        </div>
                        <div className="content">
                          <p>
                            Lorem ipsum dolor sit amet, consectetur adipiscing
                            elit. Vivamus viverra semper convallis. Integer
                            vestibulum tempus tincidunt.
                          </p>
                        </div>
                        <div className="rating-wrap">
                          <div className="form-group">
                            <div className="star-rating-review">
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={1}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={2}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={3}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={4}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={5}
                              />
                            </div>
                          </div>
                        </div>
                      </li>
                      <li className="comment-by-user">
                        <div className="group-author">
                          <img
                            loading="lazy"
                            className="avatar"
                            width={56}
                            height={56}
                            alt="avatar"
                            src="/assets/images/dashboard/rate1.png"
                          />
                          <div className="group-name">
                            <div className="review-name">
                              <b>Jerome Bell</b>
                              <span className="review-date">3 days ago</span>
                            </div>
                          </div>
                        </div>
                        <div className="content">
                          <p>
                            Fusce sit amet purus eget quam eleifend hendrerit
                            nec a erat. Sed turpis neque, iaculis blandit
                            viverra ut, dapibus eget nisi.
                          </p>
                        </div>
                        <div className="rating-wrap">
                          <div className="form-group">
                            <div className="star-rating-review">
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={1}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={2}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={3}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={4}
                              />
                              <i
                                className="star disabled-click icon-autodeal-star active"
                                data-rating={5}
                              />
                            </div>
                          </div>
                        </div>
                      </li>
                    </ul>
                  </div>
                </div> */}
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}
