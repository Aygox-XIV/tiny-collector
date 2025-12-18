import type { Category, Ingredient, Item } from '../database/database';
import {
    eventCategoryToType,
    EventType,
    eventTypeToCategory,
    OutpostType,
    SourceType,
    type CityBuilding,
    type GardenSeed,
    type Source,
} from '../database/sources';
import { formatItemName, parseCsv } from './common';

/**
 * parses a csv dump in the format of the "Tiny Shop License Calculator" (recipe/license tabs).
 * Returns Item[] with placeholder (-1) IDs in both the Item itself and the recipes.
 */
export function importLicenseCalcSheet(csvData: string): Item[] {
    // row 1: totals. ignorable
    // row 2: ingredient names
    // row 3+: items
    // col 1: item name (if surrounded by *, licensable w/o recipe, but is implied by lack of ingredients or 0/craft)
    // col 2: category
    // col 3: license amount
    // col 4,5,6: storage/progress counters, ignore
    // col 7: num per craft
    // col 8: calculated crafts needed
    // col 9+: ingredient counts. get num needed per craft by dividing by col 8

    let rows = parseCsv(csvData);

    let ingredientRow = 1;
    while (rows[ingredientRow][1] == '') {
        ingredientRow++;
    }
    let ingredientNames = rows[ingredientRow];
    for (let i = 8; i < ingredientNames.length; i++) {
        ingredientNames[i] = formatItemName(ingredientNames[i]);
    }

    let items: Item[] = [];

    for (let r = ingredientRow + 1; r < rows.length; r++) {
        const row = rows[r];
        const name = formatItemName(row[0]);
        const category = parseCategory(row[1]);
        const license_amount = parseInt(row[2]);
        const craft_amount = parseInt(row[6]);
        const total_crafts = parseInt(row[7]);
        if (craft_amount > 0 && total_crafts != Math.ceil(license_amount / craft_amount)) {
            throw 'Unexpected craft count for ' + name + '. ';
        }
        let ingredients: Ingredient[] = [];
        for (let c = 8; c < row.length; c++) {
            if (row[c].length > 0) {
                const total = parseInt(row[c]);
                ingredients.push({ name: ingredientNames[c], quantity: total / total_crafts, id: -1 });
            }
        }
        if (ingredients.length > 0 && craft_amount == 0) {
            throw 'unexpected ingredients for ' + name;
        }
        if (ingredients.length > 0) {
            items.push({ name, id: -1, category, license_amount, recipe: { ingredient: ingredients, craft_amount } });
        } else {
            items.push({ name, id: -1, category, license_amount });
        }
    }

    return items;
}

/**
 * Parses a csv dump in the format of the "Tiny Shop License Calculator" (wiki info tab).
 * Returns a map from (formatted) item name to list of sources for it
 */
