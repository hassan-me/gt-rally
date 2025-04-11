import { eventData } from "@/data/cars";
import React, { useEffect, useState } from "react";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Link } from "react-router-dom";
import {
  getImage,
  metersToMiles,
  formatDuration,
  formatDateRange,
} from "@/utlis/helpers";
export default function FeaturedEvents() {
  const [rallies, setRallies] = useState([]);
  useEffect(() => {
    fetch("https://gtrally.web.app/v1/events_web/public")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch rallies.");
        }
        return response.json();
      })
      .then((data) => {
        setRallies(
          data.map((rec) => {
            rec.thumbnail = JSON.parse(rec.thumbnail);
            rec.thumbnail_url = JSON.parse(rec.thumbnail_url);
            return rec;
          })
        );
      })
      .catch((error) => {
        console.log(error.message);
      });
  }, []);

  const swiperOptions = {
    // autoplay: {
    //     delay: 5000,
    //     disableOnInteraction: false,
    // },
    loop: true,
    slidesPerView: 1,
    spaceBetween: 30,
    navigation: {
      clickable: true,
      nextEl: ".snbn9",
      prevEl: ".snbp9",
    },
    pagination: {
      el: ".spd12",
      clickable: true,
    },
    breakpoints: {
      768: {
        slidesPerView: 1,
        spaceBetween: 20,
      },
      992: {
        slidesPerView: 2,
        spaceBetween: 30,
      },
      1440: {
        slidesPerView: 2.8,
        spaceBetween: 30,
      },
    },
  };
  return (
    <section className="find-car-h10">
      <div className="container-fluid">
        <div className="row">
          <div className="col-md-6">
            <div className="image-wcs">
              <div className="bg-image-5" />
            </div>
          </div>
          <div className="col-md-6">
            <div className="content-wcs">
              <div className="heading-section">
                <h2>Features Rallies</h2>
                <p className="mt-18">
                  Browse the rallies at your own accord or choose from the
                  featured ones
                </p>
              </div>
              {rallies.length > 0 && (
                <div className="tf-icon-box-list">
                  <Swiper
                    {...swiperOptions}
                    modules={[Navigation, Pagination]}
                    className="swiper-container carousel-8"
                  >
                    {rallies.map((elm, i) => (
                      <SwiperSlide key={i} className="swiper-slide">
                        <div className="box-car-list hv-one">
                          <div className="image-group relative">
                            <div className="top flex-two">
                              <ul className="d-flex gap-8">
                                <li className="flag-tag success">Featured</li>
                                <li className="flag-tag style-1">
                                  <div className="icon">
                                    <svg
                                      width={16}
                                      height={13}
                                      viewBox="0 0 16 13"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      {/* SVG path remains unchanged */}
                                    </svg>
                                  </div>
                                  {elm.no_of_vehicles}
                                </li>
                              </ul>
                              <div className="year flag-tag">
                                {formatDateRange(elm.start_date, elm.end_date)}
                              </div>
                            </div>

                            <ul className="change-heart flex">
                              <li className="box-icon w-32">
                                <a
                                  data-bs-toggle="offcanvas"
                                  data-bs-target="#offcanvasBottom"
                                  aria-controls="offcanvasBottom"
                                  className="icon"
                                >
                                  {/* Share Icon */}
                                  <svg /* ... */ />
                                </a>
                              </li>
                              <li className="box-icon w-32">
                                <Link to={`/my-favorite`} className="icon">
                                  {/* Heart Icon */}
                                  <svg /* ... */ />
                                </Link>
                              </li>
                            </ul>

                            <div className="img-style">
                              <img
                                className="lazyload"
                                alt="rally thumbnail"
                                src={
                                  getImage(elm.thumbnail[0]) ||
                                  "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Image_not_available.png/800px-Image_not_available.png"
                                }
                                style={{
                                  minWidth: "450px",
                                  minHeight: "180px",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                          </div>

                          <div className="content">
                            <div className="text-address">
                              <p className="text-color-3 font">
                                {elm.start_mapbox_district}
                              </p>
                            </div>
                            <h5 className="link-style-1">
                              <Link
                                to={`/events/${elm.id}`}
                                style={{
                                  display: "block",
                                  overflow: "hidden",
                                  whiteSpace: "nowrap",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {elm.name}
                              </Link>
                            </h5>

                            <div
                              style={{ whiteSpace: "nowrap" }}
                              className="icon-box flex flex-nowrap"
                            >
                              <div className="icons flex-three">
                                <i className="icon-autodeal-km1" />
                                <span>
                                  <span>
                                    {metersToMiles(elm.distance)} miles
                                  </span>
                                </span>
                              </div>
                              <div
                                style={{ whiteSpace: "nowrap" }}
                                className="icons flex-three"
                              >
                                <i className="icon-autodeal-calendar" />
                                <span>
                                  {elm.duration == 0
                                    ? 0
                                    : formatDuration(elm.duration)}
                                </span>
                              </div>
                              <div
                                style={{ whiteSpace: "nowrap" }}
                                className="icons flex-three"
                              >
                                <i className="icon-autodeal-location" />
                                <span>{elm.start_mapbox_district}</span>
                              </div>
                            </div>
                            <div className="days-box flex justify-space align-center">
                              <div className="img-author">
                                <img
                                  className="lazyload"
                                  alt="creator"
                                  src={
                                    elm.user.profile_image
                                      ? `https://gtrally.web.app/image_web/${elm.user.profile_image}`
                                      : "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
                                  }
                                  width={120}
                                  height={120}
                                />
                                <span className="font text-color-2 fw-5">
                                  {elm.user?.first_name} {elm.user?.last_name}
                                </span>
                              </div>
                              <Link
                                to={`/events/${elm.id}`}
                                className="view-car"
                              >
                                View Rally
                              </Link>
                            </div>
                          </div>
                        </div>
                      </SwiperSlide>
                    ))}

                    <div className="swiper-pagination3 spd12 pb-1" />
                    <div className="swiper-button-next style-1 snbn9" />
                    <div className="swiper-button-prev style-1 snbp9" />
                  </Swiper>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
