// CRON Expression Parser Tool Functions

function parseCron() {
    const cronInput = document.getElementById('cron-input');
    const resultsDiv = document.getElementById('cron-results');
    const errorDiv = document.getElementById('cron-error');

    // Hide previous results and errors
    resultsDiv.classList.add('hidden');
    errorDiv.classList.add('hidden');

    const expression = cronInput.value.trim();
    if (!expression) {
        showCronError('Please enter a CRON expression');
        return;
    }

    fetch("/api/cron/describe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ expression: expression })
    })
    .then(response => response.json())
    .then(data => {
        if (data.description) {
            displayCronResults(expression, data.description);
        } else {
            showCronError(data.msg || "Failed to parse CRON expression");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        showCronError("Network error occurred while parsing CRON expression");
    });
}

function displayCronResults(expression, description) {
    // Display the human-readable description
    document.getElementById('cron-description').textContent = description;

    // Break down the CRON expression into parts
    const parts = expression.split(' ');
    const second = parts.length === 6 ? parts.shift() : null;
    if (parts.length === 5) {
        document.getElementById('cron-minute').textContent = parts[0] || '*';
        document.getElementById('cron-hour').textContent = parts[1] || '*';
        document.getElementById('cron-day').textContent = parts[2] || '*';
        document.getElementById('cron-month').textContent = parts[3] || '*';
        document.getElementById('cron-dow').textContent = parts[4] || '*';
    }
    document.getElementById('cron-second').textContent = second || '-';

    // Show results
    document.getElementById('cron-results').classList.remove('hidden');
}

function setCronExample(example) {
    document.getElementById('cron-input').value = example;
    parseCron();
}

function clearCronResults() {
    document.getElementById('cron-input').value = '';
    document.getElementById('cron-results').classList.add('hidden');
    document.getElementById('cron-error').classList.add('hidden');
}

function showCronError(message) {
    const errorDiv = document.getElementById('cron-error');
    const errorMessageDiv = document.getElementById('cron-error-message');

    if (errorDiv && errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}