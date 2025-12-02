import { loadFile, saveFile } from '../common/files';
import {
    setDbItems,
    useDatabase,
    type AltRecipe,
    type CatalogDef,
    type CatalogList,
    type Database,
    type Ingredient,
    type Item,
    type ItemData,
    type ItemDB,
    type Recipe,
} from '../database/database';
import type { Source } from '../database/sources';
import type { Route } from '../datamgmt/+types/view';
import { useAppDispatch } from '../store';
import { importLicenseCalcSheet, importLicenseWikiSheet } from './parserFromLicenseCalc';

const KNOWN_DUPLICATE_ITEM_NAMES = new Set([
    'Sunscreen',
    'Cursedconut Flan',
    'Jam Waffles',
    'Anniversary Cake',
    'Whole Birthday Cake',
    'Beach Shorts',
]);

const CSV_FILES: FilePickerAcceptType[] = [{ description: 'CSV', accept: { 'text/plain': ['.csv'] } }];

export default function DatabaseManagementView({ params, matches }: Route.ComponentProps) {
    const db = useDatabase();
    const appDispatch = useAppDispatch();
    // this yields an error (in dev?) when loading the /settings directly because SSR!=CSR. that's fine if it's only in dev.
    let fsAvailable = typeof window !== 'undefined' && window.showSaveFilePicker !== undefined;
    if (!fsAvailable) {
        return (
            <div className="db-data-management center-content">
                For my convenience, this is only supported in Chromium browsers.
            </div>
        );
    }
    const saveItemData = () => saveFile(JSON.stringify(extractItemData(db)));
    const saveCatalogs = () => saveFile(JSON.stringify(extractCatalogList(db)));
    const loadFromLicenseCalc = () => {
        loadFile((f) => {
            const items = importLicenseCalcSheet(f);
            appDispatch(setDbItems(integrateItemsWithoutIds(db, items)));
        }, CSV_FILES);
    };
    const loadSourcesFromLicenseCalc = () => {
        loadFile((f) => {
            const sources = importLicenseWikiSheet(f);
            appDispatch(setDbItems(integrateSources(db, sources)));
        }, CSV_FILES);
    };
    return (
        <div className="db-data-management center-content">
            <div className="db-mgmt-heading">
                These options act on the database, to help build & maintain it. No changes applied this way are saved
                when this tab is closed. Use the relevant Export option to get the files needed. Some options may get
                removed later once they have served their purpose (as they handle spreadsheet formats that the community
                no longer uses)
            </div>
            <div className="db-mgmt-options">
                <div className="settings-item" onClick={saveItemData}>
                    Export item data (one file)
                </div>
                <div className="settings-item" onClick={saveCatalogs}>
                    Export catalogs
                </div>
                <div className="settings-item" onClick={loadFromLicenseCalc}>
                    Import data from License Calculator (recipes) (will overwrite)
                </div>
                <div className="settings-item" onClick={loadSourcesFromLicenseCalc}>
                    Import data from License Calculator (sources) (will overwrite, must have imported recipes first)
                </div>
            </div>
        </div>
    );
}

function extractItemData(db: Database): ItemData {
    let items: Item[] = [];
    let alt_recipes: AltRecipe[] = [];
    for (const item of Object.values(db.items)) {
        items.push(item);
    }
    for (const ar of Object.values(db.alt_recipes)) {
        alt_recipes.push(ar);
    }
    return { items, alt_recipes };
}

function extractCatalogList(db: Database): CatalogList {
    let defs: CatalogDef[] = [];
    for (const def of Object.values(db.catalogs)) {
        defs.push({ ...def, itemSet: undefined });
    }
    return { catalogs: defs };
}

