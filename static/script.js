//TODO: split this file?

// mht functions
function fixMht() {
    const fileInput = document.getElementById("file-input");
    const outputTextArea = document.getElementById("output");
    const downloadBtn = document.getElementById("download-btn");
    const processBtn = document.getElementById("process-btn");

    if (fileInput.files.length === 0) {
        // TODO: create notification system
        alert("Please select an MHT file first");
        return;
    }

    // Disable process button during processing
    processBtn.disabled = true;
    processBtn.textContent = "Processing...";
    downloadBtn.disabled = true;

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

        // Re-enable process button
        processBtn.disabled = false;
        processBtn.textContent = "Process File";
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

// Global variables for image navigation in mht tool
let currentImageIndex = 0;
let allImages = [];

function keyListener(e) {
    if (e.key === "Escape" || e.key === "Esc") {
        closeFullImage();
    } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateImage(-1);
    } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateImage(1);
    }
}

function navigateImage(direction) {
    if (allImages.length === 0) return;

    // Calculate new index with wrapping
    const newIndex = (currentImageIndex + direction + allImages.length) % allImages.length;
    currentImageIndex = newIndex;

    // Update the image and counter
    updateFullImage();
}

function updateFullImage() {
    const img = document.querySelector("#image-overlay img");
    const imageCounter = document.getElementById("image-counter");

    if (img && allImages[currentImageIndex]) {
        img.src = allImages[currentImageIndex].dataUrl;
        img.alt = `Full size image ${currentImageIndex + 1}`;

        if (imageCounter) {
            imageCounter.textContent = `${currentImageIndex + 1} of ${allImages.length}`;
        }
    }
}

function viewFullImage(dataUrl, imageIndex) {
    // Store current image index (convert from 1-based to 0-based)
    currentImageIndex = imageIndex - 1;

    // Build array of all images from the current MHT extraction
    allImages = [];
    const imageElements = document.querySelectorAll("#mht-images-container img");
    imageElements.forEach((img, index) => {
        allImages.push({
            dataUrl: img.src,
            index: index
        });
    });

    // Create a modal-like overlay to view the full-size image
    const overlay = document.createElement("div");
    overlay.setAttribute("id", "image-overlay");
    overlay.className = "fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4";

    document.addEventListener("keydown", keyListener);
    overlay.innerHTML = `
        <div class="relative max-w-full max-h-full">
            <img src="${dataUrl}"
                alt="Full size image ${imageIndex}"
                class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />

            <!-- Navigation arrows -->
            ${allImages.length > 1 ? `
                <button onclick="navigateImage(-1)"
                    class="cursor-pointer absolute left-4 top-1/2 transform -translate-y-1/2 bg-stone-800 hover:bg-stone-700
                        text-white rounded-full p-3 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
                    </svg>
                </button>
                <button onclick="navigateImage(1)"
                    class="cursor-pointer absolute right-4 top-1/2 transform -translate-y-1/2 bg-stone-800 hover:bg-stone-700
                        text-white rounded-full p-3 transition-colors">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                </button>

                <!-- Image counter -->
                <div class="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
                    <span id="image-counter">${imageIndex} of ${allImages.length}</span>
                </div>
            ` : ''}

            <!-- Close button -->
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
    document.removeEventListener("keydown", keyListener);

    // Reset navigation state
    currentImageIndex = 0;
    allImages = [];
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

    fetch("/api/generator/hash", {
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

// GUID functions
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

// CRON functions
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

// JSON/YAML Converter functions
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