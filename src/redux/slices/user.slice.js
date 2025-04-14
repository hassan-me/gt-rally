import { createSlice } from '@reduxjs/toolkit';

import { api } from './api.slice';

// Default initial state
const DEFAULT_STATE = {
  token: '',
  user: {
    id: '',
    city: '',
    state: '',
    email: '',
    zipCode: '',
    username: '',
    lastName: '',
    firstName: '',
    profileImage: '',
    profileImageUrl: '',
    ssoProfileImage: '',
  },
};

const userSlice = createSlice({
  name: 'user',
  initialState: { ...DEFAULT_STATE },
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
    },
    logout: (state) => {
      state.user = DEFAULT_STATE.user;
      state.token = DEFAULT_STATE.token;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(api.endpoints.signup.matchFulfilled, (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
    });
    // builder.addMatcher(api.endpoints.login.matchFulfilled, (state, action) => {
    //   state.user = action.payload.user;
    //   state.token = action.payload.token;
    // });
    // builder.addMatcher(api.endpoints.sso.matchFulfilled, (state, action) => {
    //   state.user = action.payload.user;
    //   state.token = action.payload.token;
    // });
    // builder.addMatcher(api.endpoints.getProfile.matchFulfilled, (state, action) => {
    //   state.user = action.payload;
    // });
  },
});

// Exports
export const { setUser, logout } = userSlice.actions;

// Selectors
export const selectUser = (state) => state.user.user;
export const selectToken = (state) => state.user.token;

export default userSlice.reducer;
