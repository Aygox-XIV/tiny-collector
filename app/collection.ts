import { createSlice } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import type { RootState } from './store';

export interface Collection {
    readonly items: Record<string, CollectedItem>;
}

export type ItemStatus = 'unseen' | 'seen' | 'licensed';

export interface CollectedItem {
    readonly id: string;
    readonly status: ItemStatus;
    readonly licenceProgress?: number;
    readonly storageAmount?: number;
}

export interface ChangeStatusArgs {
    readonly id: string;
    readonly status: ItemStatus;
}

export const collectionSlice = createSlice({
    name: 'collection',
    initialState: { items: {} } as Collection,
    reducers: {
        load: (state, action) => {
            console.log('load collection');
            state = action.payload;
        },
        changeStatus: (state, action) => {
            const args = action.payload as ChangeStatusArgs;
            if (!state.items[args.id]) {
                state.items[args.id] = { ...args };
            } else {
                state.items[args.id] = { ...state.items[args.id], status: args.status };
            }
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
