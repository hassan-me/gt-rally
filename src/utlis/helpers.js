
export const formatDateRange = (s, e) => `${s.slice(8, 10)}/${s.slice(5, 7)} - ${e.slice(8, 10)}/${e.slice(5, 7)}`;
export const metersToMiles = (meters) => (meters * 0.000621371).toFixed(2); // Convert meters to miles
export const formatDuration = (duration) => {
  if (duration == null) return "NA";
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  return [hours ? hours + "h" : "", minutes ? minutes + "m" : ""].filter(Boolean).join(" ");
}

export const getImage = (imgId) => {
  return `https://gtrally.web.app/image_web/${imgId}`;
}

export const toIsoStringOrEmpty = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return "";
  try {
    const [y, m, d] = dateStr.split("-").map((n) => parseInt(n, 10));
    const [hh, mm] = timeStr.split(":").map((n) => parseInt(n, 10));
    if (
      Number.isNaN(y) ||
      Number.isNaN(m) ||
      Number.isNaN(d) ||
      Number.isNaN(hh) ||
      Number.isNaN(mm)
    ) {
      return "";
    }
    const pad = (n) => String(n).padStart(2, "0");
    return `${y}-${pad(m)}-${pad(d)}T${pad(hh)}:${pad(mm)}:00`;
  } catch (e) {
    return "";
  }
};

export const toLocalHHMM = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
};

export const toLocalYYYYMMDD = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};
export const toUtcIso = (localIso) => {
  if (!localIso) return "";
  const d = new Date(localIso);
  if (isNaN(d.getTime())) return "";
  return d.toISOString();
};

export const normalizeMapboxFeature = (raw) => {
  if (!raw) return null;

  let parsed = raw;
  if (typeof raw === "string") {
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("Invalid JSON:", err);
      return null;
    }
  }

  if (parsed.type === "FeatureCollection") {
    return {
      type: "FeatureCollection",
      attribution: parsed.attribution || "",
      query: parsed.query || [],
      features: parsed.features?.map((f) => normalizeFeature(f)) || [],
    };
  }

  return null;
}

const normalizeFeature = (f) => {
  return {
    id: f.id || f.ID || "",
    text: f.text || f.Text || "",
    relevance: f.relevance ?? f.Relevance ?? 0,
    place_name: f.placeName || f.place_name || "",
    type: f.type || f.Type || "Feature",
    address: f.address || f.Address || "",
    place_type: Array.isArray(f.placeType) ? f.placeType : (Array.isArray(f.place_type) ? f.place_type : []),
    center: Array.isArray(f.center) ? f.center : (Array.isArray(f.Center) ? f.Center : [0, 0]),
    bbox: Array.isArray(f.bbox) ? f.bbox : (Array.isArray(f.BBOX) ? f.BBOX : undefined),
    properties: {
      name: f.properties?.name || f.properties?.Name || "",
      accuracy: f.properties?.accuracy || f.properties?.Accuracy || "",
      mapbox_id: f.properties?.mapboxId || f.properties?.mapbox_id || "",
    },
    geometry: {
      type: f.geometry?.type || f.geometry?.Type || "Point",
      coordinates: f.geometry?.coordinates || f.geometry?.Coordinates || [0, 0],
    },
    context: Array.isArray(f.context)
      ? f.context.map((c) => ({
          id: c.id || c.ID || "",
          text: c.text || c.Text || "",
          mapbox_id: c.mapboxId || c.mapbox_id || "",
          wikidata: c.wikidata || c.Wikidata || "",
          short_code: c.shortCode || c.short_code || "",
        }))
      : [],
  };
}

