import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { defaultCollectionState, type Collection, type ItemStatus } from './collection';

export interface ChangeStatusArgs {
    readonly id: string;
    readonly status: ItemStatus;
    readonly skipStorageUpdate?: boolean;
}

export interface SetLicenceAmountArgs {
    readonly id: string;
    readonly amount: number;
}

export interface BoolActionArgs {
    readonly id: string;
    readonly newValue: boolean;
}

export interface StyleChangeArgs {
    readonly smallScreen: boolean;
}

export const collectionSlice = createSlice({
    name: 'collection',
    initialState: { items: {} } as Collection,
    reducers: {
        load: (state, action: PayloadAction<Collection>) => {
            state.items = action.payload.items;
            state.smallScreen = action.payload.smallScreen;
            state.initialized = true;
            console.log('Loaded: ' + Object.keys(action.payload.items).length + ' items with a collection status');
        },
        resetCollection: (state) => {
            state.items = {};
            saveCollection(state);
            console.log('All collection state has been reset.');
        },
        changeStyle: (state, action: PayloadAction<StyleChangeArgs>) => {
            state.smallScreen = action.payload.smallScreen;
            saveCollection(state);
        },
        saveCurrentState: (state) => {
            saveCollection(state);
        },
        changeStatus: (state, action: PayloadAction<ChangeStatusArgs>) => {
            const args = action.payload;
            // TODO: optimize status by omitting `false` entries.
            if (!state.items[args.id]) {
                state.items[args.id] = { id: args.id, status: args.status };
            } else {
                state.items[args.id] = { ...state.items[args.id], status: args.status };
            }
            if (!args.skipStorageUpdate) {
                saveCollection(state);
            }
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
        // TODO: optimize status by omitting `false` entries.
        setHaveRecipe: (state, action: PayloadAction<BoolActionArgs>) => {
            const args = action.payload;
            const currentState = state.items[args.id] || defaultCollectionState(args.id);
            state.items[args.id] = {
                ...currentState,
                status: { ...currentState.status, haveRecipe: args.newValue },
            };
            saveCollection(state);
        },
        setLicensed: (state, action: PayloadAction<BoolActionArgs>) => {
            const args = action.payload;
            const currentState = state.items[args.id] || defaultCollectionState(args.id);
            state.items[args.id] = {
                ...currentState,
                status: { ...currentState.status, licensed: args.newValue },
            };
            saveCollection(state);
        },
        setCollected: (state, action: PayloadAction<BoolActionArgs>) => {
            const args = action.payload;
            const currentState = state.items[args.id] || defaultCollectionState(args.id);
            state.items[args.id] = {
                ...currentState,
                status: { ...currentState.status, collected: args.newValue },
            };
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

export const {
    load,
    resetCollection,
    changeStyle,
    saveCurrentState,
    changeStatus,
    setLicenseAmount,
    setHaveRecipe,
    setLicensed,
    setCollected,
} = collectionSlice.actions;
