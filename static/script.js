//TODO: split this file?

// mht functions
function fixMht() {
    const fileInput = document.getElementById("file-input");
    const outputTextArea = document.getElementById("output");
    const downloadBtn = document.getElementById("download-btn");

    if (fileInput.files.length === 0) {
        console.log("No file selected");
        return;
    }

    // Clear previous results
    outputTextArea.textContent = "";
    document.getElementById("mht-images-section").classList.add("hidden");

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

            // Display extracted images if any
            displayMhtImages(data.base64Images || []);

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
            // Hide images section on error
            document.getElementById("mht-images-section").classList.add("hidden");
        }
    }
    reader.readAsText(fileInput.files[0]);
}

function displayMhtImages(base64Images) {
    const imagesSection = document.getElementById("mht-images-section");
    const imagesContainer = document.getElementById("mht-images-container");
    const imageCount = document.getElementById("image-count");

    // Clear previous images
    imagesContainer.innerHTML = "";

    if (!base64Images || base64Images.length === 0) {
        imagesSection.classList.add("hidden");
        return;
    }

    // Update image count
    imageCount.textContent = base64Images.length;

    // Create image elements for each base64 image
    base64Images.forEach((imageData, index) => {
        const imageWrapper = document.createElement("div");
        imageWrapper.className = "relative group";

        // Determine image type from base64 signature
        let mimeType = "image/jpeg"; // default
        const base64Clean = imageData.clean || imageData;

        if (base64Clean.startsWith("/9j/")) {
            mimeType = "image/jpeg";
        } else if (base64Clean.startsWith("iVBORw0KGgo")) {
            mimeType = "image/png";
        } else if (base64Clean.startsWith("R0lGOD")) {
            mimeType = "image/gif";
        } else if (base64Clean.startsWith("UklGR")) {
            mimeType = "image/webp";
        }

        const dataUrl = `data:${mimeType};base64,${base64Clean}`;

        imageWrapper.innerHTML = `
            <div class="border border-stone-600 rounded-lg p-2 bg-stone-800 hover:bg-stone-750 transition-colors">
                <img src="${dataUrl}"
                    alt="Extracted image ${index + 1}"
                    class="w-full h-32 object-contain rounded cursor-pointer hover:opacity-80 transition-opacity"
                    onclick="viewFullImage('${dataUrl}', ${index + 1})" />
                <div class="mt-2 text-xs text-stone-400 text-center">
                    <span>Image ${index + 1}</span>
                    <div class="flex justify-center gap-2 mt-1">
                        <button onclick="downloadImage('${dataUrl}', ${index + 1})"
                            class="cursor-pointer text-sky-400 hover:text-sky-300 transition-colors">
                            Download
                        </button>
                        <span class="text-stone-600">|</span>
                        <button onclick="copyImageBase64('${base64Clean}')"
                            class="cursor-pointer text-sky-400 hover:text-sky-300 transition-colors">
                            Copy Base64
                        </button>
                    </div>
                </div>
            </div>
        `;

        imagesContainer.appendChild(imageWrapper);
    });

    // Show the images section
    imagesSection.classList.remove("hidden");
}

function escListener (e) {
    if (e.key === "Escape" || e.key === "Esc") {
        closeFullImage();
    }
}

function viewFullImage(dataUrl, imageIndex) {
    // Create a modal-like overlay to view the full-size image
    const overlay = document.createElement("div");
    overlay.setAttribute("id", "image-overlay");
    overlay.className = "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4";

    document.addEventListener("keydown", escListener);
    overlay.innerHTML = `
        <div class="relative max-w-full max-h-full">
            <img src="${dataUrl}"
                alt="Full size image ${imageIndex}"
                class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            <button onclick="closeFullImage()"
                class="cursor-pointer absolute top-4 right-4 bg-red-800 hover:bg-red-700 text-white rounded-full p-2 transition-colors">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
            </button>
        </div>
    `;

    document.body.appendChild(overlay);
}

function closeFullImage() {
    const overlay = document.getElementById("image-overlay");
    if (overlay) {
        document.body.removeChild(overlay);
    }
    document.removeEventListener("keydown", escListener);
}

