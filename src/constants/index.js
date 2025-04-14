// src/constants/index.js

export const HTTP_METHODS = {
  GET: 'GET',
  POST: 'POST',
  PUT: 'PUT',
  DELETE: 'DELETE',
  PATCH: 'PATCH',
};

export const HTTP_HEADERS = {
  CONTENT_JSON: {
    'Content-Type': 'application/json',
  },
  ACCEPT_JSON: {
    Accept: 'application/json',
  },
  AUTH: (token) => ({
    Authorization: `Bearer ${token}`,
  }),
};

export const HTTP_STATUS_CODES = {
  UNAUTHORIZED: 401,
  INTERNAL_SERVER_ERROR: 500,
};

export const EventType = {
  All: { label: 'All', type: 'All' },
  GRAND_TOURING_RALLY: { label: 'Grand Touring Rally', type: 'GRAND_TOURING_RALLY' },
  CUSTOM_DRIVE: { label: 'Custom Drive', type: 'CUSTOM_DRIVE' },
  CAR_MEETS: { label: 'Car Meets', type: 'CAR_MEETS' },
};

export default {
  HTTP_METHODS,
  HTTP_HEADERS,
  HTTP_STATUS_CODES,
  EventType,
};
