function formatMarkdownTable() {
    const inputTextarea = document.getElementById('md-table-input');
    const resultsDiv = document.getElementById('md-table-results');
    const errorDiv = document.getElementById('md-table-error');
    const successDiv = document.getElementById('md-table-success');

    // Hide previous results and messages
    resultsDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');
    successDiv.classList.add('hidden');

    const inputText = inputTextarea.value.trim();
    if (!inputText) {
        showMdTableError('Please enter a markdown table to format');
        return;
    }

    fetch("/api/formatter/md-table", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ table: inputText })
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || "Failed to format markdown table");
        }
        return response.json();
    })
    .then(data => {
        if (data.table) {
            displayMdTableResults(data.table);
            showMdTableSuccess();
        } else {
            showMdTableError("Invalid response format");
        }
    })
    .catch(error => {
        showMdTableError(error.message || "Network error occurred while formatting table");
    });
}

function displayMdTableResults(formattedTable) {
    const outputTextarea = document.getElementById('md-table-output');

    // Set the formatted table text
    outputTextarea.value = formattedTable;

    // Show results
    document.getElementById('md-table-results').classList.remove('hidden');
}

function copyFormattedTable() {
    copyToClipboard('md-table-output');
}

function clearMdTableResults() {
    document.getElementById('md-table-input').value = '';
    document.getElementById('md-table-output').value = '';
    document.getElementById('md-table-results').classList.add('hidden');
    document.getElementById('md-table-error').classList.add('hidden');
    document.getElementById('md-table-success').classList.add('hidden');
}

function loadMdTableExample() {
    const exampleTable = `| Product | Category | Price | Stock | Rating |
| --- | --- | --- | --- | --- |
| Wireless Headphones | Electronics | $89.99 | 45 | 4.5 |
| Coffee Mug | Kitchen | $12.50 | 120 | 4.2 |
| Desk Lamp | Furniture | $34.99 | 23 | 4.7 |
| Notebook | Stationery | $8.95 | 200 | 4.3 |
| Smartphone Case | Electronics | $19.99 | 67 | 4.1 |`;

    document.getElementById('md-table-input').value = exampleTable;
}

function showMdTableError(message) {
    const errorDiv = document.getElementById('md-table-error');
    const errorMessageDiv = document.getElementById('md-table-error-message');

    if (errorDiv && errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

function showMdTableSuccess() {
    const successDiv = document.getElementById('md-table-success');
    if (successDiv) {
        successDiv.classList.remove('hidden');
    }
}
