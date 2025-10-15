// JSON/YAML Converter Tool Functions

async function convertJsonToYaml() {
    const jsonInput = document.getElementById('json-input').value.trim();

    if (!jsonInput) {
        showConversionError('Please enter JSON data to convert');
        return;
    }

    // Validate JSON first
    let jsonData;
    try {
        jsonData = JSON.parse(jsonInput);
    } catch (e) {
        showConversionError('Invalid JSON format: ' + e.message);
        return;
    }

    try {
        const response = await fetch('/api/serialize/json/yml', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ json: jsonData })
        });

        const data = await response.json();

        if (response.ok) {
            showConversionResult(data.ymlString);
            hideConversionError();
        } else {
            showConversionError(data.msg || 'Failed to convert JSON to YAML');
        }
    } catch (error) {
        showConversionError('Network error: ' + error.message);
    }
}

async function convertYamlToJson() {
    const yamlInput = document.getElementById('yaml-input').value.trim();

    if (!yamlInput) {
        showConversionError('Please enter YAML data to convert');
        return;
    }

    try {
        const response = await fetch('/api/serialize/yml/json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ yml: yamlInput })
        });

        const data = await response.json();

        if (response.ok) {
            // Pretty print the JSON
            const prettyJson = JSON.stringify(data.json, null, 4);
            showConversionResult(prettyJson);
            hideConversionError();
        } else {
            showConversionError(data.msg || 'Failed to convert YAML to JSON');
        }
    } catch (error) {
        showConversionError('Network error: ' + error.message);
    }
}

function showConversionResult(result) {
    const resultsDiv = document.getElementById('conversion-results');
    const outputTextarea = document.getElementById('conversion-output');

    if (resultsDiv && outputTextarea) {
        outputTextarea.value = result;
        resultsDiv.classList.remove('hidden');
    }
}

function showConversionError(message) {
    const errorDiv = document.getElementById('conversion-error');
    const errorMessageDiv = document.getElementById('conversion-error-message');

    if (errorDiv && errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorDiv.classList.remove('hidden');

        // Hide results on error
        const resultsDiv = document.getElementById('conversion-results');
        if (resultsDiv) {
            resultsDiv.classList.add('hidden');
        }
    }
}

function hideConversionError() {
    const errorDiv = document.getElementById('conversion-error');
    if (errorDiv) {
        errorDiv.classList.add('hidden');
    }
}

function copyConversionResult() {
    const outputTextarea = document.getElementById('conversion-output');
    if (outputTextarea && outputTextarea.value) {
        copyToClipboard('conversion-output');
    }
}

function formatJson() {
    const jsonInput = document.getElementById('json-input');
    const inputValue = jsonInput.value.trim();

    if (!inputValue) return;

    try {
        const parsed = JSON.parse(inputValue);
        const formatted = JSON.stringify(parsed, null, 4); // TODO: make the indentation configurable?
        jsonInput.value = formatted;
        hideConversionError();
    } catch (e) {
        showConversionError('Invalid JSON format: ' + e.message);
    }
}

function clearJsonInput() {
    document.getElementById('json-input').value = '';
    hideConversionError();
    const resultsDiv = document.getElementById('conversion-results');
    if (resultsDiv) {
        resultsDiv.classList.add('hidden');
    }
}

function clearYamlInput() {
    document.getElementById('yaml-input').value = '';
    hideConversionError();
    const resultsDiv = document.getElementById('conversion-results');
    if (resultsDiv) {
        resultsDiv.classList.add('hidden');
    }
}