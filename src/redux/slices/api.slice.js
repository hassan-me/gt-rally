import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../../axios/axiosBaseQuery';
import { API_ROUTES } from '../../configs/';


export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ instance: 'default' }), 
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (userData) => ({
        url: API_ROUTES.AUTH.SIGN_UP,
        method: 'POST',
        data: userData, 
      }),
    }),
    login: builder.mutation({
      query: (userData) => ({
        url: API_ROUTES.AUTH.LOGIN,
        method: 'POST',
        data: userData, 
      }),
    }),
  }),
});

export const { useSignupMutation, useLoginMutation} = api;
