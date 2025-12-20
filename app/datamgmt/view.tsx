import { BASE_FILE_TYPES, loadFile, saveFile } from '../common/files';
import {
    CatalogType,
    REAL_FILES,
    setDbItems,
    setDbItemsAndCatalogs,
    useDatabase,
    type CatalogDef,
    type CatalogList,
    type Database,
    type Ingredient,
    type Item,
    type ItemData,
    type ItemDB,
    type Recipe,
} from '../database/database';
import { validateSingleSource, type Source } from '../database/sources';
import type { Route } from '../datamgmt/+types/view';
import { useAppDispatch } from '../store';
import { importRecipesFromDataSheet, importSourcesFromDataSheet } from './parserForDataSheet';
import { importItemIconUrls } from './parserForFandomWiki';
import { importCatalogList } from './parserForJourneyList';
import { importLicenseCalcSheet, importLicenseWikiSheet } from './parserFromLicenseCalc';

const KNOWN_DUPLICATE_ITEM_NAMES = new Set([
    'Sunscreen', // sun festival lotion / premium pack sunflower shield
    'Cursedconut Flan', // different years different flans (round vs square)
    'Jam Waffles', // yellow & red
    'Anniversary Cake', // 2024 (carrot/strawberry) and 2025 (chocolate)
    'Whole Birthday Cake', // 2024 (carrot/strawberry) and 2025 (chocolate)
    'Beach Shorts', // yellow & blue
    "Where's My Kitty?", // 5 versions
    "Jelly's Special", // 1 quest, 1 consumable
    'Timefound Loaf', // 1 round, 1 rectangle
    'Kelp', // 1 material, 1 decor
    // Seeds with the same name as what they produce
    'Blue Tower',
    'Puff Flower',
    'Summer Glory',
    'Sunsugar Cane',
    'Wheat',
    'Rice',
    'Potatoes',
    'Ashen Wheat',
    'Pumpkin',
    'Sunseekers',
]);
// most duplicate items aren't ingredients in non-duplicate items yet, except plants
const PLANT_INGREDEIENT_IDS: Record<string, number> = {
    'Blue Tower': 120,
    'Puff Flower': 257,
    'Summer Glory': 200,
    'Sunsugar Cane': 671,
    Wheat: 674,
    Rice: 118,
    Potatoes: 113,
    'Ashen Wheat': 870,
    Pumpkin: 238,
    Sunseekers: 335,
    // not a seed, still a plant...
    Kelp: 920,
};

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
    const saveNewItemData = () => saveFile(JSON.stringify(extractNewItemData(db)));
    const saveItemDataSubset = (original: ItemData, fileName: string) =>
        saveFile(JSON.stringify(extractItemDataSubset(db, original)), BASE_FILE_TYPES, fileName);
    const saveCatalog = (c: CatalogType) =>
        saveFile(JSON.stringify(extractCatalog(db, c)), BASE_FILE_TYPES, getCatalogFileName(c));
    const loadFromLicenseCalc = () => {
        loadFile((f) => {
            const items = importLicenseCalcSheet(f);
            appDispatch(setDbItems(integrateItemsWithoutIds(db, items)));
        }, CSV_FILES);
    };
    const loadSourcesFromLicenseCalc = () => {
        loadFile((f) => {
            const sources = importLicenseWikiSheet(f);
            appDispatch(setDbItems(integrateSources(db, sources, false)));
        }, CSV_FILES);
    };
    const loadItemsFromJourneysAndCatalog = () => {
        loadFile((f) => {
            const [items, catalog] = importCatalogList(f);
            const itemDb = integrateItemsWithoutIds(db, items);
            console.log('new itemdb has ' + Object.keys(itemDb).length + ' items');
            const catalogs = fixCatalogIds(itemDb, [catalog]);
            appDispatch(setDbItemsAndCatalogs([itemDb, catalogs]));
        }, CSV_FILES);
    };
    const loadImageUrlsFromWikiTable = () => {
        loadFile((f) => {
            const images = importItemIconUrls(f);
            const itemDb = integrateItemIcons(db, images);
            appDispatch(setDbItems(itemDb));
        });
    };
    const loadSourcesFromDataSheet = () => {
        loadFile((f) => {
            const sources = importSourcesFromDataSheet(f);
            appDispatch(setDbItems(integrateSources(db, sources, true)));
        }, CSV_FILES);
    };
    const loadRecipesFromDataSheet = () => {
        loadFile((f) => {
            const items = importRecipesFromDataSheet(f);
            appDispatch(setDbItems(integrateItemsWithoutIds(db, items)));
        }, CSV_FILES);
    };
    // TODO: item to export source metadata with empty image defs for missing entries so just the image links can be added without having to add the boilerplate manually
    // requires things to not break on empty image defs
    // TODO: export single catalogs
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
                    Export all item data (in one file)
                </div>
                <div className="settings-item" onClick={saveNewItemData}>
                    Export new items (in one file)
                </div>
                <div className="settings-group">
                    Subset item exports
                    {REAL_FILES.itemFiles.map(([itemData, fileName]) => {
                        return (
                            <div
                                className="settings-item"
                                onClick={() => saveItemDataSubset(itemData, fileName)}
                                key={fileName}
                            >
                                Export {fileName}
                            </div>
                        );
                    })}
                </div>
                <div className="settings-group">
                    Catalog exports
                    {Object.values(CatalogType).map((c) => {
                        return (
                            <div className="settings-item" key={c} onClick={() => saveCatalog(c)}>
                                Export the {db.catalogs[c].name} catalog
                            </div>
                        );
                    })}
                </div>
                <div className="settings-item" onClick={loadFromLicenseCalc}>
                    Import data from License Calculator (recipes) (will overwrite) [to be deleted]
                </div>
                <div className="settings-item" onClick={loadSourcesFromLicenseCalc}>
                    Import data from License Calculator (sources) (will overwrite, must have imported recipes first) [to
                    be deleted]
                </div>
                <div className="settings-item" onClick={loadItemsFromJourneysAndCatalog}>
                    Import Item/catalog data from "Journey and catalog" (catalog tab)
                </div>
                <div className="settings-item" onClick={loadSourcesFromDataSheet}>
                    Import sources from "Tiny shop data" (Sources tab)
                </div>
                <div className="settings-item" onClick={loadRecipesFromDataSheet}>
                    Import recipes from "Tiny shop data" (All Items tab)
                </div>
                <div className="settings-item" onClick={loadImageUrlsFromWikiTable}>
                    Import item icons from wiki table
                </div>
                <div className="settings-item" onClick={() => validateDbIntegrity(db)}>
                    Check database integrity (logs any warnings to the console)
                </div>
            </div>
        </div>
    );
}

