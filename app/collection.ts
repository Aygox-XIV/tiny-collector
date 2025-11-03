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
    readonly licenseProgress?: number;
    readonly storageAmount?: number;
}

export interface ChangeStatusArgs {
    readonly id: string;
    readonly status: ItemStatus;
}

export interface SetLicenceAmountArgs {
    readonly id: string;
    readonly amount: number;
}

export const collectionSlice = createSlice({
    name: 'collection',
    initialState: { items: {} } as Collection,
    reducers: {
        load: (state, action: PayloadAction<Collection>) => {
            state = action.payload;
            // TODO: use clientLoader to read from local storage & call this
        },
        changeStatus: (state, action: PayloadAction<ChangeStatusArgs>) => {
            const args = action.payload;
            if (!state.items[args.id]) {
                state.items[args.id] = { id: args.id, status: args.status };
            } else {
                state.items[args.id] = { ...state.items[args.id], status: args.status };
            }
            // TODO: save to local storage
        },
        setLicenseAmount: (state, action: PayloadAction<SetLicenceAmountArgs>) => {
            const args = action.payload;
            if (!state.items[args.id]) {
                state.items[args.id] = { ...defaultCollectionState(args.id), licenseProgress: args.amount };
            } else {
                state.items[args.id] = { ...state.items[args.id], licenseProgress: args.amount };
            }
            // TODO: save to local storage
        },
        // TODO: toggle to keep crafting even if it's licensed
        // TODO: toggle to craft at all even if it's not licensable
        // TODO: maybe a toggle per source? could have some "game state" settings to toggle a bunch of these by default ('active event', etc)
        // TODO: toggle per alt recipe
    },
});

function defaultCollectionState(id: string): CollectedItem {
    // TODO: have fake collection data to load, default progress back to 0
    return { id, status: { haveRecipe: false, licensed: false }, licenseProgress: 50 };
}

export const { load, changeStatus, setLicenseAmount } = collectionSlice.actions;

export function useFullCollection(): Collection {
    return useAppSelector((state) => state.collection);
}

export function useCollectedItem(id: string): CollectedItem {
    const item = useAppSelector((state) => state.collection.items[id]);
    return item || defaultCollectionState(id);
}
