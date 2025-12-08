// Time Converter Tool Functions

function setCurrentTime() {
    const timeInput = document.getElementById("time-input");
    const now = Date.now();
    timeInput.value = now.toString();
}

function clearTimeInput() {
    const timeInput = document.getElementById("time-input");
    timeInput.value = "";

    // Hide results and error
    document.getElementById("time-results").classList.add("hidden");
    document.getElementById("time-error").classList.add("hidden");
}

function convertTime() {
    const input = document.getElementById("time-input").value.trim();
    const resultsDiv = document.getElementById("time-results");
    const errorDiv = document.getElementById("time-error");

    // Hide previous results and errors
    resultsDiv.classList.add("hidden");
    errorDiv.classList.add("hidden");

    if (!input) {
        showTimeError("Please enter a time value");
        return;
    }

    fetch("/api/time/convert", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ time: input })
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || "Failed to convert time");
        }
        return response.json();
    })
    .then(data => {
        displayTimeResults(data);
    })
    .catch(error => {
        showTimeError(error.message || "Network error occurred while converting time");
    });
}

// TODO: unit test this?
function getRelativeTime(timestamp) {
    const now = Date.now();
    const diffMs = now - timestamp;
    const absDiff = Math.abs(diffMs);

    // Define time units in milliseconds
    const units = [
        { name: 'year', ms: 365.25 * 24 * 60 * 60 * 1000 },
        { name: 'month', ms: 30.44 * 24 * 60 * 60 * 1000 },
        { name: 'week', ms: 7 * 24 * 60 * 60 * 1000 },
        { name: 'day', ms: 24 * 60 * 60 * 1000 },
        { name: 'hour', ms: 60 * 60 * 1000 },
        { name: 'minute', ms: 60 * 1000 },
        { name: 'second', ms: 1000 }
    ];

    // Find the appropriate unit
    for (const unit of units) {
        const value = Math.floor(absDiff / unit.ms);
        if (value >= 1) {
            const plural = value > 1 ? 's' : '';
            const preposition = diffMs < 0 ? 'in ' : '';
            const suffix = diffMs < 0 ? '' : ' ago';
            return `${preposition}${value} ${unit.name}${plural}${suffix}`;
        }
    }

    return 'just now';
}

// TODO: unit test this?
function getDaysSince(timestamp) {
    // Use local dates to respect user's timezone
    const now = new Date();
    const inputDate = new Date(timestamp);

    // Get the start of today in local time
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Get the start of the input date in local time
    const inputDateStart = new Date(inputDate.getFullYear(), inputDate.getMonth(), inputDate.getDate());

    // Calculate difference in milliseconds between the start of both dates
    const diffMs = todayStart.getTime() - inputDateStart.getTime();
    const daysDiff = Math.round(diffMs / (24 * 60 * 60 * 1000));

    if (daysDiff < 0) {
        // Future date
        return `${Math.abs(daysDiff)} days in the future`;
    } else if (daysDiff === 0) {
        return 'Today';
    } else if (daysDiff === 1) {
        return '1 day ago';
    } else {
        return `${daysDiff} days ago`;
    }
}

function displayTimeResults(data) {
    // Display the converted time formats
    document.getElementById("timestamp-result").textContent = data.timestamp;
    document.getElementById("iso-result").textContent = data.iso;
    document.getElementById("utc-result").textContent = data.utc;

    // Create a local time representation
    const localTimeParts = new Date(data.timestamp).toLocaleString().split("/");

    // Swap month and day to be have sane logical representation DD/MM/YYYY
    localTimeParts.unshift(localTimeParts.splice(1, 1)[0]);
    const localTime = localTimeParts.join("/");
    document.getElementById("local-result").textContent = localTime;

    // Calculate and display relative time
    // should we keep updating this?
    const relativeTime = getRelativeTime(data.timestamp);
    document.getElementById("relative-result").textContent = relativeTime;

    // Calculate and display days since
    const daysSince = getDaysSince(data.timestamp);
    document.getElementById("days-since-result").textContent = daysSince;

    // Show results
    document.getElementById("time-results").classList.remove("hidden");
}

function showTimeError(message) {
    const errorDiv = document.getElementById("time-error");
    const errorMessageDiv = document.getElementById("time-error-message");

    if (errorDiv && errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorDiv.classList.remove("hidden");
    }
}