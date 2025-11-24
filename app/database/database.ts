import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import type { CollectedItem } from '../collection';
import rawCatalogData from '../data/sample-catalogs.json';
import rawItemData from '../data/sample-data.json';
import rawSourceImageData from '../data/sample-source-images.json';
import type { RootState } from '../store';
import type { Source, SourceType } from './sources';

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

export type CatalogType = 'catalog' | 'catalogSpec' | 'floodEx' | 'sunFes' | 'phantom' | 'evercold';

export interface CatalogDef {
    readonly key: CatalogType;
    // display name
    readonly name: string;
    // TODO: make icons/images their own type, with local & wiki & elsewhere options?
    readonly icon: string;
    // IDs only. TODO: name+id for manual management?
    // TODO: allow "empty" slots to better simulate autolog positioning
    readonly items: string[];
}

// source images file

export interface SourceImageList {
    readonly images: SourceImage[];
}

export interface SourceImage {
    readonly type: SourceType;
    readonly subtype?: string;
    readonly name?: string;
    readonly src?: string;
}

/// parsed data

export interface ItemDB extends Record<string, Item> {}

export interface SourceDetails {
    // arbitrary fragment/kind data
    readonly source: Source;
    readonly drops: DropDetail[];
    readonly imageSrc?: string;
}

export interface DropDetail {
    readonly itemId: string;
    readonly fragment: boolean;
    readonly kind: 'item' | 'recipe';
}

export interface Database {
    // Keyed by id
    readonly items: ItemDB;
    // Keyed by name
    readonly alt_recipes: Record<string, AltRecipe>;
    readonly catalogs: Record<CatalogType, CatalogDef>;
    // Keyed by synthetic source ID (type+name)
    readonly sources: Record<string, SourceDetails>;
}

// Whether a single 'collected' state should be tracked instead of recipe+license
export function isCollectable(item: Item) {
    switch (item.category) {
        case 'Decor':
        case 'Quest':
            return true;
        case 'Consumables':
        case 'Gear':
        case 'Material':
            return !item.license_amount;
        case 'Plant':
            // TODO: figure out how to represent now-this-can-be-bought-from-Lily
            return false;
    }
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
    // TODO: can this be server-side-only somehow? (probably not the end of the world if not)
    console.log('yield new db');
    // TODO: allow data to be split up for easier (manual) management
    const db = createDB(rawItemData as ItemData, rawCatalogData as CatalogList, rawSourceImageData as SourceImageList);
    return db;
    // below needs to get the scheme+authority from somewhere to work, or run from clientLoader().
    // may not be needed, depending on how it'll be hosted/served?
    // const rawItemData = await fetch("/sample-data.json").then(r => r.json()) as ItemData;
}

export function useDatabase(): Database {
    return useSelector((state: RootState) => state.db);
}

function createDB(itemData: ItemData, catalogData: CatalogList, sourceImages: SourceImageList): Database {
    let items: ItemDB = {};
    let alt_recipes: Record<string, AltRecipe> = {};
    let sources: Record<string, SourceDetails> = {};
    let sourceImageMap: Record<string, string> = {};

    sourceImages.images.forEach((i) => {
        if (i.src) {
            sourceImageMap[sourceId(i)] = i.src;
        }
    });

    itemData.items.forEach((i) => {
        if (items[i.id]) {
            throw 'Duplicate item id: ' + i.id;
        }
        items[i.id] = i;

        if (i.source) {
            i.source.forEach((s) => {
                const sId = sourceId(s);
                if (sources[sId]) {
                    let drops = sources[sId].drops;
                    drops.push(toDrop(i, s));
                    sources[sId] = { ...sources[sId], drops: drops };
                } else {
                    sources[sId] = {
                        source: s,
                        drops: [toDrop(i, s)],
                        imageSrc: sourceImageMap[sId],
                    };
                }
            });
        }
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

    return { items, alt_recipes, catalogs, sources };
}

export function sourceId(s: Source | SourceImage): string {
    return s.type + '_' + (s.subtype || '') + '_' + (s.name || '');
}

function toDrop(item: Item, source: Source): DropDetail {
    return { itemId: item.id.toString(), fragment: source.fragment, kind: source.kind };
}

export function dropIsCollected(drop: DropDetail, item: CollectedItem) {
    switch (drop.kind) {
        case 'item':
            // Item drops are only 'done' when the item is licensed or present in the autolog.
            // TODO: consider checking license progress instead of the licensed mark
            return item.status.licensed || item.status.collected;
        case 'recipe':
            // Recipe drops are only 'done' once the recipe is available.
            // I don't want to track collected fragment counts; having all fragments is considered equivalent to having the combined recipe.
            return item.status.haveRecipe;
    }
}
