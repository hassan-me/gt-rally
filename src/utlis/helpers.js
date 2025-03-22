
export const formatDateRange = (s, e) => `${s.slice(8, 10)}/${s.slice(5, 7)} - ${e.slice(8, 10)}/${e.slice(5, 7)}`;
export const metersToMiles = (meters) => (meters * 0.000621371).toFixed(2); // Convert meters to miles
export const formatDuration = (duration) => {
  if (duration == null) return "NA";
  const hours = Math.floor(duration / 3600);
  const minutes = Math.floor((duration % 3600) / 60);
  return [hours ? hours + "h" : "", minutes ? minutes + "m" : ""].filter(Boolean).join(" ");
}

export const getImage = (imgId) => {
  return `https://gt-rally.web.app/image_web/${imgId}`;
}