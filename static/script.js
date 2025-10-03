function fixMht() {
    const fileInput = document.getElementById("file-input");
    const outputTextArea = document.getElementById("output");
    const downloadBtn = document.getElementById("download-btn");

    if (fileInput.files.length === 0) {
        console.log("No file selected");
        return;
    }

    console.log(fileInput.files[0].slice(0, -3));

    // reading this as text is probably not the best idea for large files
    // but it's good enough for now
    const reader = new FileReader();
    reader.onload = async function(event) {
        const contents = event.target.result;
        const response = await fetch("/api/mht", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ contents })
        });
        const data = await response.json();
        if (response.ok) {
            outputTextArea.textContent = data.result;
            downloadBtn.disabled = false;
            downloadBtn.onclick = function() {
                const blob = new Blob([data.result], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = fileInput.files[0].name.slice(0, -4) + "_fixed.html";
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }
        } else {
            // TODO: notification system?
            outputTextArea.textContent = data.msg || "An error occurred";
        }
    }
    reader.readAsText(fileInput.files[0]);
}

function generateHashes() {
    const input = document.getElementById("hash-input").value;
    if (!input.trim()) {
        // TODO: create notification system
        alert("Please enter some text to generate hashes");
        return;
    }

    fetch("/api/hash", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input })
    })
    .then(response => response.json())
    .then(data => {
        if (data.hashes) {
            document.getElementById("md5-result").value = data.hashes.MD5;
            document.getElementById("sha1-result").value = data.hashes.SHA1;
            document.getElementById("sha256-result").value = data.hashes.SHA256;
            document.getElementById("sha512-result").value = data.hashes.SHA512;
            document.getElementById("hash-results").classList.remove("hidden");
        }
    })
    .catch(error => {
        console.error("Error:", error);
        // TODO: create notification system
        alert("Error generating hashes");
    });
}

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
    .then(response => {
        if (!response.ok) {
            return response.json().then(errorData => {
                throw new Error(errorData.msg || "Failed to decode JWT token");
            });
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