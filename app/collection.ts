import { createSlice } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import type { RootState } from './store';

export interface Collection {
    readonly items: Record<string, CollectedItem>;
}

export interface CollectedItem {
    readonly id: string;
    readonly seen: boolean;
    readonly licensed: boolean;
    readonly licenceProgress?: number;
    readonly storageAmount?: number;
}

export const collectionSlice = createSlice({
    name: 'collection',
    initialState: { items: {} } as Collection,
    reducers: {
        load: (state, action) => {
            console.log('load collection');
            state = action.payload;
        },
        observe: (state, action) => {
            const id = action.payload as string;
            if (!state.items[id]) {
                state.items[id] = { id, seen: true, licensed: false };
            } else {
                state.items[id].seen = true;
            }
        },
        markLicensed: (state, action) => {
            const id = action.payload as string;
            if (!state.items[id]) {
                state.items[id] = { id, seen: true, licensed: true };
            } else {
                state.items[id].licensed = true;
            }
            // TODO: probably a setState instead for this + above + unmark?
        },
        // TODO: update license amount
    },
});

export function useCollection(): Collection {
    return useSelector((state: RootState) => state.collection);
}

export function useCollectedItem(id: string) {
    const collection = useCollection();
    // TODO: have fake collection data to load, default progress back to 0
    return collection.items[id] || { id, seen: false, licensed: false, licenceProgress: 25 };
}
