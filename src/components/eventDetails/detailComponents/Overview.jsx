import { metersToMiles, formatDuration } from "@/utlis/helpers";
import React from "react";

export default function Overview({ eventDetail }) {
  if (!eventDetail) return null;

  return (
    <div className="tfcl-listing-info tf-collapse-content mt-30">
      <div className="row">
        <InfoItem title="Event Name" value={eventDetail.name} />
        <InfoItem title="No. of Vehicles" value={eventDetail.no_of_vehicles} />
        <InfoItem
          title="Start Location"
          value={eventDetail.start_mapbox_name}
        />
        <InfoItem
          title="End Location"
          value={
            eventDetail.end_mapbox_name ? eventDetail.end_mapbox_name : "-"
          }
        />
        <InfoItem
          title="Start Date"
          value={new Date(eventDetail.start_date).toLocaleString()}
        />
        <InfoItem
          title="End Date"
          value={new Date(eventDetail.end_date).toLocaleString()}
        />
        <InfoItem
          title="Point of Interests"
          value={eventDetail.point_of_interests ?eventDetail.point_of_interests:"-"}
        />
        <InfoItem
          title="Distance (miles)"
          value={
            eventDetail.distance == 0 || eventDetail.distance == null
              ? 0
              : metersToMiles(eventDetail.distance)
          }
        />
        <InfoItem
          title="Duration"
          value={
            eventDetail.duration == 0 || eventDetail.duration == null
              ? 0
              : formatDuration(eventDetail.duration)
          }
        />
        <InfoItem
          title="Public Event"
          value={eventDetail.is_public ? "Yes" : "No"}
        />
        <InfoItem
          title="Toll Roads Avoided?"
          value={eventDetail.avoid_toll ? "Yes" : "No"}
        />
        <InfoItem
          title="Highways Avoided?"
          value={eventDetail.avoid_highway ? "Yes" : "No"}
        />
      </div>
    </div>
  );
}

function InfoItem({ title, value }) {
  return (
    <div className="col-xl-6 col-md-6 item">
      <div className="inner listing-infor-box">
        <div className="icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={20}
            height={20}
            viewBox="0 0 20 20"
            fill="none"
          >
            <path
              d="M15.625 5V3.125C15.625 2.79348 15.4933 2.47554 15.2589 2.24112C15.0245 2.0067 14.7065 1.875 14.375 1.875H5.625C5.29348 1.875 4.97554 2.0067 4.74112 2.24112C4.5067 2.47554 4.375 2.79348 4.375 3.125V5C4.375 5.33152 4.5067 5.64946 4.74112 5.88388C4.97554 6.1183 5.29348 6.25 5.625 6.25H6.14375L4.38281 17.4023C4.35695 17.566 4.39715 17.7333 4.49457 17.8673C4.592 18.0014 4.73867 18.0913 4.90234 18.1172C4.93463 18.1224 4.96729 18.125 5 18.125C5.14868 18.1248 5.29241 18.0716 5.40538 17.9749C5.51836 17.8783 5.59318 17.7445 5.61641 17.5977L6.225 13.75H13.775L14.3828 17.5977C14.4061 17.7446 14.481 17.8785 14.5941 17.9752C14.7073 18.0718 14.8512 18.125 15 18.125C15.033 18.1251 15.0659 18.1224 15.0984 18.1172C15.2621 18.0913 15.4088 18.0014 15.5062 17.8673C15.6036 17.7333 15.6438 17.566 15.618 17.4023L13.8562 6.25H14.375C14.7065 6.25 15.0245 6.1183 15.2589 5.88388C15.4933 5.64946 15.625 5.33152 15.625 5ZM5.625 3.125H14.375V5H5.625V3.125ZM13.5773 12.5H6.42266L7.40937 6.25H12.5906L13.5773 12.5Z"
              fill="#B6B6B6"
            />
          </svg>
        </div>
        <div className="content-listing-info">
          <span className="listing-info-title">{title}:</span>
          <p className="listing-info-value">{value}</p>
        </div>
      </div>
    </div>
  );
}
