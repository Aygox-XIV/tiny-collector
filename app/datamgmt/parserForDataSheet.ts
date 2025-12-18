import {
    EventType,
    OutpostType,
    SourceType,
    type CityBuilding,
    type GardenSeed,
    type Source,
} from '../database/sources';
import { formatItemName, parseCsv } from './common';

// Items added after I (Aygox) started populating most of the new data.
const SAFE_ITEM_NAMES: Set<string> = new Set([
    'Monster Fizz Original',
    'Bloodberry Ice Cream',
    'Spectral Choco Ice Cream',
    'Cultist Brochures',
    'Blue Haze',
    'Cursed Pumpkin Ice Cream',
    'Spirit Smash',
    'Cult Torch',
    'Headless Spring',
    'Spectral Noodles',
    'Spectral Bourguignon',
    'Spectral Pumpkin Soup',
    'Spectral Quindim',
    'Ghostly Mary',
    'Monster Fizz Bloodberry',
    'Cursed Bana Ice Cream',
    'Shadow Libre',
    'Monster Fizz Pumpkin',
    'Cult Barbecue',
    'Grilling Tools',
    'Blender',
    'Cult Censer',
    'Tombstone Blues',
    'Monster Fizz Spectral',
    'Monster Mucus',
    'Bubbling Sunset',
    'Black Bayou',
    'Smash Fizz',
    'Koko Loco',
    'Skin: Ghostly Jelly',
    'Skin: Skelly Jelly',
    'Anniversary Cake',
    'Anniversary Cake',
    'Ashen Baguette',
    'Ashen Brioche',
    'Ashen Croissant',
    'Ashen Flatbread',
    'Ashen Flour',
    'Ashen Loaf',
    'Ashen Noodles',
    'Ashen Sandwich',
    'Baguette',
    'Beach Shorts',
    'Blue Tower Jam',
    'Blue Woolsworn Scarf',
    'Drakegull Steak',
    'Fiery Baguette',
    'Fiery Brioche',
    'Fiery Coral Crab Noodles',
    'Fiery Kraken Noodles',
    'Fiery Mushroom Noodles',
    'Fiery Sandwich',
    'Flatbread',
    'Green Woolsworn Scarf',
    'Ham Croissant',
    'Morning Glory Jam',
    'Pancakes',
    'Pink Woolsworn Scarf',
    'Puff Flower Jam',
    'Red Woolsworn Scarf',
    'Sandwich Snack',
    'Sunscreen',
    'Sunstriker',
    'The Ash Delight',
    'White Woolsworn Scarf',
    'Whole Birthday Cake',
    'Whole Birthday Cake',
    'Yellow Bandana',
    'Yellow Beach Top',
    'Yellow Pareo',
    'Yellow Swimwear',
    'Aetheric Salt',
    'Berry Bliss Smoothie',
    'Berry Slimeflan',
    'Biscuit',
    'Biscuitmaker',
    'Bourguignon',
    'Bread Loaf',
    'Butter',
    'Canvas Bag',
    'Cheese Mix',
    'Cheese Sandwich',
    'Chocolate Manju',
    'Circular Lamp',
    'Coffee Berries',
    'Coffee Drink',
    'Coffee Machine',
    'Condensed Time',
    'Condensed Time',
    'Crate of Screechers',
    'Crystalline Totem of Healing',
    'Crystalline Totem of Mana',
    'Crystalline Totem of Power',
    'Dark Coffee',
    'Decor: Beastie',
    'Drakegull Tartlet',
    'Emimimental',
    'Endberries',
    'Espresso',
    'Field Stalker Figurine',
    'Fish Pastry',
    'Flower Pot',
    'Fungal Steak',
    'Jam Waffles',
    'Jam Waffles',
    'Kraken Filled Loaf',
    'Kraken Steak',
    'Latte',
    'Lemon Slimeflan',
    'Matcha',
    'Mato Sauce',
    "Mimi's Special",
    'Mocha',
    'Moonfish Sandwich',
    'Moonfish Steak',
    'Moonfish Tartlet',
    'Mushroom Tartlet',
    'Pain au Chocolat',
    'Parmimigiano',
    'Potted Aetheric Flowers',
    'Potted Redchidaes',
    'Potted Silverblooms',
    'Potted Violetines',
    'Record Player',
    'Retrotemporal Bread',
    'Roasted Blend',
    'Rye Bread',
    'Softbread Loaf',
    'Sourdough Bread',
    'Sporetower',
    'Starbread',
    'Strange Loaf',
    'Strange Looking Plants',
    'Sunbiter',
    'Sunny Smoothie',
    'Sunriver Blend',
    'Sunset Smoothie',
    'Sweetbread',
    'Timefound Baguette',
    'Timefound Brioche',
    'Experiment #127',
    'Timefound Kettle',
    'Timefound Loaf',
    'Timefound Rye Bread',
    'Timefound Softbread',
    'Timefound Sourdough',
    'Timefound Starbread',
    'Timefound Traditional Loaf',
    'Traditional Loaf',
    'Twilight Smoothie',
    'Violet Duck',
    'Waffles',
    "Where's My Kitty?",
    "Where's My Kitty?",
    "Where's My Kitty?",
    "Where's My Kitty?",
    "Where's My Kitty?",
    'Whipped Cream Waffles',
    'Time Stalk',
    'Coffee',
    'Vegan Bourguignon',
    'Condensed Time',
    // TODO: all SF and FE items
]);

