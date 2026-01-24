import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  workspaces: [],
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setLoginData: (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.user = action.payload.user;
      state.workspaces = action.payload.workspaces;
      state.isAuthenticated = !!action.payload.accessToken;
    },
    logout: (state) => {
      state.accessToken = null;
      state.refreshToken = null;
      state.user = null;
      state.workspaces = [];
      state.isAuthenticated = false;
    },
  },
});

export const { setLoginData, logout } = authSlice.actions;

export default authSlice.reducer;