import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapWithRadius = ({ onLocationChange }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const circleSourceId = "radius-circle";

  const [lat, setLat] = useState(37.7749); 
  const [lng, setLng] = useState(-122.4194);
  const [radius, setRadius] = useState(1000);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Get user's current location on first mount
  useEffect(() => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLat(latitude);
        setLng(longitude);
      },
      (err) => {
        console.warn("Geolocation error:", err.message);
      },
      { enableHighAccuracy: true }
    );
  }, []);

  const updateCircle = (center, radius) => {
    if (!mapLoaded || !map.current) return;

    const circleFeature = turf.circle(center, radius / 1000, {
      steps: 64,
      units: "kilometers",
    });

    if (map.current.getSource(circleSourceId)) {
      map.current.getSource(circleSourceId).setData(circleFeature);
    } else {
      map.current.addSource(circleSourceId, {
        type: "geojson",
        data: circleFeature,
      });

      map.current.addLayer({
        id: circleSourceId,
        type: "fill",
        source: circleSourceId,
        layout: {},
        paint: {
          "fill-color": "#00BFFF",
          "fill-opacity": 0.3,
        },
      });
    }
  };

  useEffect(() => {
    if (map.current) return;

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: [lng, lat],
      zoom: calculateZoomLevel(radius),
    });

    map.current.on("load", () => {
      setMapLoaded(true);
      updateCircle([lng, lat], radius);

      marker.current = new mapboxgl.Marker({ draggable: true })
        .setLngLat([lng, lat])
        .addTo(map.current);

      marker.current.on("dragend", () => {
        const newPos = marker.current.getLngLat();
        setLat(newPos.lat);
        setLng(newPos.lng);
      });

      map.current.on("click", (e) => {
        const { lat, lng } = e.lngLat;
        setLat(lat);
        setLng(lng);
        marker.current.setLngLat([lng, lat]);
        map.current.flyTo({
          center: [lng, lat],
          zoom: calculateZoomLevel(radius),
          essential: true,
        });
      });
    });
  }, []);

  // Update circle & notify parent on change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const cappedRadius = Math.min(radius, 5000);
    if (radius !== cappedRadius) {
      setRadius(cappedRadius);
      return;
    }

    updateCircle([lng, lat], cappedRadius);

    if (marker.current) {
      marker.current.setLngLat([lng, lat]);
    }

    map.current.flyTo({
      center: [lng, lat],
      zoom: calculateZoomLevel(cappedRadius),
      essential: true,
    });

    if (onLocationChange) {
      onLocationChange({ lat, lng, radius: cappedRadius });
    }
  }, [lat, lng, radius, mapLoaded]);

  const calculateZoomLevel = (radius) => {
    if (radius <= 500) return 16;
    if (radius <= 1000) return 15;
    if (radius <= 2500) return 13;
    if (radius <= 3700) return 12;
    if (radius <= 5000) return 10;
    return 12;
  };

  return (
    <div>
      <div ref={mapContainer} style={{ width: "100%", height: "400px" }} />

      <div className="row" style={{ alignItems: "center", marginTop: 20, }}>
        <div className="col-xl-3 col-lg-4 col-md-6 mb-2">
          <label>
            Latitude:
            <input
              type="number"
              name="lat"
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
           style={{width:"112%"}}
            />
          </label>
        </div>
        <div className="col-xl-3 col-lg-4 col-md-6  mb-2">
          <label>
            Longitude:
            <input
              type="number"
              name="lng"
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
              style={{width:"108%"}}
            />
          </label>
        </div>

        <div className="col-lg-4 col-md-6  mb-2" style={{marginLeft:"1px"}}>
          <label style={{ display: "block" }}>Radius (m):</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              maxWidth: "500px",
              border: "1px solid lightgrey",
              borderRadius: "8px",
              padding: "10px",
              gap: "12px",
            }}
          >
            <input
              type="range"
              min="0"
              max="5000"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              style={{
                flexGrow: 1,
                height: "6px",
                background: "#007BFF",
              }}
            />
            <input
              type="number"
              name="radius"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              max={5000}
              style={{
           
                padding: "4px 8px",
                borderRadius: "4px",
                border: "1px solid #ccc",
                outline: "none",
              }}
            />
            <span style={{ whiteSpace: "nowrap", fontSize: "14px" }}>m</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapWithRadius;
