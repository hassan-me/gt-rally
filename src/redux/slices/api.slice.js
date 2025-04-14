import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '../../axios/axiosBaseQuery';



export const api = createApi({
  reducerPath: 'api',
  baseQuery: axiosBaseQuery({ instance: 'default' }), 
  endpoints: (builder) => ({
    signup: builder.mutation({
      query: (userData) => ({
        url: '/signup',
        method: 'POST',
        data: userData, 
      }),
    }),
  }),
});

export const { useSignupMutation } = api;
