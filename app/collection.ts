import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useAppSelector } from './store';

export interface Collection {
    readonly items: Record<string, CollectedItem>;
    readonly initialized?: boolean;
}

export interface ItemStatus {
    // For craftable/sellable items
    readonly haveRecipe?: boolean;
    readonly licensed?: boolean;
    // For decor, quest items, etc
    readonly collected?: boolean;
}

export interface CollectedItem {
    // TODO: needed? or just duplicate?
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
            state.items = action.payload.items;
            state.initialized = true;
            console.log('Loaded: ' + Object.keys(action.payload.items).length + ' items with a collection status');
        },
        changeStatus: (state, action: PayloadAction<ChangeStatusArgs>) => {
            const args = action.payload;
            // TODO: optimize status by omitting `false` entries.
            if (!state.items[args.id]) {
                state.items[args.id] = { id: args.id, status: args.status };
            } else {
                state.items[args.id] = { ...state.items[args.id], status: args.status };
            }
            saveCollection(state);
        },
        setLicenseAmount: (state, action: PayloadAction<SetLicenceAmountArgs>) => {
            const args = action.payload;
            if (!state.items[args.id]) {
                state.items[args.id] = { ...defaultCollectionState(args.id), licenseProgress: args.amount };
            } else {
                state.items[args.id] = { ...state.items[args.id], licenseProgress: args.amount };
            }
            saveCollection(state);
        },
        // TODO: toggle to keep crafting even if it's licensed
        // TODO: toggle to craft at all even if it's not licensable
        // TODO: maybe a toggle per source? could have some "game state" settings to toggle a bunch of these by default ('active event', etc)
        // TODO: toggle per alt recipe
    },
});

const COLLECTION_STORAGE_KEY = 'tiny-collector.Collection';

function saveCollection(coll: Collection) {
    // TODO: compress, probably (max is 5MB; probably enough, but will still depend on read/write speed).
    // TODO: add a rate limiter, at least for when the license amount input gets edited (cheap option: only save on focus lost?)
    // optional: optimize collection state format (e.g. at some point, it may be cheaper to switch some defaults?)
    localStorage.setItem(COLLECTION_STORAGE_KEY, JSON.stringify(coll));
}

export function loadCollection(): Collection {
    return parseCollection(localStorage.getItem(COLLECTION_STORAGE_KEY));
}

export function parseCollection(data?: string | undefined | null): Collection {
    if (!data) {
        return { items: {} };
    }
    return JSON.parse(data) as Collection;
    // TODO: sanitize?
}

function defaultCollectionState(id: string): CollectedItem {
    return { id, status: {} };
}

export const { load, changeStatus, setLicenseAmount } = collectionSlice.actions;

export function useFullCollection(): Collection {
    return useAppSelector((state) => state.collection);
}

export function useCollectionInitialized(): boolean {
    return useAppSelector((state) => state?.collection?.initialized || false);
}

export function useCollectedItem(id: string): CollectedItem {
    const item = useAppSelector((state) => state.collection.items[id]);
    return item || defaultCollectionState(id);
}