// TODO: is thi becoming a common util function?
function downloadImage(dataUrl, imageIndex) {
    // TODO: build from the original mht filename?
    const link = document.createElement("a");
    link.href = dataUrl;
    link.download = `mht-extracted-image-${imageIndex}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function copyImageBase64(base64Data) {
    navigator.clipboard.writeText(base64Data).then(() => {
        // Could add a toast notification here in the future
        console.log("Base64 data copied to clipboard");
    }).catch(err => {
        console.error("Failed to copy to clipboard:", err);
    });
}

// hash functions
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

// jwt functions
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

// time functions
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

function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    const text = element.textContent || element.value;

    navigator.clipboard.writeText(text).then(() => {
        // Could add a toast notification here in the future
    }).catch(err => {
        console.error("Failed to copy to clipboard:", err);
    });
}

// Base64 functions
function switchBase64Tab(tab) {
    const textTab = document.getElementById('text-tab');
    const imageTab = document.getElementById('image-tab');
    const textContent = document.getElementById('text-base64');
    const imageContent = document.getElementById('image-base64');

    // Reset tab styles
    textTab.classList.remove('text-sky-400', 'border-sky-500');
    textTab.classList.add('text-stone-400', 'border-transparent', 'hover:text-stone-300');
    imageTab.classList.remove('text-sky-400', 'border-sky-500');
    imageTab.classList.add('text-stone-400', 'border-transparent', 'hover:text-stone-300');

    // Hide all content
    textContent.classList.add('hidden');
    imageContent.classList.add('hidden');

    // Show selected tab
    if (tab === 'text') {
        textTab.classList.remove('text-stone-400', 'border-transparent', 'hover:text-stone-300');
        textTab.classList.add('text-sky-400', 'border-sky-500');
        textContent.classList.remove('hidden');
    } else {
        imageTab.classList.remove('text-stone-400', 'border-transparent', 'hover:text-stone-300');
        imageTab.classList.add('text-sky-400', 'border-sky-500');
        imageContent.classList.remove('hidden');
    }
}

function encodeText() {
    const textInput = document.getElementById('text-input');
    const base64Output = document.getElementById('base64-output');
    const errorDiv = document.getElementById('text-base64-error');

    // Hide previous errors
    errorDiv.classList.add('hidden');

    const inputText = textInput.value;
    if (!inputText.trim()) {
        showTextBase64Error('Please enter some text to encode');
        return;
    }

    try {
        // Encode text to Base64
        // using encodeURIComponent and unescape to handle unicode properly (support for emojis etc)
        const encodedText = btoa(unescape(encodeURIComponent(inputText)));
        base64Output.value = encodedText;
    } catch (error) {
        showTextBase64Error('Failed to encode text: ' + error.message);
    }
}

function decodeText() {
    const textInput = document.getElementById('text-input');
    const base64Output = document.getElementById('base64-output');
    const errorDiv = document.getElementById('text-base64-error');

    // Hide previous errors
    errorDiv.classList.add('hidden');

    const inputText = textInput.value.trim();
    if (!inputText) {
        showTextBase64Error('Please enter Base64 text to decode');
        return;
    }

    try {
        // Decode Base64 to text
        const decodedText = decodeURIComponent(escape(atob(inputText)));
        base64Output.value = decodedText;
    } catch (error) {
        showTextBase64Error('Invalid Base64 format or failed to decode');
    }
}

function clearTextBase64() {
    document.getElementById('text-input').value = '';
    document.getElementById('base64-output').value = '';
    document.getElementById('text-base64-error').classList.add('hidden');
}

function handleImageUpload() {
    const fileInput = document.getElementById('image-input');
    const previewDiv = document.getElementById('image-preview');
    const previewImg = document.getElementById('preview-img');
    const imageInfo = document.getElementById('image-info');
    const errorDiv = document.getElementById('image-base64-error');

    // Hide previous errors
    errorDiv.classList.add('hidden');

    if (fileInput.files.length === 0) {
        previewDiv.classList.add('hidden');
        return;
    }

    const file = fileInput.files[0];

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showImageBase64Error('Please select a valid image file');
        return;
    }

    // Display file info
    const fileSize = (file.size / 1024).toFixed(1);
    imageInfo.textContent = `${file.name} (${fileSize} KB)`;

    // Create file reader
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImg.src = e.target.result;
        previewDiv.classList.remove('hidden');
    };
    reader.onerror = function() {
        showImageBase64Error('Failed to read the selected file');
    };
    reader.readAsDataURL(file);
}

function encodeImage() {
    const fileInput = document.getElementById('image-input');
    const base64Input = document.getElementById('image-base64-input');
    const errorDiv = document.getElementById('image-base64-error');

    // Hide previous errors
    errorDiv.classList.add('hidden');

    if (fileInput.files.length === 0) {
        showImageBase64Error('Please select an image file first');
        return;
    }

    const file = fileInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        // Extract just the Base64 part (remove data:image/...;base64, prefix)
        const base64Data = e.target.result.split(',')[1];
        base64Input.value = base64Data;
    };

    reader.onerror = function() {
        showImageBase64Error('Failed to encode the selected image');
    };

    reader.readAsDataURL(file);
}

function decodeImageFromBase64() {
    const base64Input = document.getElementById('image-base64-input');
    const decodedImageDiv = document.getElementById('decoded-image-display');
    const decodedImg = document.getElementById('decoded-img');
    const errorDiv = document.getElementById('image-base64-error');

    // Hide previous errors
    errorDiv.classList.add('hidden');

    const base64Data = base64Input.value.trim();
    if (!base64Data) {
        showImageBase64Error('Please enter Base64 image data to decode');
        return;
    }

    try {
        // Clean the Base64 data (remove any data: prefix if present)
        let cleanBase64 = base64Data;
        if (base64Data.startsWith('data:')) {
            cleanBase64 = base64Data.split(',')[1];
        }

        // Validate Base64 format
        if (!/^[A-Za-z0-9+/]*={0,2}$/.test(cleanBase64)) {
            throw new Error('Invalid Base64 format');
        }

        // Try to determine image type from Base64 signature
        let mimeType = 'image/png'; // default
        if (cleanBase64.startsWith('/9j/')) {
            mimeType = 'image/jpeg';
        } else if (cleanBase64.startsWith('iVBORw0KGgo')) {
            mimeType = 'image/png';
        } else if (cleanBase64.startsWith('R0lGOD')) {
            mimeType = 'image/gif';
        } else if (cleanBase64.startsWith('UklGR')) {
            mimeType = 'image/webp';
        } else {
            mimeType = 'image/'; // i think the most renderers will be forgiving for this
        }

        // Create data URL and display image
        const dataUrl = `data:${mimeType};base64,${cleanBase64}`;
        decodedImg.src = dataUrl;
        decodedImg.onload = function() {
            decodedImageDiv.classList.remove('hidden');
        };
        decodedImg.onerror = function() {
            throw new Error('Invalid image data or corrupted Base64');
        };

    } catch (error) {
        showImageBase64Error('Failed to decode image: ' + error.message);
    }
}

function downloadDecodedImage() {
    const decodedImg = document.getElementById('decoded-img');

    if (!decodedImg.src) {
        showImageBase64Error('No decoded image available for download');
        return;
    }

    // Convert image to blob and download
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = decodedImg.naturalWidth;
    canvas.height = decodedImg.naturalHeight;

    ctx.drawImage(decodedImg, 0, 0);

    canvas.toBlob(function(blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'decoded-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    });
}

function clearImageBase64() {
    document.getElementById('image-input').value = '';
    document.getElementById('image-base64-input').value = '';
    document.getElementById('image-preview').classList.add('hidden');
    document.getElementById('decoded-image-display').classList.add('hidden');
    document.getElementById('image-base64-error').classList.add('hidden');
}

function showTextBase64Error(message) {
    const errorDiv = document.getElementById('text-base64-error');
    const errorMessageDiv = document.getElementById('text-base64-error-message');

    if (errorDiv && errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}

function showImageBase64Error(message) {
    const errorDiv = document.getElementById('image-base64-error');
    const errorMessageDiv = document.getElementById('image-base64-error-message');

    if (errorDiv && errorMessageDiv) {
        errorMessageDiv.textContent = message;
        errorDiv.classList.remove('hidden');
    }
}