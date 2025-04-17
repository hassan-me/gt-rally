import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../../axios/axiosBaseQuery';
import { API_ROUTES } from '../../configs/';
import {HTTP_METHODS} from '../../constants';



export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ instance: 'default' }), 
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
    getPublicEvents: builder.mutation({
      query: (userData) => ({
        url: API_ROUTES.EVENT.PUBLIC,
        data: userData, 
      }),
      
    }),
    getMyEvents: builder.mutation({
      query: () => ({
        url: API_ROUTES.EVENT.MY_EVENTS
      }),
    }),
  }),
});

export const { useSignupMutation, useLoginMutation,useGetMyEventsMutation} = api;
