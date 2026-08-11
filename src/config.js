
// const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api/";
// const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "http://127.0.0.1:8000";

// // Full API base URL used by some services (e.g. houseHuntingService).
// export const API_BASE_URL_CORE = `${API_BASE_URL}core/`;

// // Helper: resolve a relative media path (e.g. "/media/profiles/x.jpg")
// // to an absolute URL using the configured MEDIA_URL.
// export function toAbsoluteMedia(path) {
//   if (!path) return "";
//   if (path.startsWith("http")) return path;
//   return `${MEDIA_URL}${path.startsWith("/") ? "" : "/"}${path}`;
// }

// export { API_BASE_URL, MEDIA_URL };

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://lexnul.alwaysdata.net/api/";
const MEDIA_URL = import.meta.env.VITE_MEDIA_URL || "https://lexnul.alwaysdata.net";

// Full API base URL used by some services (e.g. houseHuntingService).
export const API_BASE_URL_CORE = `${API_BASE_URL}core/`;

// Helper: resolve a relative media path (e.g. "/media/profiles/x.jpg")
// to an absolute URL using the configured MEDIA_URL.
export function toAbsoluteMedia(path) {
  if (!path) return "";
  if (path.startsWith("http")) return path;
  return `${MEDIA_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export { API_BASE_URL, MEDIA_URL };