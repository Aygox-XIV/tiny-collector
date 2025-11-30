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
import type { Route } from '../datamgmt/+types/view';
import { useAppDispatch } from '../store';
import { importLicenseCalcSheet } from './parserFromLicenseCalc';

const KNOWN_DUPLICATE_ITEM_NAMES = new Set([
    'Sunscreen',
    'Cursedconut Flan',
    'Jam Waffles',
    'Anniversary Cake',
    'Whole Birthday Cake',
    'Beach Shorts',
]);

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
        loadFile(
            (f) => {
                const items = importLicenseCalcSheet(f);
                appDispatch(setDbItems(integrateItemsWithoutIds(db, items)));
            },
            [{ description: 'CSV', accept: { 'text/plain': ['.csv'] } }],
        );
    };
    const loadSourcesFromLicenseCalc = () => {
        // TODO
        console.log('not yet implemented');
    };
    return (
        <div className="db-data-management center-content">
            <div className="db-mgmt-heading">
                These options act on the database, to help maintain it. No changes applied this way are saved when this
                tab is closed. Use the relevant Export option to get the files needed.
            </div>
            <div className="db-mgmt-options">
                <div className="settings-item" onClick={saveItemData}>
                    Export item data (one file)
                </div>
                <div className="settings-item" onClick={saveCatalogs}>
                    Export catalogs
                </div>
                <div className="settings-item" onClick={loadFromLicenseCalc}>
                    Import data from License Calculator (recipes)
                </div>
                <div className="settings-item" onClick={loadSourcesFromLicenseCalc}>
                    Import data from License Calculator (sources)
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

function integrateItemsWithoutIds(db: Database, newItems: Item[]): ItemDB {
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
                // I think anything that falls under this categiry is in the material catgeory?
                category: 'Material',
            };
        }
    }
    return combinedItemDb;
}
