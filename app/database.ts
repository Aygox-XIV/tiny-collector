import { createSlice } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import rawItemData from './data/sample-data.json';
import type { RootState } from './store';

/// raw data

export interface IdentifiableEntity {
    readonly name: string;
    // calculated if absent. hash of name by default, XOR with props (recipe, etc) when there's a conflict.
    readonly id?: number;
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
        reload: (state, action) => {
            console.log('reload');
            state = action.payload;
        },
    },
});

function initDb() {
    console.log('yield new db');
    const db = createDB(rawItemData as ItemData);
    return db;
    // below needs to get the scheme+authority from somewhere to work, or run from clientLoader().
    // const rawItemData = await fetch("/sample-data.json").then(r => r.json()) as ItemData;
}

export function useDatabase(): Database {
    return useSelector((state: RootState) => state.db);
}

function createDB(itemData: ItemData): Database {
    let items: ItemDB = {};
    let alt_recipes: AltRecipe[] = [];

    itemData.items.forEach((i) => {
        const [conflict, id] = getId(items, i);
        items[id] = { ...i, id };
    });

    itemData.alt_recipes.forEach((r) => {
        const [conflict, id] = getId(items, r);
        alt_recipes.push({ ...r, id });
    });
    console.log('created db: ' + Object.keys(items).length + ' items');

    return { items, alt_recipes };
}

function getId(items: ItemDB, item: IdentifiableEntity): [conflict: boolean, id: number] {
    if (!!item.id) {
        return [false, item.id];
    }
    // how to get the crypto module to work to make a hash???
    // could make the conversion script do it instead I guess.
    return [false, -1];
}
