import React, { useEffect, useRef, useState } from "react";
import { Modal } from "bootstrap";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  useLazyGeocodeQuery,
  useLazyRetrieveLocationQuery,
  useSuggestLocationQuery,
} from "@/redux/slices/mapApi.slice";
import { errorToast } from "./Toast";

export default function MapboxLocationModal({
  id = "mapbox_location_modal",
  initialCoordinates,
  onCancel,
  eventDetails,
  onSelect,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const routePreviewContainerRef = useRef(null);
  const routePreviewMapRef = useRef(null);
  const routePreviewMarkersRef = useRef([]);
  const markerRef = useRef(null);
  const popupRef = useRef(null);
  const modalInstanceRef = useRef(null);

  const [searchText, setSearchText] = useState("");
  const [debouncedText, setDebouncedText] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCoords, setSelectedCoords] = useState(
    initialCoordinates || null
  );
  const [selectedLabel, setSelectedLabel] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [geoCode, setGeoCode] = useState(null);
  const selectionConfirmedRef = useRef(false);

  const [retrieveLocation, { data: retrievedLocation }] =
    useLazyRetrieveLocationQuery();
  const [geocode] = useLazyGeocodeQuery();

  // Debounce search text (300ms)
  useEffect(() => {
    const t = setTimeout(() => setDebouncedText(searchText.trim()), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  const { data: suggestData } = useSuggestLocationQuery(
    {
      query: debouncedText,
      proximity: selectedCoords
        ? { longitude: selectedCoords[0], latitude: selectedCoords[1] }
        : undefined,
    },
    { skip: !debouncedText }
  );

  useEffect(() => {
    // Normalize suggestions
    if (Array.isArray(suggestData?.suggestions))
      setSuggestions(suggestData.suggestions);
    else if (Array.isArray(suggestData?.features))
      setSuggestions(suggestData.features);
    else setSuggestions([]);
  }, [suggestData]);

  // set access token once
  useEffect(() => {
    mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
  }, []);

  // initialize/destroy map when modal shown/hidden
  useEffect(() => {
    const modalEl = document.getElementById(id);
    if (!modalEl) return;

    const onShown = () => {
      selectionConfirmedRef.current = false;
      // sync current selection with latest initialCoordinates every time modal opens
      setSelectedCoords(initialCoordinates || null);
      setSelectedLabel("");
      // defer initialization so the modal size/layout is finalized
      if (!mapRef.current) {
        try {
          const coordsToUse = initialCoordinates ||
            selectedCoords || [-98.5795, 39.8283];
          const zoomToUse = initialCoordinates || selectedCoords ? 12 : 3;
          mapRef.current = new mapboxgl.Map({
            container: mapContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: coordsToUse,
            zoom: zoomToUse,
          });

          mapRef.current.addControl(
            new mapboxgl.ScaleControl({ maxWidth: 80, unit: "metric" }),
            "bottom-right"
          );

          markerRef.current = new mapboxgl.Marker({ draggable: true })
            .setLngLat(initialCoordinates || [-98.5795, 39.8283])
            .addTo(mapRef.current);
          markerRef.current.on("dragend", async () => {
            const lngLat = markerRef.current.getLngLat();
            const coords = [lngLat.lng, lngLat.lat];
            placeMarker(coords, { fly: true });
            setSelectedCoords(coords);
            await reverseGeocodeAndSet(coords);
          });

          // click to place marker
          mapRef.current.on("click", async (e) => {
            const lngLat = [e.lngLat.lng, e.lngLat.lat];
            placeMarker(lngLat, { fly: true });
            setSelectedCoords(lngLat);
            await reverseGeocodeAndSet(lngLat);
          });

          // if there are initial coords, place marker
          const initCoords = initialCoordinates || selectedCoords;
          if (initCoords) {
            placeMarker(initCoords, { fly: true }, false, true);
            reverseGeocodeAndSet(initCoords);
          }

          // make sure the map resizes inside modal
          setTimeout(() => mapRef.current.resize(), 200);
        } catch (err) {
          console.error("Map init error:", err);
          setError("Failed to initialize map");
        }
      } else {
        mapRef.current.resize();
        const coords = initialCoordinates || selectedCoords;
        if (coords) mapRef.current.flyTo({ center: coords, zoom: 12 });
      }
    };

    const onHidden = () => {
      // optional: destroy map to free memory when modal hidden
      if (mapRef.current) {
        try {
          mapRef.current.remove();
        } catch (e) {
          /* ignore */
        }
        mapRef.current = null;
        markerRef.current = null;
        popupRef.current = null;
      }

      // clear transient state (but keep selected coords until user confirms if you prefer)
      setSuggestions([]);
      setSearchText("");
      setDebouncedText("");

      // If closed without confirming, notify caller to cleanup
      if (!selectionConfirmedRef.current && typeof onCancel === "function") {
        try {
          onCancel();
        } catch (e) {}
      }
    };

    modalEl.addEventListener("shown.bs.modal", onShown);
    modalEl.addEventListener("hidden.bs.modal", onHidden);

    // store bootstrap modal instance so we can hide programmatically
    modalInstanceRef.current = Modal.getOrCreateInstance(modalEl);

    return () => {
      modalEl.removeEventListener("shown.bs.modal", onShown);
      modalEl.removeEventListener("hidden.bs.modal", onHidden);
    };
  }, [id, initialCoordinates, selectedCoords]);

  // Build coordinates list from eventDetails for Directions API
  function extractRouteCoordinatesFromEvent() {
    try {
      if (!eventDetails) return null;
      const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
      if (!token) return null;

      const coords = [];
      let startLocation =
        eventDetails?.startMapboxLocationJson ||
        eventDetails?.start_location_json;
      let endLocation =
        eventDetails?.endMapboxLocationJson || eventDetails?.end_location_json;

      if (startLocation) {
        if (typeof startLocation === "string") {
          try {
            startLocation = JSON.parse(startLocation);
          } catch (e) {
            startLocation = null;
          }
        }
        if (
          startLocation &&
          Array.isArray(startLocation.query) &&
          typeof startLocation.query[0] === "number" &&
          typeof startLocation.query[1] === "number"
        ) {
          coords.push([startLocation.query[0], startLocation.query[1]]);
        }
      }
      console.log(eventDetails.checkpoints);
      if (Array.isArray(eventDetails.checkpoints)) {
        const getTypeWeight = (cp) => {
          const idStr = String(cp?.id || "");
          if (idStr.includes("waypoint1")) return 0;
          if (idStr.includes("waypoint2")) return 1;
          if (idStr.includes("location")) return 2;
          // Fallback by field presence
          if (cp?.mapboxWaypoint1Json) return 0;
          if (cp?.mapboxWaypoint2Json) return 1;
          return 2;
        };

        [...eventDetails.checkpoints]
          .sort((a, b) => {
            const orderA = a?.order || 0;
            const orderB = b?.order || 0;
            if (orderA !== orderB) return orderA - orderB;
            return getTypeWeight(a) - getTypeWeight(b);
          })
          .forEach((cp) => {
            const shapingJsons = [
              cp?.mapboxWaypoint1Json,
              cp?.mapboxWaypoint2Json,
            ].filter(Boolean);
            shapingJsons.forEach((j) => {
              try {
                const fc = typeof j === "string" ? JSON.parse(j) : j;
                const c = fc?.query;
                if (
                  Array.isArray(c) &&
                  typeof c[0] === "number" &&
                  typeof c[1] === "number"
                ) {
                  coords.push([c[0], c[1]]);
                }
              } catch (e) {}
            });

            // Then the checkpoint location (if present on this cp)
            if (
              typeof cp?.longitude === "number" &&
              typeof cp?.latitude === "number"
            ) {
              coords.push([cp.longitude, cp.latitude]);
            }
          });
      }

      if (endLocation) {
        if (typeof endLocation === "string") {
          try {
            endLocation = JSON.parse(endLocation);
          } catch (e) {
            endLocation = null;
          }
        }
        if (
          endLocation &&
          Array.isArray(endLocation.query) &&
          typeof endLocation.query[0] === "number" &&
          typeof endLocation.query[1] === "number"
        ) {
          coords.push([endLocation.query[0], endLocation.query[1]]);
        }
      }
      if (coords.length < 2) return null;
      return coords;
    } catch (e) {
      console.warn("Failed to extract route coords", e);
      return null;
    }
  }

  const closeModal = () => {
    const modalEl = document.getElementById(id);
    Modal.getInstance(modalEl)?.hide();
  };

  async function buildAndRenderRoutePreview() {
    const map = routePreviewMapRef.current;
    if (!map) return;
    const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN || "";
    const coords = extractRouteCoordinatesFromEvent();
    if (!token || !coords || coords.length < 2) return;

    const coordStr = coords.map((c) => `${c[0]},${c[1]}`).join(";");

    const excludeParams = [];
    if (eventDetails?.avoid_highway) excludeParams.push("motorway");
    if (eventDetails?.avoid_toll) excludeParams.push("toll");
    const exclude = excludeParams.length
      ? `&exclude=${excludeParams.join(",")}`
      : "";

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordStr}?geometries=geojson&overview=full&steps=false&alternatives=false${exclude}&access_token=${token}`;

    try {
      const res = await fetch(url);
      const json = await res.json();
      const route = json?.routes?.[0]?.geometry;
      if (!route) return;

      const sourceId = "route-preview-source";
      const layerId = "route-preview-layer";

      if (map.getLayer(layerId)) {
        map.removeLayer(layerId);
      }
      if (map.getSource(sourceId)) {
        map.removeSource(sourceId);
      }

      map.addSource(sourceId, {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: route,
        },
      });

      map.addLayer({
        id: layerId,
        type: "line",
        source: sourceId,
        layout: { "line-join": "round", "line-cap": "round" },
        paint: {
          "line-color": "#0d6efd",
          "line-width": 4,
          "line-opacity": 0.9,
        },
      });

      const bounds = new mapboxgl.LngLatBounds();
      coords.forEach((c) => bounds.extend(c));
      map.fitBounds(bounds, { padding: 24, duration: 0 });

      // Clear previous markers
      if (Array.isArray(routePreviewMarkersRef.current)) {
        routePreviewMarkersRef.current.forEach((m) => {
          try {
            m.remove();
          } catch (e) {}
        });
      }
      routePreviewMarkersRef.current = [];

      // Helper to create a labeled marker element (label above, marker visual below)
      const createLabeledMarkerElement = ({
        labelText,
        emoji,
        color = "#1e90ff",
        size = 24,
      }) => {
        const container = document.createElement("div");
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.alignItems = "center";
        container.style.transform = "translate(-50%, -100%)";
        container.style.pointerEvents = "none";

        const label = document.createElement("div");
        label.textContent = labelText || "";
        label.style.background = "rgba(0,0,0,0.7)";
        label.style.color = "#fff";
        label.style.padding = "2px 6px";
        label.style.borderRadius = "4px";
        label.style.fontSize = "11px";
        label.style.marginBottom = "4px";
        label.style.whiteSpace = "nowrap";
        label.style.pointerEvents = "none";

        const marker = document.createElement("div");
        marker.style.pointerEvents = "auto";
        if (emoji) {
          marker.style.fontSize = `${size}px`;
          marker.style.lineHeight = "1";
          marker.textContent = emoji;
        } else {
          // simple pin/circle
          marker.style.width = `${Math.max(10, Math.floor(size * 0.6))}px`;
          marker.style.height = `${Math.max(10, Math.floor(size * 0.6))}px`;
          marker.style.background = color;
          marker.style.border = "2px solid #fff";
          marker.style.borderRadius = "50%";
          marker.style.boxShadow = "0 0 0 2px rgba(0,0,0,0.2)";
        }

        container.appendChild(label);
        container.appendChild(marker);
        return container;
      };

      let startLocation =
        eventDetails?.startMapboxLocationJson ||
        eventDetails?.start_location_json;
      let endLocation =
        eventDetails?.endMapboxLocationJson || eventDetails?.end_location_json;

      if (startLocation) {
        if (typeof startLocation === "string") {
          try {
            startLocation = JSON.parse(startLocation);
          } catch (e) {
            startLocation = null;
          }
        }
        if (
          startLocation &&
          startLocation.query &&
          Array.isArray(startLocation.query)
        ) {
          const startMarker = new mapboxgl.Marker({
            element: createLabeledMarkerElement({
              labelText: "Start",
              emoji: "🏁",
              size: 24,
            }),
          })
            .setLngLat([startLocation.query[0], startLocation.query[1]])
            .addTo(map);
          routePreviewMarkersRef.current.push(startMarker);
        }
      }

      // Checkpoints (🚩) and their waypoints (blue pins)
      if (Array.isArray(eventDetails?.checkpoints)) {
        [...eventDetails.checkpoints]
          .sort((a, b) => (a?.order || 0) - (b?.order || 0))
          .forEach((cp) => {
            if (
              typeof cp?.longitude === "number" &&
              typeof cp?.latitude === "number"
            ) {
              const cpLabel = cp?.name ? `${cp.name}` : "Checkpoint";
              const cpMarker = new mapboxgl.Marker({
                element: createLabeledMarkerElement({
                  labelText: cpLabel,
                  emoji: "🚩",
                  size: 24,
                }),
              })
                .setLngLat([cp.longitude, cp.latitude])
                .addTo(map);
              routePreviewMarkersRef.current.push(cpMarker);
            }

            const shapingJsons = [
              cp?.mapboxWaypoint1Json,
              cp?.mapboxWaypoint2Json,
            ].filter(Boolean);
            shapingJsons.forEach((j, idx) => {
              try {
                const fc = typeof j === "string" ? JSON.parse(j) : j;
                const c = fc?.features?.[0]?.geometry?.coordinates;
                if (
                  Array.isArray(c) &&
                  typeof c[0] === "number" &&
                  typeof c[1] === "number"
                ) {
                  const wpLabel = `${idx === 0 ? "Waypoint 1" : "Waypoint 2"}${
                    cp?.name ? `: ${cp.name}` : ""
                  }`;
                  const wpMarker = new mapboxgl.Marker({
                    element: createLabeledMarkerElement({
                      labelText: wpLabel,
                      color: "#1e90ff",
                      size: 18,
                    }),
                  })
                    .setLngLat([c[0], c[1]])
                    .addTo(map);
                  routePreviewMarkersRef.current.push(wpMarker);
                }
              } catch (e) {}
            });
          });
      }

      // End flag (🏁)
      if (endLocation) {
        if (typeof endLocation === "string") {
          try {
            endLocation = JSON.parse(endLocation);
          } catch (e) {
            endLocation = null;
          }
        }
        if (
          endLocation &&
          Array.isArray(endLocation.query) &&
          typeof endLocation.query[0] === "number" &&
          typeof endLocation.query[1] === "number"
        ) {
          const endMarker = new mapboxgl.Marker({
            element: createLabeledMarkerElement({
              labelText: "End",
              emoji: "🏁",
              size: 24,
            }),
          })
            .setLngLat([endLocation.query[0], endLocation.query[1]])
            .addTo(map);
          routePreviewMarkersRef.current.push(endMarker);
        }
      }
    } catch (e) {
      console.warn("Directions fetch failed", e);
    }
  }

  useEffect(() => {
    const modalEl = document.getElementById(id);
    if (!modalEl) return;

    const onShown = () => {
      try {
        if (!routePreviewMapRef.current && routePreviewContainerRef.current) {
          routePreviewMapRef.current = new mapboxgl.Map({
            container: routePreviewContainerRef.current,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [-98.5795, 39.8283],
            zoom: 1,
          });

          routePreviewMapRef.current.dragPan?.enable();
          routePreviewMapRef.current.scrollZoom?.enable();
          routePreviewMapRef.current.keyboard?.enable();
          routePreviewMapRef.current.doubleClickZoom?.enable();

          routePreviewMapRef.current.addControl(
            new mapboxgl.ScaleControl({ maxWidth: 80, unit: "metric" }),
            "bottom-right"
          );

          routePreviewMapRef.current.on("load", () => {
            buildAndRenderRoutePreview();
          });
        } else if (routePreviewMapRef.current) {
          routePreviewMapRef.current.resize();
          buildAndRenderRoutePreview();
        }
      } catch (e) {
        console.warn("Route preview init failed", e);
      }
    };

    const onHidden = () => {
      if (routePreviewMapRef.current) {
        try {
          routePreviewMapRef.current.remove();
        } catch (e) {}
        routePreviewMapRef.current = null;
      }
    };

    modalEl.addEventListener("shown.bs.modal", onShown);
    modalEl.addEventListener("hidden.bs.modal", onHidden);

    return () => {
      modalEl.removeEventListener("shown.bs.modal", onShown);
      modalEl.removeEventListener("hidden.bs.modal", onHidden);
    };
  }, [id, eventDetails]);

  // Keep route preview in sync with external eventDetails changes while modal is open
  useEffect(() => {
    if (routePreviewMapRef.current) {
      try {
        console.log(eventDetails);
        buildAndRenderRoutePreview();
      } catch (e) {}
    }
  }, [eventDetails]);

  async function placeMarker(
    coords,
    { fly = true } = {},
    selectedLocation,
    firstTime
  ) {
    if (!mapRef.current) return;
    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ draggable: true });
      markerRef.current.on("dragend", async () => {
        const lngLat = markerRef.current.getLngLat();
        const newCoords = [lngLat.lng, lngLat.lat];
        setSelectedCoords(newCoords);
      });
    }

    markerRef.current.setLngLat(coords).addTo(mapRef.current);

    if (fly) mapRef.current.flyTo({ center: coords, zoom: 12 });

    if (!popupRef.current) {
      popupRef.current = new mapboxgl.Popup({
        offset: 40,
        closeButton: false,
      });
    }
    if (selectedLocation) {
      popupRef.current
        .setLngLat(coords)
        .setHTML(
          `
          <div style="min-width:140px; position:relative; padding-right:24px;">
            ${escapeHtml(selectedLocation || "Selected location")}
            <button 
              onclick="this.closest('.mapboxgl-popup').remove()" 
              style="position:absolute; top:4px; right:4px; border:none; background:transparent; font-size:18px; cursor:pointer;"
            >
              ×
            </button>
          </div>
        `
        )
        .addTo(mapRef.current);
    }
    if (!firstTime) {
      const { data, label } = await reverseGeocodeAndSet(coords);
      await confirmSelection(coords, data, label);
    }
  }

  function escapeHtml(s) {
    return String(s || "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#039;",
        }[c])
    );
  }

  async function reverseGeocodeAndSet(coords) {
    setLoading(true);
    try {
      const data = await geocode({
        longitude: coords[0],
        latitude: coords[1],
      }).unwrap();
      setGeoCode(data);
      const label =
        data?.features?.[0]?.placeName?.replace(/Undefined, /g, "") || "";
      setSelectedLabel(label);
      return { data, label };
    } catch (e) {
      console.warn("Reverse geocode failed", e);
      return { data: null, label: "" };
    } finally {
      setLoading(false);
    }
  }

  // center on suggestion: use retrieveLocation when available (more accurate)
  const centerOnSuggestion = async (s) => {
    setLoading(true);
    try {
      let coords = s?.center || s?.geometry?.coordinates;
      let label = s?.placeName || s?.name || "";

      if (s?.mapboxId) {
        const result = await retrieveLocation(s.mapboxId)
          .unwrap()
          .catch(() => null);
        coords = result?.features?.[0]?.geometry?.coordinates || coords;
        label =
          result?.features?.[0]?.properties?.fullAddress?.replace(
            /Undefined, /g,
            ""
          ) || label;
      }

      if (coords && mapRef.current) {
        setSelectedLabel(label || "");
        placeMarker(coords, { fly: true }, label);
        setSelectedCoords(coords);
      }

      setSuggestions([]);
      setSearchText("");
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const goToCurrentLocation = () => {
    if (!navigator.geolocation || !mapRef.current) return;
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const coords = [pos.coords.longitude, pos.coords.latitude];
      setSelectedCoords(coords);
      placeMarker(coords, { fly: true });
      await reverseGeocodeAndSet(coords);
    });
  };

  const clearSelection = () => {
    setSelectedCoords(null);
    setSuggestions([]);
    setSelectedLabel("");
    if (markerRef.current) {
      try {
        markerRef.current.remove();
      } catch (e) {}
      markerRef.current = null;
    }
  };

  const confirmSelection = async (
    coords,
    retrievePayloadOverride,
    labelOverride
  ) => {
    if (!selectedCoords && !coords) return;
    setLoading(true);
    let label = labelOverride ?? selectedLabel;
    let retrievePayload = retrievePayloadOverride;

    if (!retrievePayload && retrievedLocation) {
      label =
        retrievedLocation?.features?.[0]?.properties?.fullAddress?.replace(
          /Undefined, /g,
          ""
        ) || label;
      retrievePayload = {
        ...retrievedLocation,
        query: selectedCoords || coords,
      };
    } else if (!retrievePayload) {
      label =
        geoCode?.features?.[0]?.placeName?.replace(/Undefined, /g, "") ||
        label ||
        "";
      retrievePayload = geoCode;
    }
    if (
      eventDetails?.startMapboxCountry &&
      (retrievePayload?.features?.[retrievePayload.features.length - 1]
        ?.properties?.context?.country?.name ||
        retrievePayload?.features?.[retrievePayload.features.length - 1]
          ?.placeName) !== eventDetails?.startMapboxCountry
    ) {
      errorToast(
        `Selected location is not in the ${eventDetails.startMapboxCountry}`
      );
      setLoading(false);
      return;
    }
    if (onSelect)
      onSelect({
        coordinates: selectedCoords || coords,
        label,
        retrievedLocation: retrievePayload,
      });

    console.log("reterive payload", retrievePayload);
    selectionConfirmedRef.current = true;
  };

  // keyboard: Enter on search selects first suggestion or triggers geocode
  const onSearchKeyDown = async (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (suggestions?.length > 0) {
        centerOnSuggestion(suggestions[0]);
      } else if (debouncedText) {
        setLoading(true);
        try {
          const data = await geocode({ query: debouncedText })
            .unwrap()
            .catch(() => null);
          const coords = data?.features?.[0]?.geometry?.coordinates;
          const label =
            data?.features?.[0]?.placeName?.replace(/Undefined, /g, "") ||
            debouncedText;
          if (coords) {
            setSelectedLabel(label);
            placeMarker(coords, { fly: true });
            setSelectedCoords(coords);
          }
        } catch (err) {
          console.warn(err);
        } finally {
          setLoading(false);
        }
      }
    }
  };

  const copyCoords = async () => {
    if (!selectedCoords) return;
    try {
      await navigator.clipboard.writeText(
        `${selectedCoords[1]}, ${selectedCoords[0]}`
      ); // lat, lng
      // small feedback could be added (toast)
    } catch (e) {
      console.warn("copy failed", e);
    }
  };

  return (
    <div
      className="modal fade"
      id={id}
      tabIndex={-1}
      aria-hidden="true"
      aria-labelledby={`${id}_label`}
    >
      <div
        className="modal-dialog modal-dialog-centered modal-xxl"
        style={{ width: "95vw", maxWidth: "95vw" }}
      >
        <div
          className="modal-content"
          style={{ overflow: "hidden", borderRadius: 8 }}
        >
          <div className="modal-header d-flex align-items-center">
            <h5 className="modal-title" id={`${id}_label`}>
              Select a location
            </h5>
            <button
              type="button"
              className="btn-close"
              data-bs-dismiss="modal"
              aria-label="Close"
            />
          </div>

          <div
            className="modal-body p-0"
            style={{
              minHeight: "60vh",
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                minHeight: "56vh",
              }}
            >
              {/* Left panel (search, suggestions, details) */}
              <div
                style={{
                  width: 380,
                  borderRight: "1px solid #e9ecef",
                  padding: 12,
                  display: "flex",
                  flexDirection: "column",
                  gap: 8,
                }}
              >
                <label className="form-label mb-1">Search</label>
                <div className="input-group">
                  <input
                    type="text"
                    className="form-control"
                    style={{ boxShadow: "none", borderColor: "inherit" }}
                    placeholder={
                      selectedLabel || "Search address, place, or lat,lng"
                    }
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    onKeyDown={onSearchKeyDown}
                    aria-label="Search location"
                  />
                  <button
                    className="btn btn-outline-secondary"
                    type="button"
                    onClick={() => {
                      setSearchText("");
                      setSuggestions([]);
                    }}
                    aria-label="Clear search"
                  >
                    Clear
                  </button>
                </div>

                <div className="d-flex gap-2 mt-2">
                  <button
                    className="btn btn-sm btn-primary"
                    type="button"
                    onClick={goToCurrentLocation}
                  >
                    My location
                  </button>
                  <button
                    className="btn btn-sm btn-outline-secondary"
                    type="button"
                    onClick={() =>
                      mapRef.current?.flyTo({
                        center: [-98.5795, 39.8283],
                        zoom: 3,
                      })
                    }
                  >
                    Reset view
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    type="button"
                    onClick={clearSelection}
                  >
                    Clear
                  </button>
                </div>

                <div style={{ flex: 1, marginTop: 8, overflowY: "auto" }}>
                  {loading && <div className="text-center py-2">Loading…</div>}
                  {error && <div className="text-danger small">{error}</div>}

                  {suggestions?.length > 0 ? (
                    <div className="list-group">
                      {suggestions.map((s, idx) => {
                        const fullAddress =
                          s?.fullAddress ||
                          s.properties?.address ||
                          s.context?.join?.(", ") ||
                          "";
                        return (
                          <button
                            key={idx}
                            type="button"
                            className="list-group-item list-group-item-action"
                            onClick={() => centerOnSuggestion(s)}
                          >
                            <div style={{ fontSize: 14, fontWeight: 600 }}>
                              {s.placeName || s.name}
                            </div>
                            {fullAddress ? (
                              <div
                                style={{
                                  fontSize: 12,
                                  color: "#6c757d",
                                  whiteSpace: "nowrap",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                }}
                              >
                                {fullAddress}
                              </div>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="small text-muted">
                      Type to search places or click on the map to drop a pin.
                    </div>
                  )}
                </div>

                {/* Selected info */}
                <div style={{ borderTop: "1px solid #eee", paddingTop: 8 }}>
                  <div className="d-flex justify-content-between align-items-start">
                    <div>
                      <div className="small text-muted">Selected</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>
                        {selectedLabel ||
                          (selectedCoords
                            ? `${selectedCoords[1].toFixed(
                                6
                              )}, ${selectedCoords[0].toFixed(6)}`
                            : "None")}
                      </div>
                      {selectedCoords && (
                        <div className="small text-muted mt-1">
                          Lat: {selectedCoords[1].toFixed(6)} • Lng:{" "}
                          {selectedCoords[0].toFixed(6)}
                        </div>
                      )}
                    </div>

                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        className="btn btn-sm btn-outline-secondary"
                        onClick={copyCoords}
                        disabled={!selectedCoords}
                      >
                        Copy
                      </button>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={confirmSelection}
                        disabled={!geoCode && !retrievedLocation}
                      >
                        Select
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ flex: 1, position: "relative" }}>
                <div
                  ref={mapContainerRef}
                  style={{ height: "100%", width: "100%" }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 12,
                    top: 12,
                    zIndex: 10,
                  }}
                >
                  <div className="btn-group-vertical">
                    <button
                      className="btn btn-light btn-sm"
                      type="button"
                      title="Zoom in"
                      onClick={() =>
                        mapRef.current?.zoomTo(
                          (mapRef.current.getZoom() || 0) + 1
                        )
                      }
                    >
                      ＋
                    </button>
                    <button
                      className="btn btn-light btn-sm"
                      type="button"
                      title="Zoom out"
                      onClick={() =>
                        mapRef.current?.zoomTo(
                          (mapRef.current.getZoom() || 0) - 1
                        )
                      }
                    >
                      －
                    </button>
                  </div>
                </div>
                <div className="me-auto text-end mt-1 small text-muted">
                  Tip: you can drag the pin to fine tune the position.
                </div>
              </div>

              <div
                style={{
                  width: 2,
                  background: "#e0e0e0",
                  margin: "0 12px",
                  minHeight: 0,
                }}
              />

              {/* Right panel (route preview) */}
              <div
                style={{
                  flex: 0.8,
                  padding: 6,
                  paddingLeft: 3,
                  gap: 8,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <div style={{ fontWeight: 900, fontSize: 16 }}>
                  Route preview
                </div>
                <div
                  ref={routePreviewContainerRef}
                  style={{
                    flex: 1,
                    minHeight: 0,

                    overflow: "hidden",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    right: 24,
                    top: 50,
                    zIndex: 10,
                  }}
                >
                  <div className="btn-group-vertical">
                    <button
                      className="btn btn-light btn-sm"
                      type="button"
                      title="Zoom in"
                      onClick={() =>
                        routePreviewMapRef.current?.zoomTo(
                          (routePreviewMapRef.current.getZoom() || 0) + 1
                        )
                      }
                    >
                      ＋
                    </button>
                    <button
                      className="btn btn-light btn-sm"
                      type="button"
                      title="Zoom out"
                      onClick={() =>
                        routePreviewMapRef.current?.zoomTo(
                          (routePreviewMapRef.current.getZoom() || 0) - 1
                        )
                      }
                    >
                      －
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
              onClick={() => onCancel()}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={closeModal}
              disabled={!geoCode && !retrievedLocation}
            >
              Use This Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
