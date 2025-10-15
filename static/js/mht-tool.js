// MHT Tool Functions

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