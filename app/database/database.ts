import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import { useSelector } from 'react-redux';
import type { CollectedItem } from '../collection';
import itemFileEvercold from '../data/items/evercold-items.json';
import itemFileFlooded from '../data/items/flooded-expedition-items.json';
import itemFileMain1 from '../data/items/main-items-1.json';
import itemFileMain2 from '../data/items/main-items-2.json';
import itemFilePhantom from '../data/items/phantom-items.json';
import itemFileQuest from '../data/items/quest-items.json';
import itemFileSun from '../data/items/sun-festival-items.json';
import catalogFileEvercold from '../data/metadata/evercold-catalog.json';
import catalogFileFlooded from '../data/metadata/flooded-expedition-catalog.json';
import catalogFileMain from '../data/metadata/main-catalog.json';
import sourceMetaFileMain from '../data/metadata/main-source-metadata.json';
import catalogFilePhantom from '../data/metadata/phantom-catalog.json';
import catalogFileQuest from '../data/metadata/quest-catalog.json';
import catalogFileSun from '../data/metadata/sun-festival-catalog.json';
import sourceMetaFileWeekly from '../data/metadata/weekly-event-source-metadata.json';
import sourceMetaFileYearly from '../data/metadata/yearly-event-source-metadata.json';
import sampleCatalogs from '../data/samples/sample-catalogs.json';
import sampleItems from '../data/samples/sample-data.json';
import sampleMetadata from '../data/samples/sample-source-images.json';
import type { RootState } from '../store';
import type { Source, SourceType } from './sources';

/// raw data

export interface FileCollection {
    readonly itemFiles: ItemData[];
    readonly catalogFiles: CatalogList[];
    readonly sourceMetadata: SourceImageList[];
}

const SAMPLE_FILES: FileCollection = {
    itemFiles: [sampleItems as ItemData],
    catalogFiles: [sampleCatalogs as CatalogList],
    sourceMetadata: [sampleMetadata as SourceImageList],
};

// It would have been nice if this could be a config somewhere,
// but static imports yield the fewest DB reloads, and this shouldn't change much.
// (maybe a new items file once in a while if a new patch is large, or a new event is added)
const REAL_FILES: FileCollection = {
    itemFiles: [
        itemFileEvercold as ItemData,
        itemFileFlooded as ItemData,
        itemFileMain1 as ItemData,
        itemFileMain2 as ItemData,
        itemFilePhantom as ItemData,
        itemFileQuest as ItemData,
        itemFileSun as ItemData,
    ],
    catalogFiles: [
        catalogFileMain as CatalogList,
        catalogFileQuest as CatalogList,
        catalogFileSun as CatalogList,
        catalogFileFlooded as CatalogList,
        catalogFilePhantom as CatalogList,
        catalogFileEvercold as CatalogList,
    ],
    sourceMetadata: [
        sourceMetaFileMain as SourceImageList,
        sourceMetaFileWeekly as SourceImageList,
        sourceMetaFileYearly as SourceImageList,
    ],
};

export type Category = 'Gear' | 'Consumables' | 'Material' | 'Decor' | 'Quest' | 'Plant';

export interface IdentifiableEntity {
    readonly name: string;
    // maintained/enforced by conversion scripts
    // Real data starts at 100
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
    SunCatalog = 'sunFes',
    FloodedCatalog = 'floodEx',
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
    // [ID, optional name]
    readonly items: [string, string?][];
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
    readonly catalogs: Record<CatalogType, CatalogDef>;
    // Keyed by synthetic source ID (type+name)
    readonly sources: Record<string, SourceDetails>;
    // To support exporting only new items
    readonly maxIdOnFirstLoad: number;
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
        setDbItemsAndCatalogs: (state, action: PayloadAction<[ItemDB, Record<string, CatalogDef>]>) => {
            console.log('setting item DB with ' + Object.keys(action.payload[0]).length + ' items');
            state.items = action.payload[0];
            const newSources = rebuildSourcesFromItemData(state);
            console.log('updating sources to have ' + Object.keys(newSources).length + ' entries.');
            state.sources = newSources;
            for (const catType of Object.keys(action.payload[1])) {
                console.log('overwriting catalog ' + catType);
                state.catalogs[catType as CatalogType] = action.payload[1][catType as CatalogType];
            }
        },
    },
});

export const { setDbItems, setDbItemsAndCatalogs } = dbSlice.actions;

function initDb() {
    // TODO: can this be server-side-only somehow? (probably not the end of the world if not)
    console.log('yield new db');
    const db = createDB(REAL_FILES);
    return db;
}

export function useDatabase(): Database {
    return useSelector((state: RootState) => state.db);
}

function createDB(files: FileCollection): Database {
    let items: ItemDB = {};
    let sources: Record<string, SourceDetails> = {};
    let sourceImageMap: Record<string, ImageRef> = {};
    let maxId = -1;
    let itemNameToIdMap: Record<string, number> = {};

    files.sourceMetadata.forEach((sourceImages) => {
        sourceImages.images.forEach((i) => {
            if (i.src) {
                sourceImageMap[sourceId(i)] = i.src;
            }
        });
    });

    files.itemFiles.forEach((itemData) => {
        itemData.items.forEach((i) => {
            // TODO: support placeholder (negative?) ID so manual additions don't need to find the next available ID?
            // Or just use item count + 100 as next ID, which should also work
            if (items[i.id]) {
                console.error('Duplicate item id: ' + i.id);
            }
            items[i.id] = i;
            maxId = Math.max(maxId, i.id);

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
            // overwrites duplicates. that's fine; it's only for fixing the catalog.
            itemNameToIdMap[i.name] = i.id;
        });
    });

    let catalogs: Record<string, CatalogDef> = {};
    files.catalogFiles.forEach((catalogData) => {
        catalogData.catalogs.forEach((c) => {
            if (catalogs[c.key]) {
                console.error('Duplicate catalog key ' + c.key);
                return;
            }
            let itemSet: Record<string, boolean> = {};
            let fixedItems: [string, string?][] = [];
            for (let i = 0; i < c.items.length; i++) {
                let [id, name] = c.items[i];
                if (name && id.length > 0) {
                    const dbItem = items[id];
                    if (!dbItem || dbItem.name !== name) {
                        console.error(
                            'Catalog ' +
                                c.name +
                                ' has name ' +
                                name +
                                ' for item with id ' +
                                id +
                                ' but it is ' +
                                dbItem?.name,
                        );
                        continue;
                    }
                } else if (name && id.length == 0) {
                    // name without id; fix the id.
                    if (!itemNameToIdMap[name]) {
                        console.error(
                            'Catalog ' + c.name + ' has item ' + name + ' without id, but it does not exist.',
                        );
                        continue;
                    }
                    id = itemNameToIdMap[name].toString();
                }
                fixedItems.push([id, name]);
                itemSet[id] = true;
            }
            catalogs[c.key] = { ...c, itemSet, items: fixedItems };
        });
    });

    console.log('created db: ' + Object.keys(items).length + ' items');

    return { items, catalogs, sources, maxIdOnFirstLoad: maxId };
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
        // TODO: add /revision/latest/scale-to-width-down/<width> suffix?
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
