import React, { useRef, useEffect } from "react";
import Slider3 from "./sliders/Slider3";

import { Swiper, SwiperSlide } from "swiper/react";
import Overview from "./detailComponents/Overview";
import { Navigation, Pagination } from "swiper/modules";
import LoanCalculator from "./detailComponents/LoanCalculator";
import CarReview from "./detailComponents/CarReview";
import ProfileInfo from "./detailComponents/ProfileInfo";
import Recommended from "./detailComponents/Recommended";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { allCars, eventData } from "@/data/cars";
import SidebarToggleButton from "./SidebarToggleButton";
import { formatDuration, getImage, metersToMiles } from "@/utlis/helpers";
import { EventType } from "@/constants";
export default function EventDetails({ eventDetail }) {
  console.log("--> ", eventDetail);
  const mapContainer = useRef(null);
  console.log("--> process.env", import.meta.env);

  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      zoom: 14,
    });

    // For car meets, just show the starting location marker
    if (eventDetail.type === EventType.CAR_MEETS.type) {
      if (eventDetail.start_latitude && eventDetail.start_longitude) {
        map.on("load", () => {
          // Center map on start location
          map.setCenter([
            eventDetail.start_longitude,
            eventDetail.start_latitude,
          ]);

          // Add marker for the start location
          new mapboxgl.Marker({ color: "red", scale: 1.5 })
            .setLngLat([
              eventDetail.start_longitude,
              eventDetail.start_latitude,
            ])
            .addTo(map);
        });
      }
    } else {
      // Your existing route drawing code for other event types
      if (eventDetail.route_json) {
        try {
          const routeData = JSON.parse(eventDetail.route_json);
          if (Array.isArray(routeData) && routeData.length) {
            map.on("load", () => {
              const geoJson = {
                type: "Feature",
                geometry: {
                  type: "LineString",
                  coordinates: routeData,
                },
              };

              map.addSource("route", {
                type: "geojson",
                data: geoJson,
              });

              map.addLayer({
                id: "route-layer",
                type: "line",
                source: "route",
                layout: {
                  "line-join": "round",
                  "line-cap": "round",
                },
                paint: {
                  "line-color": "#1DA1F2",
                  "line-width": 4,
                },
              });

              const bounds = new mapboxgl.LngLatBounds();
              routeData.forEach((coord) => bounds.extend(coord));
              map.fitBounds(bounds, { padding: 50 });

              const startCoord = routeData[0];
              const endCoord = routeData[routeData.length - 1];

              if (Array.isArray(eventDetail.checkpoints)) {
                eventDetail.checkpoints?.forEach(({ latitude, longitude }) => {
                  new mapboxgl.Marker({ color: "orange" })
                    .setLngLat([longitude, latitude])
                    .addTo(map);
                });
              }

              new mapboxgl.Marker({ color: "red", scale: 1.5 })
                .setLngLat(startCoord)
                .addTo(map);

              if (
                startCoord[0] === endCoord[0] &&
                startCoord[1] === endCoord[1]
              ) {
                // Use a smaller size for the overlapping end marker
                new mapboxgl.Marker({ color: "green", scale: 1.0 })
                  .setLngLat(endCoord)
                  .addTo(map);
              } else {
                new mapboxgl.Marker({ color: "green", scale: 1.5 })
                  .setLngLat(endCoord)
                  .addTo(map);
              }
            });
          }
        } catch (error) {
          console.error("Invalid route data:", error);
        }
      }
    }

    return () => map.remove();
  }, []);

  const swiperOptions = {
    speed: 1000,
    spaceBetween: 30,
    pagination: {
      el: ".spd11",
      clickable: true,
    },
    navigation: {
      nextEl: ".snbn10",
      prevEl: ".snbp10",
    },
    breakpoints: {
      0: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      600: {
        slidesPerView: 2,
        spaceBetween: 20,
      },
      991: {
        slidesPerView: 3,
      },
      1200: {
        slidesPerView: 4,
      },
    },
  };

  return (
    <>
      <section className="tf-section3 listing-detail style-2">
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <div className="heading-widget flex-one mb-20 flex-wrap">
                <div className="inner">
                  <h1 className="title">{eventDetail.name}</h1>
                  <div className="icon-box flex flex-wrap">
                    <div className="icons flex-three">
                      <i className="icon-autodeal-km1" />
                      &nbsp;
                      <span>{eventDetail.no_of_vehicles} vehicles</span>
                    </div>
                    {eventDetail.type !== EventType.CAR_MEETS.type && (
                      <>
                        <div className="icons flex-three">
                          <i className="icon-autodeal-diesel" />
                          &nbsp;
                          <span>
                            {metersToMiles(eventDetail.distance)} miles
                          </span>
                        </div>
                        <div className="icons flex-three">
                          <i className="icon-autodeal-automatic" />
                          &nbsp;
                          <span>{formatDuration(eventDetail.duration)}</span>
                        </div>
                        <div className="icons flex-three">
                          <i className="icon-autodeal-owner" />
                          &nbsp;
                          <span>
                            {eventDetail.checkpoints?.length} checkpoints
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <div className="money text-color-3 font">
                    Type: {EventType[eventDetail.type].label}
                  </div>
                  {eventDetail.id ===
                    "647264d1-73b9-4241-baf9-026ca35dc1ce" && (
                    <div>
                      <span
                        className="badge bg-warning text-dark px-3 py-2"
                        style={{ fontSize: "20px" }}
                      >
                        <i className="fas fa-star me-1"></i> Sponsored
                      </span>
                    </div>
                  )}

                  {/* <div className="price-wrap flex">
                    <p className="fs-12 lh-16 text-color-2">
                      Checkpoints:&nbsp;
                      <span className="fs-14 fw-5 font">{eventDetail.checkpoints?.length || "NA"}</span>
                    </p>
                    <p className="fs-12 lh-16">New car price: $100.000</p>
                  </div> */}
                </div>
                <ul className="action-icon style-1 flex flex-wrap">
                  <li>
                    <a href="#" className="icon">
                      <svg
                        width={16}
                        height={18}
                        viewBox="0 0 16 18"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4.41276 8.18022C4.23116 7.85345 3.94619 7.59624 3.60259 7.44895C3.25898 7.30167 2.8762 7.27265 2.51432 7.36645C2.15244 7.46025 1.83196 7.67157 1.60317 7.96722C1.37438 8.26287 1.25024 8.62613 1.25024 8.99997C1.25024 9.37381 1.37438 9.73706 1.60317 10.0327C1.83196 10.3284 2.15244 10.5397 2.51432 10.6335C2.8762 10.7273 3.25898 10.6983 3.60259 10.551C3.94619 10.4037 4.23116 10.1465 4.41276 9.81972M4.41276 8.18022C4.54776 8.42322 4.62501 8.70222 4.62501 8.99997C4.62501 9.29772 4.54776 9.57747 4.41276 9.81972M4.41276 8.18022L11.5873 4.19472M4.41276 9.81972L11.5873 13.8052M11.5873 4.19472C11.6924 4.39282 11.8361 4.56797 12.0097 4.70991C12.1834 4.85186 12.3836 4.95776 12.5987 5.02143C12.8138 5.08509 13.0394 5.10523 13.2624 5.08069C13.4853 5.05614 13.7011 4.98739 13.8972 4.87846C14.0933 4.76953 14.2657 4.62261 14.4043 4.44628C14.5429 4.26995 14.645 4.06775 14.7046 3.85151C14.7641 3.63526 14.78 3.40931 14.7512 3.18686C14.7225 2.96442 14.6496 2.74994 14.537 2.55597C14.3151 2.17372 13.952 1.89382 13.5259 1.77643C13.0997 1.65904 12.6445 1.71352 12.2582 1.92818C11.8718 2.14284 11.585 2.50053 11.4596 2.92436C11.3341 3.34819 11.38 3.80433 11.5873 4.19472ZM11.5873 13.8052C11.4796 13.999 11.4112 14.2121 11.3859 14.4323C11.3606 14.6525 11.3789 14.8756 11.4398 15.0887C11.5007 15.3019 11.603 15.5009 11.7408 15.6746C11.8787 15.8482 12.0494 15.9929 12.2431 16.1006C12.4369 16.2082 12.65 16.2767 12.8702 16.302C13.0905 16.3273 13.3135 16.3089 13.5267 16.248C13.7398 16.1871 13.9389 16.0848 14.1125 15.947C14.2861 15.8092 14.4309 15.6385 14.5385 15.4447C14.7559 15.0534 14.809 14.5917 14.686 14.1612C14.563 13.7307 14.274 13.3668 13.8826 13.1493C13.4913 12.9319 13.0296 12.8789 12.5991 13.0019C12.1686 13.1249 11.8047 13.4139 11.5873 13.8052Z"
                          stroke="CurrentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="icon">
                      <svg
                        width={16}
                        height={14}
                        viewBox="0 0 16 14"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M14.75 4.1875C14.75 2.32375 13.1758 0.8125 11.234 0.8125C9.78275 0.8125 8.53625 1.657 8 2.86225C7.46375 1.657 6.21725 0.8125 4.76525 0.8125C2.825 0.8125 1.25 2.32375 1.25 4.1875C1.25 9.6025 8 13.1875 8 13.1875C8 13.1875 14.75 9.6025 14.75 4.1875Z"
                          stroke="CurrentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </li>
                  <li>
                    <a href="#" className="icon">
                      <svg
                        width={16}
                        height={16}
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M4.625 14.75L1.25 11.375M1.25 11.375L4.625 8M1.25 11.375H11.375M11.375 1.25L14.75 4.625M14.75 4.625L11.375 8M14.75 4.625H4.625"
                          stroke="CurrentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          <div className="row">
            <div className="col-lg-8">
              {JSON.parse(eventDetail.thumbnail).length > 0 && (
                <Slider3 images={JSON.parse(eventDetail.thumbnail)} />
              )}

              <nav
                id="navbar-example2 "
                className="navbar tab-listing-scroll mb-30"
              ></nav>

              <div className="listing-detail-wrap">
                <div className="row">
                  <div className="col-lg-12">
                    <div
                      data-bs-spy="scroll"
                      data-bs-target="#navbar-example2"
                      data-bs-offset={0}
                      className="scrollspy-example"
                      tabIndex={0}
                    >
                      {eventDetail?.checkpoints?.length > 0 && (
                        <>
                          <div className="tfcl-listing-header mb-4">
                            <h2>Checkpoints</h2>
                          </div>
                          {eventDetail.checkpoints.map((checkpoint) => (
                            <div
                              key={checkpoint.id}
                              className="card mb-4 shadow-sm"
                            >
                              <div className="card-header text-white">
                                <h5 className="p-1">
                                  Checkpoint {checkpoint.order}:{" "}
                                  {checkpoint.name}
                                </h5>
                              </div>

                              <div className="card-body">
                                <div className="row mb-3">
                                  <div className="col-md-6">
                                    <p className="mb-1">
                                      <strong className="fw-bolder">
                                        Description:
                                      </strong>
                                    </p>
                                    <p>{checkpoint.description}</p>
                                  </div>

                                  <div className="col-md-6">
                                    <p className="mb-1">
                                      <strong className="fw-bolder">
                                        Departure Time:
                                      </strong>
                                    </p>
                                    <p>
                                      {new Date(
                                        checkpoint.departure_time
                                      ).toLocaleString()}
                                    </p>
                                  </div>

                                  <div className="col-12">
                                    <p className="mb-1 mt-3">
                                      <strong className="fw-bolder">
                                        Activities:
                                      </strong>
                                    </p>
                                    <p>{checkpoint.activities}</p>
                                  </div>
                                </div>
                                <div
                                  className="accordion"
                                  id={`accordionImages${checkpoint.id}`}
                                >
                                  <div className="accordion-item">
                                    <h2
                                      className="accordion-header"
                                      id={`heading${checkpoint.id}`}
                                    >
                                      <button
                                        className="accordion-button collapsed custom-accordion-button"
                                        type="button"
                                        data-bs-toggle="collapse"
                                        data-bs-target={`#collapse${checkpoint.id}`}
                                        aria-expanded="false"
                                        aria-controls={`collapse${checkpoint.id}`}
                                      >
                                        View Images
                                      </button>
                                    </h2>
                                    <div
                                      id={`collapse${checkpoint.id}`}
                                      className="accordion-collapse collapse"
                                      aria-labelledby={`heading${checkpoint.id}`}
                                      data-bs-parent={`#accordionImages${checkpoint.id}`}
                                    >
                                      <div className="accordion-body">
                                        <div className="row image-container">
                                          {checkpoint.images.map(
                                            (url, index) => (
                                              <div
                                                key={index}
                                                className="col-sm-12 col-md-3 mb-2"
                                              >
                                                <img
                                                  style={{
                                                    minHeight: "160px",
                                                  }}
                                                  src={getImage(url)}
                                                  alt={`Checkpoint ${
                                                    checkpoint.order
                                                  } Image ${index + 1}`}
                                                  className="img-fluid rounded border"
                                                />
                                              </div>
                                            )
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                {/* End Images Accordion */}
                              </div>
                              {/* End Card Body */}
                            </div>
                          ))}
                        </>
                      )}

                      <div
                        className="listing-description footer-col-block"
                        id="scrollspyHeading1"
                      >
                        <div className="footer-heading-desktop">
                          <h2>Detailed Overview</h2>
                        </div>
                        <div className="footer-heading-mobie listing-details-mobie">
                          <h2>Detailed Overview</h2>
                        </div>
                        <Overview eventDetail={eventDetail} />
                      </div>
                      <div className="listing-line" />
                      <div className="listing-location" id="scrollspyHeading3">
                        <div className="box-title">
                          <h2 className="title-ct">
                            {eventDetail.type !== EventType.CAR_MEETS.type
                              ? "Route"
                              : "Location"}
                          </h2>
                          <div className="list-icon-pf gap-8 flex-three">
                            <i className="far fa-map" />
                            <p className="font-1">
                              {eventDetail.start_mapbox_location_name}
                            </p>
                          </div>
                        </div>

                        <div
                          ref={mapContainer}
                          style={{ width: "100%", height: "450px" }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-lg-4">
              <div className="overlay-siderbar-mobie" />
              <div className="listing-sidebar">
                <div className="widget-listing mb-30">
                  <ProfileInfo
                    user={eventDetail.user}
                    startLocation={eventDetail.start_mapbox_location_name}
                  />
                </div>
                {/* <div className="list-icon-pf gap-8 flex-three mb-40">
                  <i className="far fa-flag" />
                  <p className="font-1">Report this listing</p>
                </div>
                <div className="widget-listing">
                  <div className="listing-header mb-30">
                    <h3>Recommended Used Cars</h3>
                    <p>Showing 26 more cars you might like</p>
                  </div>
                  <Recommended />
                  <a href="#" className="fs-16 fw-5 font text-color-3 lh-22">
                    View more reviews <i className="icon-autodeal-view-more" />
                  </a>
                </div> */}
              </div>
            </div>
          </div>
        </div>
      </section>
      <SidebarToggleButton />
    </>
  );
}
