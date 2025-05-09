import { getImage } from "@/utlis/helpers";
import React from "react";

export default function ProfileInfo(props) {
  const { user, startLocation } = props;
  return (
    <>
      <div className="prolile-info flex-three mb-30">
        <div className="image">
          <img
            className="lazyload"
            data-src="/assets/images/author/avt1.jpg"
            alt="image"
            src={
              user.profile_image
                ? getImage(user.profile_image)
                : "https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Image_not_available.png/800px-Image_not_available.png"
            }
            width={450}
            height={450}
          />
        </div>
        <div className="content">
          <h4>{`${user.first_name} ${user.last_name}`}</h4>
          <div className="verified flex-three">
            <div className="icon">
              <svg
                width={14}
                height={15}
                viewBox="0 0 14 15"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5 8.00024L6.5 9.50024L9 6.00024M7 1.30957C5.49049 2.74306 3.48018 3.52929 1.39867 3.50024C1.13389 4.30689 0.999317 5.15057 1 5.99957C1 9.72757 3.54934 12.8596 7 13.7482C10.4507 12.8602 13 9.72824 13 6.00024C13 5.1269 12.86 4.28624 12.6013 3.49957H12.5C10.3693 3.49957 8.43334 2.66757 7 1.30957Z"
                  stroke="CurrentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="fs-12 fw-6 lh-16">Verified Rally Master</span>
          </div>
        </div>
      </div>
      <div className="profile-map mb-30">
        <div className="list-icon-pf gap-8 flex-three">
          <i className="far fa-map" />
          <p className="font-1">{startLocation}</p>
        </div>
        <div className="map">
          <iframe
            className="map-content"
            src="https://www.google.com/maps?q=40.643804,-73.781892&hl=en&z=14&output=embed"
            allowFullScreen
            loading="lazy"
            style={{
              border: 0,
              width: "100%",
              height: "250px",
              pointerEvents: "auto",
            }}
            title="Foo bar hello"
          ></iframe>
        </div>
      </div>
      {/* <div className="profile-contact">
        <h6>Contact dealer</h6>
        <div className="btn-contact flex-two">
          <a href="#" className="btn-pf bg-orange">
            <i className="icon-autodeal-phone2" />
            <span className="fs-16 fw-5 lh-20 font text-color-1">
              Call to seller
            </span>
          </a>
          <a href="#" className="btn-pf bg-green">
            <i className="icon-autodeal-chat" />
            <span className="fs-16 fw-5 lh-20 font text-color-1">Chat</span>
          </a>
        </div>
      </div> */}
    </>
  );
}
