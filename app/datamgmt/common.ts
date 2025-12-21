export function parseCsv(csvStr: string): string[][] {
    let rows: string[][] = [];
    csvStr.split(RegExp('\r?\n')).forEach((rawRow) => {
        // .split(,) doesn't work. values may have commas
        // (using csv-parse would have been nice, but it doesn't work in a browser...)
        let row: string[] = [];
        let i = 0;
        while (i < rawRow.length) {
            const start = i;
            while (rawRow.charAt(i) === '"') {
                // "-delimited strings may have additional ", which are escaped with another ".
                let nextQuote = rawRow.indexOf('"', i + 1);
                if (nextQuote < 0) {
                    throw 'unclosed quote. full row: ' + rawRow;
                }
                i = nextQuote + 1;
            }
            const nextComma = rawRow.indexOf(',', i);
            let cell;
            if (nextComma < 0) {
                cell = rawRow.substring(start);
                i = rawRow.length;
            } else {
                cell = rawRow.substring(start, nextComma);
                i = nextComma + 1;
            }
            if (cell.length > 0 && cell.charAt(0) == '"') {
                cell = cell.substring(1, cell.length - 1).replaceAll('""', '"');
            }
            row.push(cell.trim());
        }
        rows.push(row);
    });
    return rows;
}

// TODO: more? mostly a hack so the task sources can use the item-name formatter as well
const FULL_LOWER_INNER_WORDS = new Set(['of', 'the', 'a', 'in', 'to', 'items', 'category', 'journeys']);

// Also formats journey names/etc. (practically: toPascalCase with some extra trimming)
export function formatItemName(sheetStr: string): string {
    const upperStr = sheetStr.charAt(0) == '*' ? sheetStr.substring(1, sheetStr.length - 1) : sheetStr;
    let parts = upperStr.trim().toLowerCase().split(' ');
    for (let i = 0; i < parts.length; i++) {
        if (i > 0 && FULL_LOWER_INNER_WORDS.has(parts[i])) {
            continue;
        }
        if (parts[i].match('^i+$')) {
            parts[i] = parts[i].toUpperCase();
            continue;
        }
        parts[i] = parts[i].charAt(0).toUpperCase() + parts[i].substring(1);
    }
    return parts.join(' ');
}
