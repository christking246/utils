// JWT Decoder Tool Functions

function decodeJwt() {
    const input = document.getElementById("jwt-input").value.trim();
    const resultsDiv = document.getElementById("jwt-results");
    const errorDiv = document.getElementById("jwt-error");

    // Hide previous results and errors
    resultsDiv.classList.add("hidden");
    errorDiv.classList.add("hidden");

    if (!input) {
        showJwtError("Please enter a JWT token");
        return;
    }

    fetch("/api/jwt/decode", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: input })
    })
    .then(async response => {
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || "Failed to decode JWT token");
        }
        return response.json();
    })
    .then(data => {
        displayJwtResults(data.header, data.payload);
    })
    .catch(error => {
        console.error("Error:", error);
        showJwtError(error.message || "Network error occurred while decoding JWT");
    });
}

function displayJwtResults(header, payload) {
    // Display header and payload as formatted JSON
    document.getElementById("jwt-header").value = JSON.stringify(header, null, 2);
    document.getElementById("jwt-payload").value = JSON.stringify(payload, null, 2);

    // Extract and display key information
    document.getElementById("jwt-algorithm").textContent = header.alg || '-';

    // Reset and handle timestamps
    const issuedElement = document.getElementById("jwt-issued");
    const expiresElement = document.getElementById("jwt-expires");

    // Reset expires element classes
    expiresElement.classList.remove("text-red-400", "text-green-400");
    expiresElement.classList.add("text-stone-200");

    if (payload.iat) {
        const issuedDate = new Date(payload.iat * 1000);
        issuedElement.textContent = issuedDate.toLocaleString();
    } else {
        issuedElement.textContent = '-';
    }

    if (payload.exp) {
        const expiryDate = new Date(payload.exp * 1000);
        expiresElement.textContent = expiryDate.toLocaleString();

        // Add expiry status indicator
        const now = new Date();
        if (expiryDate < now) {
            expiresElement.classList.remove("text-stone-200", "text-green-400");
            expiresElement.classList.add("text-red-400");
            expiresElement.textContent += " (Expired)";
        } else {
            expiresElement.classList.remove("text-stone-200", "text-red-400");
            expiresElement.classList.add("text-green-400");
        }
    } else {
        expiresElement.textContent = '-';
    }

    // Show results
    document.getElementById("jwt-results").classList.remove("hidden");
}

function showJwtError(message) {
    const errorDiv = document.getElementById("jwt-error");
    const errorMessageDiv = document.getElementById("jwt-error-message");

    if (errorDiv && errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorDiv.classList.remove("hidden");
    }
}