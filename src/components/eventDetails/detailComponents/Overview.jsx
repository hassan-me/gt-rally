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
          value={new Date(eventDetail.start_date).toLocaleDateString()}
        />
        <InfoItem
          title="End Date"
          value={new Date(eventDetail.end_date).toLocaleDateString()}
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

function getIconClassByTitle(title) {
  const normalized = String(title || "").toLowerCase();
  switch (normalized) {
    case "event name":
      return "fa fa-flag";
    case "no. of vehicles":
      return "fa fa-car";
    case "start location":
      return "fa fa-location-arrow";
    case "end location":
      return "fa fa-map-marker";
    case "start date":
      return "fa fa-calendar";
    case "end date":
      return "fa fa-calendar";
    case "point of interests":
      return "fa fa-map-pin";
    case "distance (miles)":
      return "fa fa-road";
    case "duration":
      return "fa fa-clock";
    case "public event":
      return "fa fa-globe";
    case "toll roads avoided?":
      return "fa fa-ban";
    case "highways avoided?":
      return "fa fa-ban";
    default:
      return "fa fa-info-circle";
  }
}

function InfoItem({ title, value }) {
  return (
    <div className="col-xl-6 col-md-6 item">
      <div className="inner listing-infor-box">
        <div className="icon"><i className={`${getIconClassByTitle(title)} text-muted`} style={{ fontSize: 20 }} /></div>
        <div className="content-listing-info">
          <span className="listing-info-title">{title}:</span>
          <p className="listing-info-value">{value}</p>
        </div>
      </div>
    </div>
  );
}
