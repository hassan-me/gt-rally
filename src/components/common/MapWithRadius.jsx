import React, { useState, useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import * as turf from "@turf/turf";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const MapWithRadius = ({ onLocationChange, events = [], onFilter, onUserInteraction }) => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const marker = useRef(null);
  const eventMarkersRef = useRef([]);
  const circleSourceId = "radius-circle";

  const [lat, setLat] = useState(37.7749);
  const [lng, setLng] = useState(-122.4194);
  const [radius, setRadius] = useState(1000);
  const [mapLoaded, setMapLoaded] = useState(false);
  const resolvedCoordsRef = useRef(new Map());

  const getStartCoordinates = (event) => {
    const raw =
      event?.startMapboxLocationJson || event?.start_location_json || null;
    let obj = raw;
    if (typeof raw === "string") {
      try {
        obj = JSON.parse(raw);
      } catch (_) {
        obj = null;
      }
    }
    if (!obj) return null;
    // Prefer query [lng, lat]
    if (Array.isArray(obj?.query) && obj.query.length >= 2) {
      return [obj.query[0], obj.query[1]];
    }
    const center = obj?.features?.[0]?.center || obj?.center;
    if (Array.isArray(center) && center.length >= 2)
      return [center[0], center[1]];
    return null;
  };

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

  const clearEventMarkers = () => {
    if (!eventMarkersRef.current) return;
    eventMarkersRef.current.forEach((m) => {
      try {
        m.remove();
      } catch (_) {}
    });
    eventMarkersRef.current = [];
  };

  const renderEventMarkers = () => {
    if (!mapLoaded || !map.current) return;
    clearEventMarkers();
    events.forEach((evt) => {
      const coord =
        resolvedCoordsRef.current.get(evt.id) || getStartCoordinates(evt);
      if (!coord) return;
      const [evLng, evLat] = coord;
      const el = document.createElement("div");
      el.style.background = "#e11d48"; 
      el.style.color = "#fff";
      el.style.padding = "4px 8px";
      el.style.borderRadius = "14px";
      el.style.fontSize = "12px";
      el.style.boxShadow = "0 1px 6px rgba(0,0,0,0.2)";
      el.style.whiteSpace = "nowrap";
      el.style.transform = "translate(-50%, -100%)";
      el.innerText = evt.name;

      console.log(evt.name,evLat,evLng)

      const mk = new mapboxgl.Marker({ element: el })
        .setLngLat([evLng, evLat])
        .addTo(map.current);
      eventMarkersRef.current.push(mk);
    });
  };

  const computeAndEmitFilter = (currentRadius) => {
    if (!onFilter || !Array.isArray(events) || events.length === 0) return;
    try {
      const center = turf.point([lng, lat]);
      const filtered = events.filter((evt) => {
        const coord =
          resolvedCoordsRef.current.get(evt.id) || getStartCoordinates(evt);
        if (!coord) return false;
        const dKm = turf.distance(center, turf.point(coord), {
          units: "kilometers",
        });
        return dKm * 1000 <= currentRadius;
      });
      onFilter(filtered);
    } catch (_) {}
  };

  const forwardGeocodeIfNeeded = async () => {
    if (!mapLoaded) return;
    const tasks = [];
    events.forEach((evt) => {
      const existing = resolvedCoordsRef.current.get(evt.id);
      if (existing) return;
      const known = getStartCoordinates(evt);
      if (known) {
        resolvedCoordsRef.current.set(evt.id, known);
        return;
      }
      const district = evt.startMapboxDistrict || evt.start_mapbox_district;
      if (!district || !mapboxgl.accessToken) return;
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        district
      )}.json?limit=1&access_token=${mapboxgl.accessToken}`;
      tasks.push(
        fetch(url)
          .then((r) => r.json())
          .then((j) => {
            const center = j?.features?.[0]?.center;
            if (Array.isArray(center) && center.length >= 2) {
              resolvedCoordsRef.current.set(evt.id, [center[0], center[1]]);
            }
          })
          .catch(() => {})
      );
    });
    if (tasks.length > 0) {
      try {
        await Promise.all(tasks);
        renderEventMarkers();
        computeAndEmitFilter(radius);
      } catch (_) {}
    } else {
      renderEventMarkers();
      computeAndEmitFilter(radius);
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
        if (onUserInteraction) onUserInteraction();
        if (map.current) {
          map.current.flyTo({
            center: [newPos.lng, newPos.lat],
            zoom: calculateZoomLevel(radius),
            essential: true,
          });
        }
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
        if (onUserInteraction) onUserInteraction();
      });
    });
  }, []);

  // Update circle & notify parent on change
  useEffect(() => {
    if (!mapLoaded || !map.current) return;

    const cappedRadius = Math.min(radius, 100000);
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

    // Filter events by radius and notify parent
    computeAndEmitFilter(cappedRadius);
  }, [lat, lng, radius, mapLoaded]);

  // Render event markers when events or map status change
  useEffect(() => {
    if (!mapLoaded) return;
    // Try to resolve coords and then render markers
    forwardGeocodeIfNeeded();
    // cleanup markers on unmount or events change
    return () => {
      clearEventMarkers();
    };
  }, [events, mapLoaded]);

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

      <div className="row g-3 align-items-center" style={{ marginTop: 20 }}>
        <div className="col-12 col-md-4">
          <label style={{ display: "block" }}>
            Latitude:
            <input
              type="number"
              name="lat"
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
              className="form-control"
              style={{ width: "100%" }}
            />
          </label>
        </div>
        <div className="col-12 col-md-4">
          <label style={{ display: "block" }}>
            Longitude:
            <input
              type="number"
              name="lng"
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
              className="form-control"
              style={{ width: "100%" }}
            />
          </label>
        </div>

        <div className="col-12 col-md-4">
          <label style={{ display: "block", marginBottom: 6 }}>Radius (m):</label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              width: "100%",
              border: "1px solid lightgrey",
              borderRadius: "8px",
              padding: "10px",
              gap: "12px",
              
            }}
          >
            <input
              type="range"
              min="0"
              max="100000"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              className="form-range"
              style={{
                flexGrow: 1,
                height: "6px",
                background: "#007BFF",
                minWidth: 0,
              }}
            />
            <input
              type="number"
              name="radius"
              value={radius}
              onChange={(e) => setRadius(Number(e.target.value))}
              max={100000}
              className="form-control"
              style={{
                width: "110px",
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
