// Image Compare Tool Functions

// Global state
const imageData = {
    img1: null,
    img2: null
};

// Initialize event listeners when DOM is loaded
document.addEventListener('DOMContentLoaded', () => initializeImageCompare());

function initializeImageCompare() {
    // Set up drag and drop for both images
    setupDropZone(1);
    setupDropZone(2);

    // Set up threshold slider
    const thresholdSlider = document.getElementById('threshold-slider');
    const thresholdValue = document.getElementById('threshold-value');

    if (thresholdSlider && thresholdValue) {
        thresholdSlider.addEventListener('input', function() {
            thresholdValue.textContent = this.value;
        });

        thresholdValue.textContent = thresholdSlider.value;
    }

    // Initialize UI state
    updateCompareButton();
    hideError();
    hideResults();
}

function setupDropZone(imageNumber) {
    const dropZone = document.getElementById(`drop-zone-${imageNumber}`);
    const fileInput = document.getElementById(`file-input-${imageNumber}`);

    if (!dropZone || !fileInput) return;

    // Click to browse files
    dropZone.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImgUpload(file, imageNumber);
        }
    });

    // Drag and drop events
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('border-sky-400');
    });

    dropZone.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-sky-400');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('border-sky-400');

        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImgUpload(file, imageNumber);
        } else {
            showError('Please upload a valid image file.');
        }
    });
}

async function handleImgUpload(file, imageNumber) {
    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
        showError('Image size must be less than 10MB');
        return;
    }

    try {
        imageData[`img${imageNumber}`] = await fileToBase64(file);

        // Update UI
        showImagePreview(file, imageData[`img${imageNumber}`], imageNumber);
        updateCompareButton();
        hideError();
        hideResults();

    } catch (error) {
        showError('Failed to process image: ' + error.message);
    }
}

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

function showImagePreview(file, base64, imageNumber) {
    const uploadContent = document.getElementById(`upload-content-${imageNumber}`);
    const imagePreview = document.getElementById(`image-preview-${imageNumber}`);
    const img = imagePreview.querySelector('img');
    const info = document.getElementById(`image-${imageNumber}-info`);

    // Hide upload content and show preview
    uploadContent.classList.add('hidden');
    imagePreview.classList.remove('hidden');

    // Set image source
    img.src = base64;

    // Set image info
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    info.textContent = `${file.name} (${sizeInMB}MB)`;
}

function clearImage(imageNumber) {
    imageData[`img${imageNumber}`] = null;

    const uploadContent = document.getElementById(`upload-content-${imageNumber}`);
    const imagePreview = document.getElementById(`image-preview-${imageNumber}`);
    const fileInput = document.getElementById(`file-input-${imageNumber}`);

    // Reset UI
    uploadContent.classList.remove('hidden');
    imagePreview.classList.add('hidden');
    fileInput.value = '';

    updateCompareButton();
    hideResults();
}

function updateCompareButton() {
    const compareBtn = document.getElementById('compare-btn');
    const compareBtnText = document.getElementById('compare-btn-text');

    if (imageData.img1 && imageData.img2) {
        compareBtn.disabled = false;
        compareBtnText.textContent = 'Compare Images';
    } else {
        compareBtn.disabled = true;
        if (!imageData.img1 && !imageData.img2) {
            compareBtnText.textContent = 'Upload Both Images to Compare';
        } else if (!imageData.img1) {
            compareBtnText.textContent = 'Upload First Image';
        } else {
            compareBtnText.textContent = 'Upload Second Image';
        }
    }
}

async function compareImages() {
    if (!imageData.img1 || !imageData.img2) {
        showError('Please upload both images first.');
        return;
    }

    const compareBtn = document.getElementById('compare-btn');
    const compareBtnText = document.getElementById('compare-btn-text');

    // Show loading state
    compareBtn.disabled = true;
    compareBtnText.textContent = 'Comparing...';
    hideError();
    hideResults();

    try {
        const threshold = document.getElementById('threshold-slider').value;

        // Remove MIME prefix from base64 data before sending to API
        const img1Base64 = imageData.img1.split(',')[1];
        const img2Base64 = imageData.img2.split(',')[1];

        const response = await fetch('/api/image/diff', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                img1: img1Base64,
                img2: img2Base64,
                threshold: parseFloat(threshold)
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.msg || `HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        showResults(result);

    } catch (error) {
        showError('Comparison failed: ' + error.message);
    } finally {
        // Reset button state
        compareBtn.disabled = false;
        compareBtnText.textContent = 'Compare Images';
    }
}

function showResults(result) {
    const resultsSection = document.getElementById('comparison-results');
    const diffPercent = document.getElementById('difference-percent');
    const similarityPercent = document.getElementById('similarity-percent');
    const thresholdUsed = document.getElementById('threshold-used');
    const diffImage = document.getElementById('diff-image');

    // Calculate similarity percentage
    const similarity = ((1 - result.percent) * 100).toFixed(3);
    const difference = (result.percent * 100).toFixed(3);

    // Update results
    diffPercent.textContent = `${difference}%`;
    similarityPercent.textContent = `${similarity}%`;
    thresholdUsed.textContent = result.threshold.toString();
    diffImage.src = result.imageDiff;

    // Show results section
    resultsSection.classList.remove('hidden');
}

function hideResults() {
    const resultsSection = document.getElementById('comparison-results');
    resultsSection.classList.add('hidden');
}

function showError(message) {
    const errorDiv = document.getElementById('compare-error');
    const errorMessage = document.getElementById('compare-error-message');

    errorMessage.textContent = message;
    errorDiv.classList.remove('hidden');
}

function hideError() {
    const errorDiv = document.getElementById('compare-error');
    errorDiv.classList.add('hidden');
}

function downloadDiffImage() {
    const diffImage = document.getElementById('diff-image');
    if (!diffImage.src) return;

    const link = document.createElement('a');
    link.href = diffImage.src;
    link.download = 'image-comparison-diff.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function copyDiffToClipboard() {
    try {
        const diffImage = document.getElementById('diff-image');
        if (!diffImage.src) return;

        // Convert base64 to blob
        const response = await fetch(diffImage.src);
        const blob = await response.blob();

        // Copy to clipboard
        await navigator.clipboard.write([
            new ClipboardItem({ [blob.type]: blob })
        ]);

        // Show temporary success message (you could improve this with a toast notification)
        const originalText = event.target.textContent;
        event.target.textContent = 'Copied!';
        setTimeout(() => {
            event.target.textContent = originalText;
        }, 2000);

    } catch (error) {
        console.error('Failed to copy image to clipboard:', error);
        showError('Failed to copy image to clipboard');
    }
}

function resetComparison() {
    // Clear image data
    imageData.img1 = null;
    imageData.img2 = null;

    // Reset UI
    clearImage(1);
    clearImage(2);

    // Reset threshold
    const thresholdSlider = document.getElementById('threshold-slider');
    const thresholdValue = document.getElementById('threshold-value');
    thresholdSlider.value = 0.25;
    thresholdValue.textContent = '0.25';

    hideResults();
    hideError();
}