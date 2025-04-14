// src/configs/index.js


export default {
  EVENT_IMAGE_LIMIT: 4,
  REQUEST_TIMEOUT: 30000,
  SERVER_API_BASE_URL: import.meta.env.VITE_API_URL ?? '',
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
};