/**
 * Checks whether there's any inconsistencies in the data:
 * - items with a recipe and sources, but no recipe source
 * - sources for recipe (fragments) for items that don't have a recipe (even though it's expected for new items)
 * - source subtypes and names make sense for their main type (& the type is valid)
 */
function validateDbIntegrity(db: Database) {
    for (const item of Object.values(db.items)) {
        let hasRecipeSource = false;
        for (const source of item.source || []) {
            validateSingleSource(item, source);
            if (source.kind == 'recipe') {
                hasRecipeSource = true;
            }
        }
        if (!hasRecipeSource && item.recipe && item.source) {
            console.warn('Item ' + item.id + ' (' + item.name + ') has a recipe but no known sources for it.');
        }
        // TODO: recipe validation (name+id match & exist)
    }
}

function extractItemData(db: Database): ItemData {
    let items: Item[] = [];
    for (const item of Object.values(db.items)) {
        items.push(item);
    }
    return { items };
}

function extractNewItemData(db: Database): ItemData {
    let items: Item[] = [];
    for (const item of Object.values(db.items)) {
        if (item.id > db.maxIdOnFirstLoad) {
            items.push(item);
        }
    }
    return { items };
}

function extractItemDataSubset(db: Database, original: ItemData) {
    let items: Item[] = [];
    for (const item of original.items) {
        if (db.items[item.id]) {
            items.push(db.items[item.id]);
        } else {
            console.warn(
                'Did not export item ' + item.name + ' with id ' + item.id + ". It's missing in the database.",
            );
        }
    }
    return { items };
}

