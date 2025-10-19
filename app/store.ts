import { configureStore } from '@reduxjs/toolkit';
import { dbSlice } from './database';

export const store = configureStore({
    reducer: {
        db: dbSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
