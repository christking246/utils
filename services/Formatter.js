const { padRight } = require('../utils.js');

const isSeparatorRow = (fields) => {
    for (let i = 0; i < fields.length; i++) {
        if (!fields[i].trim().match(/^ ?[-]+ ?$/)) {
            return false;
        }
    }

    // all cols only -'s, this must be a separator row
    return true;
};

// adapted from  https://github.com/JChris246/financial_tracker/blob/master/server/services/Transactions.js#L330
module.exports.formatMarkdownTable = (str) => {
    if (!str || typeof str !== 'string') {
        return { success: false, msg: "Input must be a non-empty string", code: 400 };
    }

    const rows = str.trim().split('\n');
    if (!rows || rows.length < 2) {
        return { success: false, msg: "Input must contain at least a header and a separator row", code: 400 };
    }

    // Parse each row into cells
    const parsedRows = rows.map(row => {
        // Remove leading and trailing pipes, then split by pipe
        const cells = row.replace(/^\||\|$/g, '').split('|').map(cell => cell.trim());
        return cells;
    });

    const numColumns = parsedRows[0].length;

    // Calculate maximum width for each column
    const columnWidths = new Array(numColumns).fill(0);
    const separatorRows = [];
    parsedRows.forEach((row, rowIndex) => {
        if (isSeparatorRow(row)) {
            separatorRows.push(rowIndex); // keep track of separator rows, we will re-add them later
            return; // skip width calculation for separator rows
        }

        row.forEach((cell, colIndex) => {
            columnWidths[colIndex] = Math.max(columnWidths[colIndex], cell.length + 2);
        });
    });

    // Rebuild the table with proper alignment
    const formattedRows = [];
    for (let i = 0; i < parsedRows.length; i++) {
        const dataCells = parsedRows[i].map((cell, index) => {
            const wasSeparator = separatorRows.includes(i);
            const padChar = wasSeparator ? '-' : ' ';
            const padFront = wasSeparator ? '' : ' ';
            return padRight(`${padFront}${cell}`, columnWidths[index], padChar)
        });
        formattedRows.push(`|${dataCells.join('|')}|`);
    }

    return { success: true, table: formattedRows.join('\n'), code: 200 };
};