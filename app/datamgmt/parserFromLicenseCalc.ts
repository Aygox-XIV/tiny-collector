import type { Category, Ingredient, Item } from '../database/database';

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

    let rows: string[][] = [];
    csvData.split(RegExp('\r?\n')).forEach((rawRow) => {
        rows.push(rawRow.split(','));
    });

    let ingredientNames = rows[1];
    for (let i = 8; i < ingredientNames.length; i++) {
        ingredientNames[i] = formatItemName(ingredientNames[i]);
    }

    let items: Item[] = [];

    for (let r = 2; r < rows.length; r++) {
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

function formatItemName(sheetStr: string): string {
    const upperStr = sheetStr.charAt(0) == '*' ? sheetStr.substring(1, sheetStr.length - 1) : sheetStr;
    let parts = upperStr.toLowerCase().split(' ');
    for (let i = 0; i < parts.length; i++) {
        parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
    }
    return parts.join(' ');
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
