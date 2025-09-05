import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/axios/axiosBaseQuery';
import { API_ROUTES } from '@/configs';

export const mapApi = createApi({
  reducerPath: 'mapAPI',
  baseQuery: axiosBaseQuery({ instance: 'mapbox' }),
  endpoints: (builder) => ({
    suggestLocation: builder.query({
      query: ({ query, proximity }) => ({
        url: API_ROUTES.MAP.SEARCH_SUGGEST,
        params: {
          q: query,
          ...(proximity && { proximity: `${proximity.longitude},${proximity.latitude}` }),
          access_token: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
          session_token: import.meta.env.VITE_MAPBOX_SESSION_TOKEN,
        },
      }),
    }),
    retrieveLocation: builder.query({
      query: (mapboxId) => ({
        url: `${API_ROUTES.MAP.SEARCH_RETRIEVE}/${mapboxId}`,
        params: {
          access_token: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
          session_token: import.meta.env.VITE_MAPBOX_SESSION_TOKEN,
        },
      }),
    }),
    fetchRoute: builder.query({
      query: ({ startPoint, endPoint, exclusions }) => ({
        url: `${API_ROUTES.MAP.DIRECTIONS}/${startPoint};${endPoint}`,
        params: {
          steps: true,
          overview: 'full',
          geometries: 'geojson',
          exclude: (exclusions || []).join(','),
          access_token: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
        },
      }),
    }),
    geocode: builder.query({
      query: ({ longitude, latitude }) => ({
        url: `${API_ROUTES.MAP.GEOCODING}/${longitude},${latitude}.json`,
        params: {
          access_token: import.meta.env.VITE_MAPBOX_ACCESS_TOKEN,
        },
      }),
    }),
  }),
});

export const {
  useFetchRouteQuery,
  useLazyGeocodeQuery,
  useSuggestLocationQuery,
  useLazyRetrieveLocationQuery,
} = mapApi;

export default mapApi;