function buildExistingItemNameToId(db: Database): [Record<string, number>, number] {
    let itemNameToId: Record<string, number> = {};
    let maxId = -1;
    for (const idStr of Object.keys(db.items)) {
        const id = parseInt(idStr);
        const name = db.items[id].name;
        if (KNOWN_DUPLICATE_ITEM_NAMES.has(name)) {
            // TODO: handle these somehow? Requiring these to be manual is probably fine for now.
            console.log('Ignoring existing items with duplicate names for now: ' + name);
            continue;
        }
        if (itemNameToId[name]) {
            throw 'Duplicate existing item name "' + name + '" with no entry in KNOWN_DUPLICATE_ITEM_NAMES.';
        }
        itemNameToId[name] = id;
        maxId = Math.max(id, maxId);
    }
    return [itemNameToId, maxId];
}

function integrateItemsWithoutIds(db: Database, newItems: Item[]): ItemDB {
    let [itemNameToId, maxId] = buildExistingItemNameToId(db);

    let combinedItemDb: ItemDB = {};
    for (const id of Object.keys(db.items)) {
        combinedItemDb[id] = db.items[id];
    }
    // Generate IDs first, so they can be used for ingredients
    // Assume there are no duplicate item names in the data, and all new data is "better"
    for (const item of newItems) {
        if (KNOWN_DUPLICATE_ITEM_NAMES.has(item.name)) {
            console.log('Ignoring imported items with duplicate names for now: ' + item.name);
            continue;
        }
        if (!itemNameToId[item.name]) {
            itemNameToId[item.name] = ++maxId;
        }
        for (const ingredient of item.recipe?.ingredient || []) {
            if (!itemNameToId[ingredient.name]) {
                itemNameToId[ingredient.name] = ++maxId;
            }
        }
    }
    for (const item of newItems) {
        if (KNOWN_DUPLICATE_ITEM_NAMES.has(item.name)) {
            continue;
        }
        let recipe: Recipe | undefined;
        if (item.recipe) {
            let ingredients: Ingredient[] = [];
            for (const ingredientWithoutId of item.recipe.ingredient) {
                if (!itemNameToId[ingredientWithoutId.name]) {
                    throw 'New item ' + item.name + ' has unknown ingredient ' + ingredientWithoutId.name;
                }
                ingredients.push({ ...ingredientWithoutId, id: itemNameToId[ingredientWithoutId.name] });
            }
            recipe = { ...item.recipe, ingredient: ingredients };
        }
        let updatedItem: Item = {
            ...item,
            id: itemNameToId[item.name],
            recipe: recipe,
        };
        if (combinedItemDb[updatedItem.id]) {
            updatedItem = { ...combinedItemDb[updatedItem.id], ...updatedItem };
        }
        combinedItemDb[updatedItem.id] = updatedItem;
    }
    // Materials that are not licensable may not have been part of the item list
    for (const name of Object.keys(itemNameToId)) {
        const id = itemNameToId[name];
        if (combinedItemDb[id]) {
            continue;
        } else {
            combinedItemDb[id] = {
                name,
                id,
                // I think anything that falls under this category is in the material catgeory?
                category: 'Material',
            };
        }
    }
    return combinedItemDb;
}

function integrateSources(db: Database, sources: Record<string, Source[]>): ItemDB {
    let [itemNameToId] = buildExistingItemNameToId(db);

    let updatedItemDb: ItemDB = {};
    for (const id of Object.keys(db.items)) {
        updatedItemDb[id] = db.items[id];
    }

    for (const name of Object.keys(sources)) {
        if (KNOWN_DUPLICATE_ITEM_NAMES.has(name)) {
            console.log('Skipping ' + name + " since there's >1 item with that name.");
            continue;
        }
        // Assume there is no (valid) existing source data, and this is just for initial seeding.
        // Assume the recipes have been imported already, and no new items need to be added.
        const id = itemNameToId[name];
        if (!id) {
            throw 'Item ' + name + ' was expected to be present in the database already.';
        }

        updatedItemDb[id] = { ...updatedItemDb[id], source: sources[name] };
    }
    return updatedItemDb;
}
