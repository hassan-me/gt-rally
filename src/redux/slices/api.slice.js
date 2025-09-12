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

    getRallyInvites: builder.query({
      query: (rallyId) => ({
        url: `${API_ROUTES.RALLY_INVITES.GET_RALLY_INVITES}/${rallyId}`,
      }),
    }),
    getRallyParticipants: builder.query({
      query: (rallyId) => ({
        url: `${API_ROUTES.RALLY_INVITES.GET_RALLY_PARTICIPANTS}/${rallyId}`,
      }),
    }),
    getPreviousDrivers: builder.query({
      query: (rallyId) => ({
        url: `${API_ROUTES.INVITE_DRIVERS.PREVIOUS_DRIVERS}/${rallyId}`,
      }),
    }),
    getAllUsers: builder.query({
      query: (rallyId) => ({
        url: `${API_ROUTES.INVITE_DRIVERS.ALL_USERS}/${rallyId}`,
      }),
    }),
    sendInviteToDrivers: builder.mutation({
      query: (body) => ({
        url: API_ROUTES.INVITE_DRIVERS.INVITE_DRIVERS,
        method: HTTP_METHODS.POST,
        data: body,
      }),
    }),

    acceptOrRejectInvite: builder.mutation({
      query: (data) => ({
        url: `${API_ROUTES.RALLY_INVITES.ACCEPT_REJECT_INVITE}`,
        method: HTTP_METHODS.POST,
        data,
      }),
  
    }),

    createUpdateGarage: builder.mutation({
      query: (body) => ({
        url: API_ROUTES.GARAGE.GARAGE,
        method: HTTP_METHODS.POST,
        data: body,
      }),
      invalidatesTags: ['Garage'],
    }),

    deleteGarage: builder.mutation({
      query: (id) => ({
        url: `${API_ROUTES.GARAGE.GARAGE}/${id}`,
        method: HTTP_METHODS.DELETE,
      }),
      invalidatesTags: ['Garage'],
    }),

    getGarage: builder.query({
      query: () => ({
        url: API_ROUTES.GARAGE.GARAGE,
        method: HTTP_METHODS.GET,
      }),
      providesTags: ['Garage'],
    }),

  }),
});



export const { useSignupMutation,useDeleteGarageMutation,useGetGarageQuery,useCreateUpdateGarageMutation,useCreateEditCheckpointMutation,useAcceptOrRejectInviteMutation,useDeleteCheckpointMutation,useDeleteEventMutation,useGetProfileQuery,useCreateEditEventMutation, useLoginMutation,useGetMyEventsQuery,useUpdateProfileMutation,useGetEventByIdQuery,useGetPublicEventsQuery,useUpdateCheckpointOrderMutation,useGetRallyInvitesQuery,useGetRallyParticipantsQuery,useGetPreviousDriversQuery,useGetAllUsersQuery,useSendInviteToDriversMutation } = api;