/**
 * Extracts item sources from the "Tiny shop data" spreadsheet (Sources tab). Returns a map from item name to sources.
 */
export function importSourcesFromDataSheet(csvFile: string): Record<string, Source[]> {
    /*
      This sheet inspired the format used here, so much will be a 1:1 copy.
      col 1: name
      col 7: kind (Item/Recipe)
      col 8: fragment (TRUE/FALSE)
      col 9: type
      col 10: subtype
      col 13: name
      
      ignore rows wih col 1 (name):
      - empty (first row, for some reason)
      - "Name"
      - starts with _Example
      - has ?
      - not in SAFE_ITEM_NAMES

      ignore rows with empty "kind" (not yet formally defined)

      also ignore rows with ? in col 13
    */
    let allSources: Record<string, Source[]> = {};

    const rows = parseCsv(csvFile);
    let unsafeSkippedCount = 0;

    for (let r = 0; r < rows.length; r++) {
        const row = rows[r];
        if (row[0].length == 0) {
            continue;
        }
        if (row[0] == 'Name' && row[8] == 'Type') {
            // header row
            continue;
        }
        if (row[0].startsWith('_Example')) {
            console.log('Skipping example item: ' + row[0]);
            continue;
        }
        if (row[0].includes('?')) {
            console.log('Skipping item with undetermined name: ' + row[0]);
            continue;
        }
        if (row[6].length == 0) {
            continue;
        }
        if (!SAFE_ITEM_NAMES.has(row[0])) {
            unsafeSkippedCount++;
            continue;
        }

        let itemName = formatItemName(row[0]);
        // Fix some typos
        switch (itemName) {
            case 'Spectral Noodles':
                itemName = 'Spectral Noodle';
                break;
            case 'Crystalline Totem of Mana':
                itemName = 'Crystalline Totem of Mana Shield';
                break;
            case 'Sporetower':
                itemName = 'Sporetower Figurine';
                break;
            case 'Sunbiter':
                itemName = 'Sunbiter Figurine';
                break;
            case 'Violet Duck':
                itemName = 'Decor: Violet Duck';
                break;
        }
        let sources = allSources[itemName] || [];

        switch (row[8]) {
            case 'Outpost':
                sources.push({
                    type: SourceType.Outpost,
                    kind: getKind(row),
                    fragment: getFragment(row),
                    subtype: row[9] as 'Shop' | 'Exchange' | 'Research',
                    name: row[12] as OutpostType,
                });
                break;
            case 'City':
                sources.push({
                    type: SourceType.City,
                    kind: getKind(row),
                    fragment: getFragment(row),
                    subtype: row[9] as 'Shop' | 'Research',
                    name: row[12] as CityBuilding,
                });
                break;
            case 'Harvest':
                sources.push({
                    type: SourceType.Harvest,
                    kind: getKind(row),
                    fragment: getFragment(row),
                    name: row[12] as GardenSeed,
                });
                break;
            case 'Battle':
                sources.push({
                    type: SourceType.Battle,
                    kind: getKind(row),
                    fragment: getFragment(row),
                    subtype: getEventSubtype(row) as
                        | EventType.FloodedExpedition
                        | EventType.PhantomIslePart2
                        | EventType.PhantomIslePart3
                        | EventType.EvercoldIslePart2,
                    name: row[12],
                });
                break;
            case 'Journey':
                sources.push({
                    type: SourceType.Journey,
                    kind: getKind(row),
                    fragment: getFragment(row),
                    subtype: getEventSubtype(row),
                    name: row[12],
                });
                break;
            case 'Event Market':
                sources.push({
                    type: SourceType.EventMarket,
                    kind: getKind(row),
                    fragment: getFragment(row),
                    subtype: getEventSubtype(row)!!,
                    name: getName(row),
                });
                break;
            case 'Task':
                sources.push({
                    type: SourceType.Task,
                    kind: getKind(row),
                    fragment: getFragment(row),
                    subtype: getEventSubtype(row)!!,
                    name: row[12],
                });
                break;
            case 'Task Chest':
                sources.push({
                    type: SourceType.TaskChest,
                    kind: getKind(row),
                    fragment: getFragment(row),
                    subtype: row[9] == 'Daily' ? 'Daily' : getEventSubtype(row)!!,
                    name: row[12],
                });
                break;
            case 'Mission Reward':
                sources.push({
                    type: SourceType.MissionReward,
                    kind: getKind(row),
                    fragment: getFragment(row),
                    name: row[12],
                });
                break;
            default:
                console.log('skipping ' + row[8] + ' type source for item: ' + row[0]);
                continue;
        }
        allSources[itemName] = sources;
    }

    console.log(
        'skipped ' +
            unsafeSkippedCount +
            ' sources since provenance cannot be traced back to someone OK with it being public data',
    );

    return allSources;
}

