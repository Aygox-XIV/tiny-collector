import { configureStore } from '@reduxjs/toolkit';
import { collectionSlice } from './collection';
import { dbSlice } from './database';

export const store = configureStore({
    reducer: {
        db: dbSlice.reducer,
        collection: collectionSlice.reducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
