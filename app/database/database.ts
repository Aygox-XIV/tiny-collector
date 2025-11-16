import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import rawCatalogData from '../data/sample-catalogs.json';
import rawItemData from '../data/sample-data.json';
import type { RootState } from '../store';
import type { Source } from './sources';

/// raw data

export type Category = 'Gear' | 'Consumables' | 'Material' | 'Decor' | 'Quest' | 'Plant';

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
    readonly category: Category;
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

// catalogs file

export interface CatalogList {
    readonly catalogs: CatalogDef[];
}

export interface CatalogDef {
    readonly key: string;
    // display name
    readonly name: string;
    // TODO: make icons their own type, with local & wiki & elsewhere options?
    readonly icon: string;
    // IDs only. TODO: name+id for manual management?
    readonly items: string[];
}

/// parsed data

export interface ItemDB extends Record<string, Item> {}

export interface Database {
    // Keyed by id
    readonly items: ItemDB;
    // Keyed by name
    readonly alt_recipes: Record<string, AltRecipe>;
    // keyed by catalog-specific key string
    readonly catalogs: Record<string, CatalogDef>;
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
    // TODO: allow data to be split up for easier (manual) management
    const db = createDB(rawItemData as ItemData, rawCatalogData as CatalogList);
    return db;
    // below needs to get the scheme+authority from somewhere to work, or run from clientLoader().
    // may not be needed, depending on how it'll be hosted/served?
    // const rawItemData = await fetch("/sample-data.json").then(r => r.json()) as ItemData;
}

export function useDatabase(): Database {
    return useSelector((state: RootState) => state.db);
}

function createDB(itemData: ItemData, catalogData: CatalogList): Database {
    let items: ItemDB = {};
    let alt_recipes: Record<string, AltRecipe> = {};

    itemData.items.forEach((i) => {
        if (items[i.id]) {
            throw 'Duplicate item id: ' + i.id;
        }
        items[i.id] = i;
    });

    itemData.alt_recipes.forEach((r) => {
        if (alt_recipes[r.name]) {
            throw 'Duplicate Alt Recipe name ' + r.name;
        }
        alt_recipes[r.name] = r;
    });

    let catalogs: Record<string, CatalogDef> = {};
    catalogData.catalogs.forEach((c) => {
        if (catalogs[c.key]) {
            throw 'Duplicate catalog key ' + c.key;
        }
        catalogs[c.key] = c;
    });

    console.log('created db: ' + Object.keys(items).length + ' items');

    return { items, alt_recipes, catalogs };
}
