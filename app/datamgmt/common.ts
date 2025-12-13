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
