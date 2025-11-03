import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import rawItemData from '../data/sample-data.json';
import type { RootState } from '../store';
import type { Source } from './sources';

/// raw data

export interface IdentifiableEntity {
    readonly name: string;
    // maintained/enforced by conversion script
    readonly id: number;
    // Path relative to https://static.wikia.nocookie.net/tiny-shop/images/ that has this item's image
    readonly wiki_image_path?: string;
    readonly source?: Source[];
}

export interface ItemData {
    readonly items: Item[];
    readonly alt_recipes: AltRecipe[];
}

export interface Item extends IdentifiableEntity {
    readonly recipe?: Recipe;
    readonly alt_recipe?: string;
    readonly license_amount?: number;
}

export interface Recipe {
    readonly ingredient: Ingredient[];
    // amount per craft
    readonly craft_amount: number;
}

export interface AltRecipe extends Recipe, IdentifiableEntity {}

export interface Ingredient extends IdentifiableEntity {
    readonly quantity: number;
}

/// parsed data

export interface ItemDB extends Record<string, Item> {}

export interface Database {
    readonly items: ItemDB;
    readonly alt_recipes: AltRecipe[];
}

export const dbSlice = createSlice({
    name: 'database',
    initialState: initDb(),
    reducers: {
        reload: (state, action: PayloadAction<Database>) => {
            console.log('reload');
            state = action.payload;
        },
    },
});

function initDb() {
    console.log('yield new db');
    // TODO: allow data to be split up for easier manual management
    const db = createDB(rawItemData as ItemData);
    return db;
    // below needs to get the scheme+authority from somewhere to work, or run from clientLoader().
    // may not be needed, depending on how it'll be hosted/served?
    // const rawItemData = await fetch("/sample-data.json").then(r => r.json()) as ItemData;
}

export function useDatabase(): Database {
    return useSelector((state: RootState) => state.db);
}

function createDB(itemData: ItemData): Database {
    let items: ItemDB = {};
    let alt_recipes: AltRecipe[] = [];

    itemData.items.forEach((i) => {
        items[i.id] = i;
    });

    itemData.alt_recipes.forEach((r) => {
        alt_recipes.push(r);
    });
    console.log('created db: ' + Object.keys(items).length + ' items');

    return { items, alt_recipes };
}