export function importLicenseWikiSheet(csvData: string): Record<string, Source[]> {
    // row 1: column names
    // rows 2+: items (with some empty rows)
    // col 1: item name
    // col 2: category
    // col 3: combine cost
    // col 4: recipe (YES|NO)
    // col 5: amount per craft
    // col 6: license amount
    // col 7: license cost
    // col 8: license time
    // col 9: source description
    // col 10: event name
    // col 11: notes

    let rows = parseCsv(csvData);

    let allSources: Record<string, Source[]> = {};

    for (const row of rows) {
        // there are some line breaks
        if (row[0].length == 0) {
            continue;
        }
        const name = formatItemName(row[0]);
        let kind: 'recipe' | 'item';
        switch (row[3]) {
            case 'YES':
                kind = 'recipe';
                break;
            case 'NO':
                kind = 'item';
                break;
            default:
                throw 'Unknown RECIPE column value: ' + row[3];
        }
        let eventType: EventType | undefined = undefined;
        // Make some assumptions about which parts they are for.
        // The source description may have more details.
        switch (row[9]) {
            case 'NORMAL PLAY':
            case 'PACK ITEM':
            case '':
            // TODO: add anniversary event type?
            case '3RD ANNIVERSARY EVENT (2024)':
                break;
            case 'SUN FESTIVAL':
                eventType = EventType.SunFestival;
                break;
            case 'HALLOWEEN 2021':
                eventType = EventType.PhantomIslePart1;
                break;
            case 'HALLOWEEN 2022':
            case 'HALLOWEEN 2023':
                eventType = EventType.PhantomIslePart2;
                break;
            case 'WINTER 2021':
                eventType = EventType.EvercoldIslePart1;
                break;
            case 'WINTER 2022':
            case 'WINTER 2023':
                eventType = EventType.EvercoldIslePart2;
                break;
            default:
                throw 'Unhandled event type: ' + row[9];
        }

        // Some items need special handling I don't want to have to include here. (just add them manually)
        if (name.match('[+]$')) {
            // DONE. added manually.
            console.log('skipping +-recipe (complex): ' + name);
            continue;
        }
        if (name == 'Ducky Overlord') {
            // DONE. added manually.
            console.log('Skipping Ducky Overlord (complex)');
            continue;
        }
        if (name == 'Arcane Croissant' || name == 'Anniversary Cake') {
            // DONE. added manually.
            console.log('Skipping ' + name + ' (not in recipes)');
            continue;
        }

        let sourceDesc = row[8];

        if (sourceDesc.indexOf('(FOR ') > -1) {
            // some entries have <item source> / (for recipe|seeds) <recipe/seeds source>, but not consistently.
            // Just handle them manually since there's only 7.
            // TODO: do use some of the extraction logic, maybe?
            switch (name) {
                case 'Mad Screecher Original':
                    allSources[name] = [
                        {
                            type: SourceType.Outpost,
                            kind: 'item',
                            fragment: false,
                            subtype: 'Exchange',
                            name: OutpostType.Coastal,
                        },
                        {
                            type: SourceType.Feat,
                            kind: 'recipe',
                            fragment: false,
                            subtype: 'Selling',
                            name: 'Sell Mad Screechers',
                            level: 5,
                        },
                    ];
                    continue;
                case 'Morning Tea':
                    allSources[name] = [
                        {
                            type: SourceType.PremiumPack,
                            kind: 'recipe',
                            fragment: false,
                            subtype: undefined,
                            name: 'Botanist Set',
                        },
                        {
                            type: SourceType.MissionReward,
                            kind: 'item',
                            fragment: false,
                            subtype: undefined,
                            name: 'Business As Usual - Part 2/7',
                        },
                        {
                            type: SourceType.MissionReward,
                            kind: 'item',
                            fragment: false,
                            subtype: undefined,
                            name: 'Wheat and Sea - Part 11/13',
                        },
                    ];
                    continue;
                case 'Puff Tea':
                case 'Tower Tea':
                    allSources[name] = [
                        {
                            type: SourceType.PremiumPack,
                            kind: 'recipe',
                            fragment: false,
                            subtype: undefined,
                            name: 'Botanist Set',
                        },
                        {
                            type: SourceType.MissionReward,
                            kind: 'item',
                            fragment: false,
                            subtype: undefined,
                            name: 'Business As Usual - Part 2/7',
                        },
                    ];
                    continue;
                case 'Adventure Map':
                    allSources[name] = [
                        {
                            type: SourceType.PremiumPack,
                            kind: 'recipe',
                            fragment: false,
                            subtype: undefined,
                            name: 'Trading Guild Pack',
                        },
                        {
                            type: SourceType.MissionReward,
                            kind: 'item',
                            fragment: false,
                            subtype: undefined,
                            name: 'Business As Usual - Part 2/7',
                        },
                    ];
                    continue;
                case 'Oceanic Essence':
                    allSources[name] = [
                        {
                            type: SourceType.Boutique,
                            kind: 'recipe',
                            fragment: false,
                            subtype: undefined,
                            name: undefined,
                        },
                        {
                            type: SourceType.Journey,
                            kind: 'item',
                            fragment: false,
                            subtype: undefined,
                            name: 'Exploration: Sunken Cache',
                        },
                        {
                            type: SourceType.Journey,
                            kind: 'item',
                            fragment: false,
                            subtype: undefined,
                            name: 'Exploration: Sunken Meadow',
                        },
                        {
                            type: SourceType.Journey,
                            kind: 'item',
                            fragment: false,
                            subtype: undefined,
                            name: 'Lost Alchemist Cache',
                        },
                    ];
                    continue;
                default:
                    throw 'Unhandled multi-type sources for ' + name;
            }
        }

        // Some items have >1 source, so split everything on " / "
        const fullSourceDesc = sourceDesc;
        for (sourceDesc of fullSourceDesc.split(' / ')) {
            let fragment: boolean = false;
            const fragmentMatch = sourceDesc.match(' [(]1/[0-9]+[)]$');
            if (fragmentMatch != null) {
                fragment = true;
                sourceDesc = sourceDesc.substring(0, sourceDesc.length - fragmentMatch[0].length);
            }

            // some common not-really-formatted values
            if (sourceDesc == 'PURCHASE: BIRTHDAY BOUTIQUE') {
                allSources[name] = [
                    {
                        type: SourceType.Boutique,
                        kind,
                        fragment,
                        subtype: 'Anniversary',
                        name: undefined,
                    },
                ];
                continue;
            }
            if (sourceDesc == 'PURCHASE: PREMIUM BOUTIQUE') {
                allSources[name] = [
                    {
                        type: SourceType.Boutique,
                        kind,
                        fragment,
                        subtype: undefined,
                        name: undefined,
                    },
                ];
                continue;
            }
            if (sourceDesc == 'IAP: BLACKSMITH BUNDLE') {
                allSources[name] = [
                    {
                        type: SourceType.PremiumPack,
                        kind,
                        fragment,
                        subtype: undefined,
                        name: 'Blacksmith Set',
                    },
                ];
            }
            if (sourceDesc == 'IAP: KITCHEN BUNDLE') {
                allSources[name] = [
                    {
                        type: SourceType.PremiumPack,
                        kind,
                        fragment,
                        subtype: undefined,
                        name: 'Kitchen Set',
                    },
                ];
            }
            if (sourceDesc == 'IAP: HOME BUNDLE') {
                allSources[name] = [
                    {
                        type: SourceType.PremiumPack,
                        kind,
                        fragment,
                        subtype: undefined,
                        name: 'Home Set',
                    },
                ];
            }
            if (sourceDesc == 'PURCHASE: FESTIVAL CITY MERCHANT') {
                allSources[name] = [
                    {
                        type: SourceType.EventMarket,
                        kind,
                        fragment,
                        subtype: eventType!,
                        name: undefined,
                    },
                ];
                continue;
            }
            if (sourceDesc == 'SUN FESTIVAL TASK REWARD CHEST (SMALL)') {
                allSources[name] = [
                    {
                        type: SourceType.TaskChest,
                        kind,
                        fragment,
                        subtype: eventType!,
                        name: 'Small Chest (3, 6, 9 tasks)',
                    },
                ];
                continue;
            }
            if (sourceDesc == 'SUN FESTIVAL TASK REWARD CHEST (BIG)') {
                allSources[name] = [
                    {
                        type: SourceType.TaskChest,
                        kind,
                        fragment,
                        subtype: eventType!,
                        name: 'Medium Chest (12, 24 tasks)',
                    },
                ];
                continue;
            }
            if (sourceDesc == 'SUN FESTIVAL TASK REWARD CHEST (PURPLE)') {
                allSources[name] = [
                    {
                        type: SourceType.TaskChest,
                        kind,
                        fragment,
                        subtype: eventType!,
                        name: 'Large Chest (36 tasks)',
                    },
                ];
                continue;
            }
            // Technically formatted, but doesn't have required Feat category info
            // (also the only Feat source not covered by the manual one above)
            if (sourceDesc == 'ACHIEVE FEAT: "KROASSANT!" LV2') {
                allSources[name] = [
                    {
                        type: SourceType.Feat,
                        kind,
                        fragment,
                        subtype: 'Misc',
                        name: 'KROASSANT!',
                        level: 2,
                    },
                ];
                continue;
            }

            // TODO: outpost research+exchange combo needs special handling (omit research)

            allSources[name] = allSources[name] || [];
            // common prefixes
            if (sourceDesc.startsWith('JOURNEY: ')) {
                for (const journeyName of sourceDesc.substring(9).split(',')) {
                    allSources[name].push({
                        type: SourceType.Journey,
                        kind,
                        fragment,
                        subtype: eventType,
                        name: formatItemName(journeyName),
                    });
                }
                continue;
            }
            if (sourceDesc.startsWith('HARVEST: ')) {
                for (const seedName of sourceDesc.substring(9).split(',')) {
                    allSources[name].push({
                        type: SourceType.Harvest,
                        kind,
                        fragment,
                        subtype: undefined,
                        name: formatItemName(seedName) as GardenSeed,
                    });
                }
                continue;
            }
            if (sourceDesc.startsWith('EXCHANGE: ')) {
                assertSingleSource(sourceDesc, name);
                // Ignore the level requirement. Barring bugs, nothing will disappear when leveled up.
                const levelMatch = sourceDesc.match(' [(]LV[0-9]+[)]$');
                if (levelMatch) {
                    sourceDesc = sourceDesc.substring(0, sourceDesc.length - levelMatch[0].length);
                }
                let outpostType: OutpostType;
                switch (sourceDesc.substring(10)) {
                    case 'NATURALIST OUTPOST':
                        outpostType = OutpostType.Naturalist;
                        break;
                    case 'TRADING OUTPOST':
                        outpostType = OutpostType.Trading;
                        break;
                    case 'COASTAL OUTPOST':
                        outpostType = OutpostType.Coastal;
                        break;
                    case 'ARCHAEOLOGY OUTPOST':
                    case 'ARCHEOLOGY OUTPOST':
                        outpostType = OutpostType.Archeology;
                        break;
                    default:
                        throw 'Unknown outpost type for ' + name + ': [' + sourceDesc + ']';
                }
                allSources[name].push({
                    type: SourceType.Outpost,
                    kind,
                    fragment,
                    subtype: 'Exchange',
                    name: outpostType,
                });
                continue;
            }
            if (sourceDesc.startsWith('RESEARCH: ')) {
                assertSingleSource(sourceDesc, name);
                sourceDesc = sourceDesc.substring(10);
                const levelMatch = sourceDesc.match(' [(]LV[0-9]+[)]$');
                // ignore building level requirements
                if (levelMatch) {
                    sourceDesc = sourceDesc.substring(0, sourceDesc.length - levelMatch[0].length);
                }
                if (sourceDesc.includes('OUTPOST')) {
                    let outpostType: OutpostType;
                    switch (sourceDesc) {
                        case 'NATURALIST OUTPOST':
                            outpostType = OutpostType.Naturalist;
                            break;
                        case 'TRADING OUTPOST':
                            outpostType = OutpostType.Trading;
                            break;
                        case 'COASTAL OUTPOST':
                            outpostType = OutpostType.Coastal;
                            break;
                        case 'ARCHAEOLOGY OUTPOST':
                        case 'ARCHEOLOGY OUTPOST':
                            outpostType = OutpostType.Archeology;
                            break;
                        default:
                            throw 'Unknown outpost type for ' + name + ': [' + sourceDesc + ']';
                    }
                    allSources[name].push({
                        type: SourceType.Outpost,
                        kind,
                        fragment,
                        subtype: 'Research',
                        name: outpostType,
                    });
                    continue;
                }
                const shop = formatItemName(sourceDesc);
                allSources[name].push({
                    type: SourceType.City,
                    kind,
                    fragment,
                    subtype: 'Research',
                    // potential of incorrect data, but that's easily fixable
                    name: shop as CityBuilding,
                });
                continue;
                // TODO: outpost w/ exchange. doesn't appear to be anything that makes it to the error somehow
            }
            if (sourceDesc.startsWith('PURCHASE: SHIFTY')) {
                assertSingleSource(sourceDesc, name);
                const crateMatch = sourceDesc.match(' [(]([A-Z ]+)[)]$');
                let crateName: string | undefined = undefined;
                if (crateMatch) {
                    crateName = formatItemName(crateMatch[1]);
                }
                allSources[name].push({
                    type: SourceType.Shifty,
                    kind,
                    fragment,
                    subtype: undefined,
                    name: crateName,
                });
                continue;
            }
            if (sourceDesc.startsWith('COMPLETE TASK: ')) {
                assertSingleSource(sourceDesc, name);
                if (!eventType) {
                    throw 'unhandled non-event task with rewards for ' + name + ': ' + sourceDesc;
                }
                // If a part is specified, fix it from the guessed one based on the year
                const partMatch = sourceDesc.match(' [(]PART ([0-9]+)[)]$');
                const eventCategory = eventTypeToCategory(eventType!);
                if (partMatch) {
                    eventType = eventCategoryToType(eventCategory, parseInt(partMatch[1]));
                    sourceDesc = sourceDesc.substring(0, sourceDesc.length - partMatch[0].length);
                }
                allSources[name].push({
                    type: SourceType.Task,
                    kind,
                    fragment,
                    subtype: eventType,
                    name: formatItemName(sourceDesc.substring(16, sourceDesc.length - 1)),
                });
                continue;
            }
            if (sourceDesc.startsWith('COMPLETE STORY QUEST: ')) {
                sourceDesc = sourceDesc.substring(22);
                if (sourceDesc.charAt(0) == '"') {
                    sourceDesc = sourceDesc.substring(1, sourceDesc.length - 1);
                }
                const partMatch = sourceDesc.match(' [(]([0-9]+/[0-9]+)[)]$');
                let partSuffix = '';
                if (partMatch) {
                    sourceDesc = sourceDesc.substring(0, sourceDesc.length - partMatch[0].length);
                    partSuffix = ' - Part ' + partMatch[1];
                }
                allSources[name].push({
                    type: SourceType.MissionReward,
                    kind,
                    fragment,
                    subtype: undefined,
                    name: formatItemName(sourceDesc) + partSuffix,
                });
                continue;
            }
            if (sourceDesc.startsWith('DEFEAT ENEMY: ')) {
                let enemies: string[] = [];
                if (!eventType) {
                    throw 'Enemy without event type for ' + name + ': ' + sourceDesc;
                }
                if (
                    eventType != EventType.FloodedExpedition &&
                    eventType != EventType.EvercoldIslePart2 &&
                    eventType != EventType.PhantomIslePart2
                ) {
                    throw 'Unexpected event type with a battle for ' + name + ': ' + eventType;
                }
                for (const enemy of sourceDesc.substring(14).split(',')) {
                    switch (enemy) {
                        case 'ANY WISP':
                            enemies.push('Dread Wisp', "Will O' Wisp");
                            break;
                        case 'ANY BLOODSLIME':
                            enemies.push('Bloodslime', 'Spiky Bloodslime');
                            break;
                        case 'ANY TOMBSTONE':
                            enemies.push('Animated Tombstone', 'Soulfire Tombstone');
                            break;
                        case 'ANY FROSTBEARD':
                            enemies.push('Frostbeard Ancient', 'Frostbeard Yeti', 'Frostbeard Youngling');
                            break;
                        case 'ANY ICEMAZON':
                            enemies.push('Icemazon Duelist', 'Icemazon Guardian', 'Icemazon Soother');
                            break;
                        default:
                            if (enemy.startsWith('ANY')) {
                                throw 'Unhandled wildcard enemy: ' + enemy;
                            }
                            enemies.push(formatItemName(enemy));
                    }
                }
                for (const enemy of enemies) {
                    allSources[name].push({
                        type: SourceType.Battle,
                        kind,
                        fragment,
                        subtype: eventType,
                        name: enemy,
                    });
                    // All battles from part 2 stick around for part 3
                    if (eventType == EventType.PhantomIslePart2) {
                        allSources[name].push({
                            type: SourceType.Battle,
                            kind,
                            fragment,
                            subtype: EventType.PhantomIslePart3,
                            name: enemy,
                        });
                    }
                }
                continue;
            }
        }

        if (!allSources[name] || allSources[name].length == 0) {
            throw 'Unhandled source description for ' + name + ': ' + sourceDesc;
        }

        // Drop the research
        if (
            allSources[name].length == 2 &&
            allSources[name][0].type == SourceType.City &&
            allSources[name][1].type == SourceType.Outpost &&
            allSources[name][1].subtype == 'Exchange'
        ) {
            allSources[name] = [allSources[name][1]];
        }
    }

    return allSources;
}

function assertSingleSource(sourceDesc: string, name: string) {
    if (sourceDesc.indexOf(',') > -1) {
        throw 'unhandled multiple entries in one row for ' + name + ': ' + sourceDesc;
    }
}

function parseCategory(input: string): Category {
    switch (input) {
        case 'GEAR':
            return 'Gear';
        case 'MATERIAL':
            return 'Material';
        case 'CONSUMABLES':
            return 'Consumables';
    }
    throw 'Unhandled category in csv: ' + input;
}
