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
    readonly image?: ImageRef;
    readonly source?: Source[];
}

export interface ImageRef {
    // Path relative to https://static.wikia.nocookie.net/tiny-shop/images/ that has this item's image
    readonly fandom_wiki_image_path?: string;
    // Path relative to whatever _domain_ this application is hosted on.
    readonly local_path?: string;
    // Full url of the image. (only https: and data: URLs are allowed)
    readonly full_url?: string;
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

export enum CatalogType {
    FullCatalog = 'catalog',
    QuestCatalog = 'catalogSpec',
    FloodedCatalog = 'floodEx',
    SunCatalog = 'sunFes',
    PhantomCatalog = 'phantom',
    EvercoldCatalog = 'evercold',
}

export interface CatalogDef {
    readonly key: CatalogType;
    // display name
    readonly name: string;
    readonly icon: ImageRef;
    // Which item categories are present
    readonly categories?: Category[];
    // IDs only. TODO: name+id for manual management?
    // TODO: allow "empty" slots to better simulate autolog positioning
    readonly items: string[];
    // Populated after loading. ID -> true to simulate a serializable Set.
    readonly itemSet?: Record<string, boolean>;
}

// source images file

export interface SourceImageList {
    readonly images: SourceImage[];
}

export interface SourceImage {
    readonly type: SourceType;
    readonly subtype?: string;
    readonly name?: string;
    readonly src?: ImageRef;
}

/// parsed data

export interface ItemDB extends Record<string, Item> {}

export interface SourceDetails {
    // arbitrary fragment/kind data
    readonly source: Source;
    readonly drops: DropDetail[];
    readonly imageSrc?: ImageRef;
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
            // TODO: figure out how to represent now-this-can-be-bought-from-Lily?
            return false;
    }
}

export const dbSlice = createSlice({
    name: 'database',
    initialState: initDb(),
    reducers: {
        setDbItems: (state, action: PayloadAction<ItemDB>) => {
            console.log('setting item DB with ' + Object.keys(action.payload).length + ' items');
            state.items = action.payload;
            const newSources = rebuildSourcesFromItemData(state);
            console.log('updating sources to have ' + Object.keys(newSources).length + ' entries.');
            state.sources = newSources;
        },
    },
});

export const { setDbItems } = dbSlice.actions;

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
    let sourceImageMap: Record<string, ImageRef> = {};

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
        let itemSet: Record<string, boolean> = {};
        c.items.forEach((id) => {
            itemSet[id] = true;
        });
        catalogs[c.key] = { ...c, itemSet };
    });

    console.log('created db: ' + Object.keys(items).length + ' items');

    return { items, alt_recipes, catalogs, sources };
}

/** Hack to let dm-mgmt imports show updates to the checklist. Will not try to fix source images. */
export function rebuildSourcesFromItemData(db: Database): Record<string, SourceDetails> {
    let sources: Record<string, SourceDetails> = {};
    Object.values(db.items).forEach((item) => {
        if (item.source) {
            item.source.forEach((s) => {
                const sId = sourceId(s);
                if (sources[sId]) {
                    let drops = sources[sId].drops;
                    drops.push(toDrop(item, s));
                    sources[sId] = { ...sources[sId], drops: drops };
                } else {
                    let imageSrc = db.sources[sId]?.imageSrc;
                    sources[sId] = {
                        source: s,
                        drops: [toDrop(item, s)],
                        imageSrc,
                    };
                }
            });
        }
    });

    return sources;
}

export function sourceId(s: Source | SourceImage): string {
    // These go into URLs, so don't add URL delimiters
    return (
        s.type +
        '_' +
        (s.subtype || '') +
        '_' +
        (s.name || '').replaceAll('/', '-').replaceAll('#', '-').replaceAll('?', '-')
    );
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

export function getImgSrc(ref: ImageRef) {
    if (ref.fandom_wiki_image_path) {
        return 'https://static.wikia.nocookie.net/tiny-shop/images/' + ref.fandom_wiki_image_path;
    }
    if (ref.full_url) {
        if (!ref.full_url.startsWith('data:') && !ref.full_url.startsWith('https://')) {
            throw 'invalid ImageRef.full_url: ' + ref.full_url.toString();
        }
        return ref.full_url;
    }
    if (ref.local_path) {
        if (!ref.local_path.startsWith('/')) {
            return '/' + ref.local_path;
        } else {
            return ref.local_path;
        }
    }
    throw 'unhandled ImageRef option: ' + JSON.stringify(ref);
}
