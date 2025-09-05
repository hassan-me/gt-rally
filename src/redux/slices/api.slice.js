import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../../axios/axiosBaseQuery';
import { API_ROUTES } from '../../configs/';
import {HTTP_METHODS} from '../../constants';



export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ instance: 'default' }), 
  tagTypes: ['Events'],
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (userData) => ({
        url: API_ROUTES.AUTH.SIGN_UP,
        method: HTTP_METHODS.POST,
        data: userData, 
      }),
    }),
    login: builder.mutation({
      query: (userData) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: HTTP_METHODS.POST,
        data: userData, 
      }),
    }),
    getPublicEvents: builder.query({
      query: (userData) => ({
        url: API_ROUTES.EVENT.PUBLIC,
        data: userData, 
      }),
      
    }),
    getMyEvents: builder.query({
      query: () => ({
        url: API_ROUTES.EVENT.MY_EVENTS,
        headers: {
          'Cache-Control': 'no-cache',
        },
      }),
      providesTags: ['Events'],
    }),
    getEventById: builder.query({
      query: ({ id }) => ({
        url: `${API_ROUTES.EVENT.BASE}/${id}`,
      }),
    }),
    getProfile: builder.query({
      query: () => ({
        url: API_ROUTES.USER.PROFILE,
        headers: {
          'Cache-Control': 'no-cache',
        },
      }),
    }),    

    updateProfile: builder.mutation({
      query: (formData) => ({
        url: API_ROUTES.USER.PROFILE,
        method: HTTP_METHODS.POST,
        data: formData, 
      }),
    }),
    createGarage: builder.mutation({
      query: (formData) => ({
        url: API_ROUTES.GARAGE.GARAGE,
        method: HTTP_METHODS.POST,
        data: formData, 

      }),
    }),
    createEditEvent: builder.mutation({
      query: (formData) => ({
        data:formData,
        method: HTTP_METHODS.POST,
        url: API_ROUTES.EVENT.BASE,
      }),
    }),
    createEditCheckpoint: builder.mutation({
      query: (formData) => ({
        data:formData,
        method: HTTP_METHODS.POST,
        url: API_ROUTES.EVENT.CHECKPOINTS,
      }),
    }),
    updateCheckpointOrder: builder.mutation({
      query: ({ from, to }) => ({
        url: API_ROUTES.EVENT.UPDATE_CHECKPOINT_ORDER,
        method: HTTP_METHODS.POST,
        data: { from, to },
      }),
    }),

    deleteEvent: builder.mutation({
      query: (id) => ({
        url: `${API_ROUTES.EVENT.BASE}/${id}`,
        method: HTTP_METHODS.DELETE,
      }),
      invalidatesTags: ['Events'],
    }),
    deleteCheckpoint: builder.mutation({
      query: (id) => ({
        url: `${API_ROUTES.EVENT.CHECKPOINTS}/${id}`,
        method: HTTP_METHODS.DELETE,
      }),
    }),
  }),
});

export const { useSignupMutation,useCreateEditCheckpointMutation,useDeleteCheckpointMutation,useDeleteEventMutation,useGetProfileQuery,useCreateEditEventMutation, useLoginMutation,useGetMyEventsQuery,useUpdateProfileMutation,useCreateGarageMutation,useGetEventByIdQuery,useGetPublicEventsQuery,useUpdateCheckpointOrderMutation } = api;
