//import { carData, rallyData } from "@/data/cars";
import { Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";

import { Link } from "react-router-dom";
import { useEffect, useState } from "react";

const SUPERSET_TYPE = {
  All: {label: 'All', type: 'All'},
  Rallies: { label: 'Rallies', type: 'rally'},
  Events: { label: 'Events', type: 'event'}
}
const rallySuperType = ["All", SUPERSET_TYPE.Rallies, SUPERSET_TYPE.Events];

const addSuperSet = (data, superSetValue) => data.map(a => Object.assign({}, a, { superSetType: superSetValue}));
const metersToMiles = (meters) => (meters * 0.000621371).toFixed(2); // Convert meters to miles
function formatDuration(duration) {
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  return [hours ? hours + "h" : "", minutes ? minutes + "m" : ""].filter(Boolean).join(" ");
}

function Event(props) {
  const { event } = props;
  return (
    <div>
      Event Cell here
    </div>
  )
}

function Rally(props) {
  const { rally } = props;
  return (
    <div className="box-car-list hv-one">
    <div className="image-group relative">
      <div className="top flex-two">
        <ul className="d-flex gap-8">
          <li className="flag-tag success">{rally.type}</li>
          <li className="flag-tag style-1">
            <div className="icon">
              <svg
                width={16}
                height={13}
                viewBox="0 0 16 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M1.5 9L4.93933 5.56067C5.07862 5.42138 5.24398 5.31089 5.42597 5.2355C5.60796 5.16012 5.80302 5.12132 6 5.12132C6.19698 5.12132 6.39204 5.16012 6.57403 5.2355C6.75602 5.31089 6.92138 5.42138 7.06067 5.56067L10.5 9M9.5 8L10.4393 7.06067C10.5786 6.92138 10.744 6.81089 10.926 6.7355C11.108 6.66012 11.303 6.62132 11.5 6.62132C11.697 6.62132 11.892 6.66012 12.074 6.7355C12.256 6.81089 12.4214 6.92138 12.5607 7.06067L14.5 9M2.5 11.5H13.5C13.7652 11.5 14.0196 11.3946 14.2071 11.2071C14.3946 11.0196 14.5 10.7652 14.5 10.5V2.5C14.5 2.23478 14.3946 1.98043 14.2071 1.79289C14.0196 1.60536 13.7652 1.5 13.5 1.5H2.5C2.23478 1.5 1.98043 1.60536 1.79289 1.79289C1.60536 1.98043 1.5 2.23478 1.5 2.5V10.5C1.5 10.7652 1.60536 11.0196 1.79289 11.2071C1.98043 11.3946 2.23478 11.5 2.5 11.5ZM9.5 4H9.50533V4.00533H9.5V4ZM9.75 4C9.75 4.0663 9.72366 4.12989 9.67678 4.17678C9.62989 4.22366 9.5663 4.25 9.5 4.25C9.4337 4.25 9.37011 4.22366 9.32322 4.17678C9.27634 4.12989 9.25 4.0663 9.25 4C9.25 3.9337 9.27634 3.87011 9.32322 3.82322C9.37011 3.77634 9.4337 3.75 9.5 3.75C9.5663 3.75 9.62989 3.77634 9.67678 3.82322C9.72366 3.87011 9.75 3.9337 9.75 4Z"
                  stroke="white"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            6
          </li>
        </ul>
        <div className="year flag-tag">2024</div>
      </div>
      <ul className="change-heart flex">
        <li className="box-icon w-32">
          <a
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasBottom"
            aria-controls="offcanvasBottom"
            className="icon"
          >
            <svg
              width={18}
              height={18}
              viewBox="0 0 18 18"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5.25 16.5L1.5 12.75M1.5 12.75L5.25 9M1.5 12.75H12.75M12.75 1.5L16.5 5.25M16.5 5.25L12.75 9M16.5 5.25H5.25"
                stroke="CurrentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </a>
        </li>
        <li className="box-icon w-32">
          <Link to={`/my-favorite`} className="icon">
            <svg
              width={18}
              height={16}
              viewBox="0 0 18 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M16.5 4.875C16.5 2.80417 14.7508 1.125 12.5933 1.125C10.9808 1.125 9.59583 2.06333 9 3.4025C8.40417 2.06333 7.01917 1.125 5.40583 1.125C3.25 1.125 1.5 2.80417 1.5 4.875C1.5 10.8917 9 14.875 9 14.875C9 14.875 16.5 10.8917 16.5 4.875Z"
                stroke="CurrentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </Link>
        </li>
      </ul>
      <div className="img-style">
        <img
          className="lazyload"
          alt="image"
          src={`https://gt-rally.web.app/image_web/${rally.thumbnail}`}
          width={450}
          height={338}
        />
      </div>
    </div>
    <div className="content">
      <div className="text-address">
        <p className="text-color-3 font">{rally.start_mapbox_district} ➡ {rally.end_mapbox_district}</p>
      </div>
      <h5 className="link-style-1">
        <Link to={`/listing-detail-v5/${rally.id}`}>
          {rally.name}
        </Link>
      </h5>
      <div className="icon-box flex flex-wrap">
        <div className="icons flex-three">
          <i className="icon-autodeal-km1" />
          <span>{rally.no_of_vehicles.toLocaleString()} vehicles</span>
        </div>
        <div className="icons flex-three">
          <i className="icon-autodeal-diesel" />
          <span>{metersToMiles(rally.distance)} miles</span>
        </div>
        <div className="icons flex-three">
          <i className="icon-autodeal-automatic" />
          <span>{formatDuration(rally.duration)}</span>
        </div>
      </div>
      <div className="money fs-20 fw-5 lh-25 text-color-3">
        {rally.checkpoints.length} Checkpoints
      </div>
      <div className="days-box flex justify-space align-center">
        <div className="img-author">
          <img
            className="lazyload"
            alt="image"
            src={`https://gt-rally.web.app/image_web/${rally.user.profile_image}`}
            width={120}
            height={120}
          />
          {/* <span className="font text-color-2 fw-5">
            {rally.user.profile_image_url}
          </span> */}
        </div>
        <Link
          to={`/rallies/${rally.id}`}
          className="view-car"
        >
          View Rally
        </Link>
      </div>
    </div>
  </div>
  )
}

export default function Cars() {
  const swiperOptions = {
    speed: 1000,
    spaceBetween: 30,
    pagination: {
      el: ".spd11",
      clickable: true,
    },
    navigation: {
      nextEl: ".snbn8",
      prevEl: ".snbp8",
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


  const [selectedType, setSelectedType] = useState(SUPERSET_TYPE.All);
  const [rallies, setRallies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  const GetFilteredResults = () => {
    if (selectedType.type == SUPERSET_TYPE.All.type) return rallies;
    return rallies.filter(a => a.type_custom == selectedType.type);
  }

  useEffect(() => {
    fetch("https://gt-rally.web.app/events_web")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch rallies.");
        }
        return response.json();
      })
      .then((data) => {
        setRallies(data);
        setLoading(false);
      })
      .catch((error) => {
        setError(error.message);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading rallies...</p>;
  if (error) return <p>Error: {error}</p>;
  // return (
  //   <div>
  //     {JSON.stringify(rallies)}
  //   </div>
  // )

  // return (
  //   <div>
  //     <h2>Upcoming Rallies</h2>
  //     <ul style={{ listStyle: "none", padding: 0 }}>
  //       {rallyData.map((rally) => (
  //         <li key={rally.id} style={{ border: "1px solid #ccc", padding: "10px", marginBottom: "10px", borderRadius: "8px" }}>
  //           <img src={rally.thumbnail_url} alt={rally.name} style={{ width: "100%", maxWidth: "300px", borderRadius: "8px" }} />
  //           <h3>{rally.name}</h3>
  //           <p><strong>Type:</strong> {rally.type}</p>
  //           <p><strong>Start:</strong> {new Date(rally.start_date).toLocaleDateString()}</p>
  //           <p><strong>From:</strong> {rally.start_mapbox_district} → {rally.end_mapbox_district}</p>
  //           <a href={rally.share_link} target="_blank" rel="noopener noreferrer">View Rally</a>
  //         </li>
  //       ))}
  //     </ul>
  //   </div>
  // );

  return (
    <section className="tf-section3">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="heading-section flex align-center justify-space flex-wrap gap-20">
              <h2
                className="wow fadeInUpSmall"
                data-wow-delay="0.2s"
                data-wow-duration="1000ms"
              >
               Top Picks: Rally Cars & Thrilling Events
              </h2>
              <Link
                to={`/blog-grid`}
                className="tf-btn-arrow wow fadeInUpSmall"
                data-wow-delay="0.2s"
                data-wow-duration="1000ms"
              >
                View all
                <i className="icon-autodeal-btn-right" />
              </Link>
            </div>
          </div>
          <div className="col-lg-12">
            <div className="flat-tabs themesflat-tabs">
              <div className="box-tab center">
                <ul className="menu-tab tab-title style flex">
                  {/* {rallySuperType.map((superSetType, index) => (
                    <li
                      key={index}
                      onClick={() => setSelectedType(superSetType)}
                      className={`item-title ${
                        selectedType === superSetType ? "active" : ""
                      }`}
                    >
                      <h5 className="inner">{superSetType}</h5>
                    </li>
                  ))} */}
                  {Object.keys(SUPERSET_TYPE).map((eventType) => (
                    <li
                      key={eventType}
                      onClick={() => setSelectedType(SUPERSET_TYPE[eventType])}
                      className={`item-title ${
                        selectedType.label === eventType ? "active" : ""
                      }`}
                    >
                      <h5 className="inner">{eventType}</h5>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="content-tab">
                <div className="content-inner tab-content">
                  <Swiper
                    {...swiperOptions}
                    modules={[Pagination, Navigation]}
                    className="swiper-container tf-sw-mobile3"
                  >
                    {GetFilteredResults().map((record, i) => (
                      <SwiperSlide key={i} className="swiper-slide">
                        {record.type_custom == SUPERSET_TYPE.Rallies.type ? <Rally rally={record}/> : <Event event={record} />}
                      </SwiperSlide>
                    ))}
                    <div className="swiper-pagination5 spd11"></div>
                  </Swiper>
                  <div className="swiper-button-next style-1 snbn8" />
                  <div className="swiper-button-prev style-1 snbp8" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
