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
  eventDetails,
  onSelect,
}) {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
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
            placeMarker(initCoords, { fly: true });
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

  function placeMarker(coords, { fly = true } = {}, selectedLocation) {
    if (!mapRef.current) return;
    if (!markerRef.current) {
      markerRef.current = new mapboxgl.Marker({ draggable: true });
      markerRef.current.on("dragend", async () => {
        const lngLat = markerRef.current.getLngLat();
        const newCoords = [lngLat.lng, lngLat.lat];
        setSelectedCoords(newCoords);
        await reverseGeocodeAndSet(newCoords);
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
    } catch (e) {
      console.warn("Reverse geocode failed", e);
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

  const confirmSelection = async () => {
    if (!selectedCoords) return;
    setLoading(true);
    let label = selectedLabel;
    let retrievePayload;

    if (retrievedLocation) {
      label =
        retrievedLocation?.features?.[0]?.properties?.fullAddress?.replace(
          /Undefined, /g,
          ""
        ) || label;
      retrievePayload = { ...retrievedLocation, query: selectedCoords };
    } else {
      label =
        geoCode?.features?.[0]?.placeName?.replace(/Undefined, /g, "") ||
        label ||
        "";
      retrievePayload = geoCode;
    }
    if (
      eventDetails?.startMapboxCountry &&
      retrievePayload?.features?.[retrievePayload.features.length - 1]
        ?.placeName !== eventDetails?.startMapboxCountry
    ) {
      errorToast(
        `Selected location is not in the ${eventDetails.startMapboxCountry}`
      );
      setLoading(false);
      return;
    }
    if (onSelect)
      onSelect({
        coordinates: selectedCoords,
        label,
        retrievedLocation: retrievePayload,
      });
    const modalEl = document.getElementById(id);
    Modal.getInstance(modalEl)?.hide();
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
      <div className="modal-dialog modal-dialog-centered modal-xl">
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
            style={{ display: "flex", minHeight: "60vh" }}
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

            {/* Map container */}
            <div style={{ flex: 1, position: "relative" }}>
              <div
                ref={mapContainerRef}
                style={{ height: "100%", width: "100%" }}
              />

              {/* Floating actions on map */}
              <div
                style={{ position: "absolute", right: 12, top: 12, zIndex: 10 }}
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
            </div>
          </div>

          <div className="modal-footer">
            <div className="me-auto small text-muted">
              Tip: you can drag the pin to fine tune the position.
            </div>
            <button
              type="button"
              className="btn btn-secondary"
              data-bs-dismiss="modal"
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={confirmSelection}
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
