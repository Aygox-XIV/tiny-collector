import { BASE_FILE_TYPES, loadFile, saveFile } from '../common/files';
import {
    CatalogType,
    REAL_FILES,
    setDbItems,
    useDatabase,
    type CatalogList,
    type Category,
    type Database,
    type Ingredient,
    type Item,
    type ItemData,
    type ItemDB,
    type Recipe,
    type SourceImage,
    type SourceImageList,
} from '../database/database';
import { SourceType, validateSingleSource, type Source } from '../database/sources';
import type { Route } from '../datamgmt/+types/view';
import { useAppDispatch } from '../store';
import { parseCsv } from './common';
import { importRecipesFromDataSheet, importSourcesFromDataSheet } from './parserForDataSheet';
import { importItemIconUrls } from './parserForFandomWiki';

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
    'Condensed Time', // 1 quest, 1 material
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
    // Scrolls with different durations
    'Swift Crafting',
    'Infinite Stock',
    // Some decor
    'Grass Patch',
    'Temple Fountain',
    'Temple Spout',
    'Temple Fountain Top',
    'Ruined Temple Wall',
    'Mannequin - Pareo',
    'Mannequin - Swimsuit',
    'Mannequin - Bathing Shorts',
]);

// Most duplicate items only have at most one version used as ingredient elsewhere (all except the anniversary cake)
const INGREDIENT_IDS: Record<string, number> = {
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
    Kelp: 920,
    'Condensed Time': 863,
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
    const exportMissingRecipes = () => {
        saveFile(extractItemsWithMissingRecipe(db), CSV_FILES, 'missing-recipes.csv');
    };
    const loadRecipeHelperData = () => {
        loadFile((f) => {
            appDispatch(setDbItems(integrateRecipeHelperSheet(f, db)));
        }, CSV_FILES);
    };
    const exportSourceMetadata = () => {
        saveFile(JSON.stringify(extractSourceMetadata(db)));
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
                <div className="settings-item" onClick={exportSourceMetadata}>
                    Export source metadata (one file)
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
                <div className="settings-item" onClick={exportMissingRecipes}>
                    Export items with missing recipes
                </div>
                <div className="settings-item" onClick={loadRecipeHelperData}>
                    Import recipe helper sheet data (id,name,quantity,ingredient1,2,3,4,license_amount csv)
                </div>
            </div>
        </div>
    );
}

// Combine and Harvest sources also have images, but they are the relevant item's image
const SOURCE_TYPES_WITH_IMAGES: Set<SourceType> = new Set([
    SourceType.Outpost,
    SourceType.City,
    SourceType.Battle,
    SourceType.Journey,
    SourceType.Shifty,
    SourceType.EventMarket,
    SourceType.TaskChest,
    SourceType.PremiumPack,
]);

function extractSourceMetadata(db: Database): SourceImageList {
    let images: SourceImage[] = [];
    for (const source of Object.values(db.sources)) {
        if (!SOURCE_TYPES_WITH_IMAGES.has(source.source.type)) {
            continue;
        }
        images.push({
            type: source.source.type,
            subtype: source.source.subtype,
            name: source.source.name,
            src: source.imageSrc,
        });
    }
    return { images };
}

const CATEGORIES_WITH_POTENTIAL_RECIPES: Set<Category> = new Set(['Consumables', 'Gear', 'Material']);

function extractItemsWithMissingRecipe(db: Database): string {
    let items: string[] = ['id,name,num,ingredient 1,ingredient 2,ingredient 3,ingredient 4,license amount'];

    for (const item of Object.values(db.items)) {
        if (item.recipe) {
            continue;
        }
        if (!CATEGORIES_WITH_POTENTIAL_RECIPES.has(item.category)) {
            continue;
        }
        // If sources are available, but none are for a recipe, assume there is no recipe [for this export]
        if (item.source) {
            let hasRecipeSource = false;
            for (const s of item.source) {
                if (s.kind == 'recipe') {
                    hasRecipeSource = true;
                    break;
                }
            }
            if (!hasRecipeSource) {
                continue;
            }
        }
        items.push(item.id + ',' + item.name);
    }
    return items.join('\n');
}

