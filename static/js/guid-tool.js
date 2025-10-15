// GUID Generator Tool Functions

function generateGuids() {
    const countInput = document.getElementById('guid-count');
    const resultsDiv = document.getElementById('guid-results');
    const errorDiv = document.getElementById('guid-error');

    // Hide previous results and errors
    resultsDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    const count = parseInt(countInput.value);
    if (!count || count < 1 || count > 100) {
        showGuidError('Please enter a valid number between 1 and 100');
        return;
    }

    fetch("/api/generator/guid/" + count, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    })
    .then(response => response.json())
    .then(data => {
        if (data.guids) {
            displayGuidResults(data.guids);
        } else {
            showGuidError(data.msg || "Failed to generate GUIDs");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        showGuidError("Network error occurred while generating GUIDs");
    });
}

function displayGuidResults(guids) {
    const guidList = document.getElementById('guid-list');
    const guidCountResult = document.getElementById('guid-count-result');

    // Clear previous results
    guidList.innerHTML = '';

    // Update count
    guidCountResult.textContent = guids.length;

    // Create GUID elements
    guids.forEach((guid, index) => {
        const guidWrapper = document.createElement('div');
        guidWrapper.className = "flex items-center justify-between p-3 border border-stone-600 bg-stone-800 rounded-lg " +
            "hover:bg-stone-750 transition-colors";

        guidWrapper.innerHTML = `
            <div class="flex-1">
                <div class="text-stone-200 font-mono text-sm break-all">${guid}</div>
                <div class="text-xs text-stone-400 mt-1">GUID ${index + 1}</div>
            </div>
            <button onclick="copyGuid('${guid}')" class="ml-3 px-3 py-1 text-xs text-sky-400 hover:text-sky-300
                transition-colors cursor-pointer">
                Copy
            </button>
        `;

        guidList.appendChild(guidWrapper);
    });

    // Store guids for copy all
    window.currentGuids = guids;

    // Show results
    document.getElementById('guid-results').classList.remove('hidden');
}

function copyGuid(guid) {
    navigator.clipboard.writeText(guid).then(() => {
        console.log("GUID copied to clipboard");
    }).catch(err => {
        console.error("Failed to copy to clipboard:", err);
    });
}

function copyAllGuids() {
    // TODO: find a solution without using global state
    if (!window.currentGuids || window.currentGuids.length === 0) {
        showGuidError("No GUIDs to copy");
        return;
    }

    const allGuids = window.currentGuids.join('\n');
    navigator.clipboard.writeText(allGuids).then(() => {
        console.log("All GUIDs copied to clipboard");
    }).catch(err => {
        console.error("Failed to copy to clipboard:", err);
    });
}

function clearGuidResults() {
    document.getElementById('guid-count').value = '5';
    document.getElementById('guid-results').classList.add('hidden');
    document.getElementById('guid-error').classList.add('hidden');
    window.currentGuids = [];
}

function showGuidError(message) {
    const errorDiv = document.getElementById('guid-error');
    const errorMessageDiv = document.getElementById('guid-error-message');

    if (errorDiv && errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}