function getName(row: string[]): string | undefined {
    return row[12].length == 0 ? undefined : row[12];
}

function getKind(row: string[]): 'item' | 'recipe' {
    switch (row[6]) {
        case 'Item':
            return 'item';
        case 'Recipe':
            return 'recipe';
        default:
            throw 'Unexpected kind: ' + row[6] + ' for item ' + row[0];
    }
}

function getFragment(row: string[]): boolean {
    switch (row[7]) {
        case 'TRUE':
            return true;
        case 'FALSE':
            return false;
        default:
            throw 'unexpected fragment: ' + row[7] + ' for item ' + row[0];
    }
}

function getEventSubtype(row: string[]): EventType | undefined {
    switch (row[9]) {
        case '':
            return undefined;
        case 'Sun Festival':
            return EventType.SunFestival;
        case 'Flooded Expedition':
            return EventType.FloodedExpedition;
        case 'Phantom Isle - Phase 1':
            return EventType.PhantomIslePart1;
        case 'Phantom Isle - Phase 2':
            return EventType.PhantomIslePart2;
        case 'Phantom Isle - Phase 3':
            return EventType.PhantomIslePart3;
        case 'Evercold Isle - Phase 1':
            return EventType.EvercoldIslePart1;
        case 'Evercold Isle - Phase 2':
            return EventType.EvercoldIslePart2;
        default:
            throw 'unknown event type ' + row[9] + ' for item ' + row[0];
    }
}