function integrateRecipeHelperSheet(csvFile: string, db: Database): ItemDB {
    let [itemNameToId] = buildExistingItemNameToId(db.items);
    let updatedItemDb: ItemDB = {};
    for (const id of Object.keys(db.items)) {
        updatedItemDb[id] = db.items[id];
    }
    /*
    col 1: id
    col 2: name
    col 3: craft_amount
    col 4,5,6,7: ingredients if craft_amount>0
    col 8: license amount
     */
    let rows = parseCsv(csvFile);
    for (let r = 1; r < rows.length; r++) {
        const row = rows[r];
        if (row[2].length == 0) {
            continue;
        }
        const id = parseInt(row[0]);
        const dbItem = db.items[id];
        let ingredient: Ingredient[] = [];
        for (let c = 3; c < 7 && c < row.length; c++) {
            if (row[c].length > 0) {
                const parts = row[c].split('/');
                if (parts.length != 2) {
                    console.log('bad ingredient format: ' + row[c] + ' for ' + row[1]);
                    return db.items;
                }
                if (!itemNameToId[parts[0]]) {
                    console.log('unknown ingredient name: ' + parts[0] + ' for ' + row[1]);
                    return db.items;
                }
                ingredient.push({ name: parts[0], quantity: parseInt(parts[1]), id: itemNameToId[parts[0]] });
            }
        }

        let license_amount: number | undefined;
        if (row.length > 7 && row[7].length > 0) {
            license_amount = parseInt(row[7]);
        }
        updatedItemDb[id] = {
            ...dbItem,
            recipe: { ingredient, craft_amount: parseInt(row[2]) },
            license_amount: license_amount || dbItem.license_amount,
        };
    }
    return updatedItemDb;
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
        const logPrefix = 'Item ' + item.id + ' (' + item.name + ') ';
        for (const source of item.source || []) {
            validateSingleSource(item, source);
            if (source.kind == 'recipe') {
                hasRecipeSource = true;
            }
        }
        if (!hasRecipeSource && item.recipe && item.source) {
            console.warn(logPrefix + 'has a recipe but no known sources for it.');
        }
        if (item.recipe) {
            if (!item.recipe.ingredient || item.recipe.ingredient.length == 0) {
                console.warn(logPrefix + 'has a recipe with no ingredients');
            }
            for (const ingredient of item.recipe.ingredient) {
                const dbIngredient = db.items[ingredient.id];
                if (!dbIngredient) {
                    console.warn(
                        logPrefix + ' has an ingredient (' + ingredient.name + ') with invalid id ' + ingredient.id,
                    );
                } else if (dbIngredient.name != ingredient.name) {
                    console.warn(
                        logPrefix +
                            'has an ingredient (' +
                            ingredient.name +
                            ') with id for a different item. The ID points to ' +
                            dbIngredient.name,
                    );
                }
                if (!ingredient.quantity || ingredient.quantity <= 0) {
                    console.warn(
                        logPrefix +
                            'has an ingredient (' +
                            ingredient.name +
                            ') with invalid quantity ' +
                            ingredient.quantity,
                    );
                }
            }
            if (!item.recipe.craft_amount || item.recipe.craft_amount <= 0) {
                console.warn(logPrefix + 'has a recipe without craft amount');
            }
        }
        // TODO: only some known small set of items has a recipe but is unlicensable
        // TODO: only some known small-ish set of items is licenseable but has no recipe
        // TODO: subsequent event parts should have a source as well for non-task sources (barring some exceptions/bugs)
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
    for (const name of Object.keys(INGREDIENT_IDS)) {
        itemNameToId[name] = INGREDIENT_IDS[name];
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
