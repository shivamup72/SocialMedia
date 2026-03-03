import {createSlice} from '@reduxjs/toolkit';

const initialState = {
  replyCount: 0,
};

const replyCountSlice = createSlice({
  name: 'replyCount',
  initialState,
  reducers: {
    setReplyCount(state, action) {
      state.replyCount = action.payload;
    },
    incrementReplyCount(state) {
      state.replyCount += 1;
    },
    decrementReplyCount(state) {
      state.replyCount = Math.max(0, state.replyCount - 1);
    },
  },
});

export const {setReplyCount, incrementReplyCount, decrementReplyCount} =
  replyCountSlice.actions;
export default replyCountSlice.reducer;
