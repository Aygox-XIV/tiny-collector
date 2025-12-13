import { CatalogType, type CatalogDef, type Category, type Item } from '../database/database';
import { parseCsv } from './common';

/** parses a csv dump in the format of the "Journey and catalog" sheet (catalog tab).
 * Returns Item[] with placeholder (-1) IDs, and the Quest catalog.
 * Non-quest items are not currently ordered in the required way. (they're corrcetly ordered by type, but not combined) */
export function importCatalogList(csvData: string): [Item[], CatalogDef] {
    /*
    row 1: headers
    row 2+: items

    col 1: category
    col 2: name
    */

    const rows: string[][] = parseCsv(csvData);
    let items: Item[] = [];
    let catalogItems: [string, string?][] = [];

    for (let r = 1; r < rows.length; r++) {
        const name = rows[r][1];
        const categoryStr = rows[r][0];
        if (name.includes('?')) {
            console.log('skipping row: ' + JSON.stringify(rows[r]));
            continue;
        }
        let category: Category;
        switch (categoryStr) {
            case 'Quest':
                category = 'Quest';
                catalogItems.push(['', name]);
                break;
            case 'Material':
                category = 'Material';
                break;
            case 'Consumables':
                category = 'Consumables';
                break;
            case 'Gear':
                category = 'Gear';
                break;
            default:
                throw 'unknown category ' + categoryStr;
        }
        items.push({ name, id: -1, category });
    }

    console.log('importing ' + items.length + ' item names');

    return [
        items,
        {
            key: CatalogType.QuestCatalog,
            name: 'Autolog (Quest)',
            icon: { local_path: '/catalog_quest.png' },
            categories: ['Quest'],
            items: catalogItems,
        },
    ];
}