function extractCatalog(db: Database, c: CatalogType): CatalogList {
    // drop the synthetic and unserializable itemSet
    return { catalogs: [{ ...db.catalogs[c], itemSet: undefined }] };
}

function getCatalogFileName(c: CatalogType): string {
    switch (c) {
        case CatalogType.EvercoldCatalog:
            return 'evercold-catalog.json';
        case CatalogType.FloodedCatalog:
            return 'flooded-expedition-catalog.json';
        case CatalogType.FullCatalog:
            return 'main-catalog.json';
        case CatalogType.PhantomCatalog:
            return 'phantom-catalog.json';
        case CatalogType.QuestCatalog:
            return 'quest-catalog.json';
        case CatalogType.SunCatalog:
            return 'sun-festival-catalog.json';
    }
}

function buildExistingItemNameToId(items: ItemDB): [Record<string, number>, number] {
    let itemNameToId: Record<string, number> = {};
    let maxId = 99;
    for (const name of Object.keys(PLANT_INGREDEIENT_IDS)) {
        itemNameToId[name] = PLANT_INGREDEIENT_IDS[name];
    }
    for (const idStr of Object.keys(items)) {
        const id = parseInt(idStr);
        const name = items[id].name;
        if (KNOWN_DUPLICATE_ITEM_NAMES.has(name)) {
            // TODO: handle these somehow? Requiring these to be manual is probably fine for now.
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
    let [itemNameToId, maxId] = buildExistingItemNameToId(db.items);

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
        for (const ingredient of item.recipe?.ingredient || []) {
            if (!itemNameToId[ingredient.name]) {
                // plants are already added.
                if (KNOWN_DUPLICATE_ITEM_NAMES.has(item.name)) {
                    console.log('duplicate item in ingredients: ' + JSON.stringify(item));
                    throw 'duplicate item in ingredient.';
                }
                itemNameToId[ingredient.name] = ++maxId;
            }
        }
        if (!itemNameToId[item.name]) {
            itemNameToId[item.name] = ++maxId;
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

function fixCatalogIds(items: ItemDB, catalogs: CatalogDef[]): Record<string, CatalogDef> {
    let fixedCatalogs: Record<string, CatalogDef> = {};
    let [itemNameToId] = buildExistingItemNameToId(items);
    for (const newCatalog of catalogs) {
        let fixedItems: [string, string?][] = [];
        for (let [id, name] of newCatalog.items) {
            if (id.length == 0) {
                id = itemNameToId[name!!].toString();
            }
            fixedItems.push([id, name]);
        }
        fixedCatalogs[newCatalog.key] = { ...newCatalog, items: fixedItems };
    }
    return fixedCatalogs;
}

function integrateSources(db: Database, sources: Record<string, Source[]>, keepOldSources: boolean): ItemDB {
    let [itemNameToId] = buildExistingItemNameToId(db.items);

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
        let newSources: Source[] = [];
        if (keepOldSources && db.items[id].source) {
            const newSourceSet = new Set(sources[name].map((s) => JSON.stringify(s)));
            for (const existingSource of db.items[id].source || []) {
                if (!newSourceSet.has(JSON.stringify(existingSource))) {
                    newSources.push(existingSource);
                }
            }
        }
        newSources.push(...sources[name]);

        updatedItemDb[id] = { ...updatedItemDb[id], source: newSources };
    }
    return updatedItemDb;
}

function integrateItemIcons(db: Database, icons: Record<string, string>): ItemDB {
    let updatedItemDb: ItemDB = {};

    let fixedItems = new Set();

    for (const id of Object.keys(db.items)) {
        const item = db.items[id];
        if (icons[item.name]) {
            updatedItemDb[id] = { ...item, image: { fandom_wiki_image_path: icons[item.name] } };
            fixedItems.add(item.name);
        } else {
            updatedItemDb[id] = item;
        }
    }

    for (const name of Object.keys(icons)) {
        if (!fixedItems.has(name)) {
            console.log('could not add available image for ' + name);
        }
    }

    return updatedItemDb;
}
