import { Link } from "react-router-dom";
import { EventType } from "@/constants";
import {
  formatDateRange,
  formatDuration,
  metersToMiles,
} from "@/utlis/helpers";
import { Car } from "lucide-react";

export default function Rally(props) {
  const { rally } = props;
  return (
    <div className="box-car-list hv-one">
      <div className="image-group relative">
        <div className="top flex-two" style={{ display: "grid", gridTemplateColumns: "1fr auto 1fr", alignItems: "center" }}>
          <ul className="d-flex gap-8 align-items-center">
            <li className="flag-tag success text-nowrap">
              {EventType[rally.type].label}
            </li>
          </ul>
          <div className="flag-tag style-1">
            <div className="icon">
              <Car size={18} />
            </div>
            {rally.thumbnail_url.length}
          </div>
          <div className="year flag-tag text-nowrap" style={{ justifySelf: "end" }}>
            {formatDateRange(rally.start_date, rally.end_date)}
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
            src={
              rally.thumbnail && rally.thumbnail.length > 0
                ? `https://gtrally.web.app/image_web/${rally.thumbnail}`
                : "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Image_not_available.png/800px-Image_not_available.png"
            }
            style={{
              minWidth: "450px",
              minHeight: "220px",
              ...(window.innerWidth > 768 ? { transform: "translateX(-40px)" } : {}),
              objectFit: "cover",
            }}
          />
        </div>
      </div>
      <div className="content">
        <div className="text-address">
          <p className="text-color-3 font">
            {rally.start_mapbox_district} ➡ {rally.end_mapbox_district}
          </p>
        </div>

        <h5 className="link-style-1 w-48 md:w-64">
          <Link
            to={`/events/${rally.id}`}
            style={{
              display: "block",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
             
            }}
          >
            {rally.name}
          </Link>
        </h5>
        <div className="icon-box flex">
          <div className="icons flex-three text-nowrap">
            <i className="icon-autodeal-km1" />
            <span style={{fontSize:14}}>{rally.no_of_vehicles.toLocaleString()} vehicles</span>
          </div>
          <div className="icons flex-three text-nowrap">
            <i className="icon-autodeal-diesel" />
            <span style={{fontSize:14}}>{metersToMiles(rally.distance)} miles</span>
          </div>
          <div className="icons flex-three text-nowrap">
            <i className="icon-autodeal-automatic" />
            <span style={{fontSize:14}}>
              {rally.duration == 0 ? 0 : formatDuration(rally.duration)}
            </span>
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
              src={
                rally.user.profile_image
                  ? `https://gtrally.web.app/image_web/${rally.user.profile_image}`
                  : "https://upload.wikimedia.org/wikipedia/commons/9/99/Sample_User_Icon.png"
              }
              width={120}
              height={120}
            />
            {/* <span className="font text-color-2 fw-5">
            {rally.user.profile_image_url}
          </span> */}
          </div>
          <Link to={`/events/${rally.id}`} className="view-car">
            View Rally
          </Link>
        </div>
      </div>
    </div>
  );
}
