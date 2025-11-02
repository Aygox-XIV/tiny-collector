import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useAppSelector } from './store';

export interface Collection {
    readonly items: Record<string, CollectedItem>;
}

export interface ItemStatus {
    readonly haveRecipe: boolean;
    readonly licensed: boolean;
}

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
        load: (state, action: PayloadAction<Collection>) => {
            console.log('load collection');
            state = action.payload;
        },
        changeStatus: (state, action: PayloadAction<ChangeStatusArgs>) => {
            const args = action.payload;
            if (!state.items[args.id]) {
                state.items[args.id] = { ...args };
            } else {
                state.items[args.id] = { ...state.items[args.id], status: args.status };
            }
        },
        setLicenseAmount: (state, action) => {},
        // TODO: update license amount
        // TODO: toggle to keep crafting even if it's licensed
        // TODO: toggle to craft at all even if it's not licensable
        // TODO: maybe a toggle per source? could have some "game state" settings to toggle a bunch of these by default ('active event', etc)
        // TODO: toggle per alt recipe
    },
});

export const { load, changeStatus } = collectionSlice.actions;

export function useFullCollection(): Collection {
    return useAppSelector((state) => state.collection);
}

export function useCollectedItem(id: string): CollectedItem {
    const item = useAppSelector((state) => state.collection.items[id]);
    // TODO: have fake collection data to load, default progress back to 0
    return item || { id, status: { haveRecipe: false, licensed: false }, licenceProgress: 50 };
}
