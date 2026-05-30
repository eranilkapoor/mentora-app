import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface ChatsState {
  unreadCount: number;
}

const initialState: ChatsState = {
  unreadCount: 0,
};

const chatsSlice = createSlice({
  name: 'chats',
  initialState,
  reducers: {
    setUnreadCount: (state, action: PayloadAction<number>) => {
      state.unreadCount = action.payload;
    },
  },
});

export const { setUnreadCount } = chatsSlice.actions;

export default chatsSlice.reducer;
