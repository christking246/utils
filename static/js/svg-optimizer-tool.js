let originalSvgContent = '';
let optimizedSvgContent = '';

/**
 * Optimize the SVG using the backend API
 */
async function optimizeSvg() {
    const inputElement = document.getElementById('svg-input');
    const outputElement = document.getElementById('svg-output');
    const loadingElement = document.getElementById('svg-loading');

    const svgContent = inputElement.value.trim();

    if (!svgContent) {
        showNotification('Please enter SVG content to optimize', 'error');
        return;
    }

    // Basic SVG validation
    if (!svgContent.includes('<svg') || !svgContent.includes('</svg>')) {
        showNotification('Please enter valid SVG content', 'error');
        return;
    }

    originalSvgContent = svgContent;

    try {
        loadingElement.classList.remove('hidden');

        const response = await fetch('/api/svg/optimize', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ svgString: svgContent })
        });

        const data = await response.json();

        if (response.ok) {
            optimizedSvgContent = data.optimizedSvg;
            outputElement.value = optimizedSvgContent;

            // Update stats
            updateOptimizationStats(originalSvgContent, optimizedSvgContent, data.removedCharCount);

            // Enable buttons
            enableOutputButtons();

            // Update previews
            updateSvgPreviews();

            showNotification(`SVG optimized successfully! Saved ${data.removedCharCount} characters`, 'success');
        } else {
            showNotification(data.msg || 'Failed to optimize SVG', 'error');
        }
    } catch (error) {
        console.error('Error optimizing SVG:', error);
        showNotification('An error occurred while optimizing the SVG', 'error');
    } finally {
        loadingElement.classList.add('hidden');
    }
}

/**
 * Update the optimization statistics
 */
function updateOptimizationStats(original, optimized, savedChars) {
    const statsElement = document.getElementById('optimization-stats');
    const originalSizeEl = document.getElementById('original-size');
    const optimizedSizeEl = document.getElementById('optimized-size');
    const savedSizeEl = document.getElementById('saved-size');
    const compressionRatioEl = document.getElementById('compression-ratio');

    const originalSize = original.length;
    const optimizedSize = optimized.length;
    const compressionRatio = ((savedChars / originalSize) * 100).toFixed(2);

    originalSizeEl.textContent = formatBytes(originalSize);
    optimizedSizeEl.textContent = formatBytes(optimizedSize);
    savedSizeEl.textContent = `${formatBytes(savedChars)} (${savedChars} chars)`;
    compressionRatioEl.textContent = `${compressionRatio}%`;

    statsElement.classList.remove('hidden');
}

/**
 * Update SVG previews
 */
function updateSvgPreviews() {
    const originalPreview = document.getElementById('original-svg-preview');
    const optimizedPreview = document.getElementById('optimized-svg-preview');

    // Clear previous content
    originalPreview.innerHTML = '';
    optimizedPreview.innerHTML = '';

    try {
        // Create preview for original SVG
        if (originalSvgContent) {
            originalPreview.innerHTML = originalSvgContent;
            const originalSvg = originalPreview.querySelector('svg');
            if (originalSvg) {
                originalSvg.style.width = '100%';
                originalSvg.style.height = '100%';
                originalSvg.style.maxWidth = '100%';
                originalSvg.style.maxHeight = '100%';
            }
        }

        // Create preview for optimized SVG
        if (optimizedSvgContent) {
            optimizedPreview.innerHTML = optimizedSvgContent;
            const optimizedSvg = optimizedPreview.querySelector('svg');
            if (optimizedSvg) {
                optimizedSvg.style.width = '100%';
                optimizedSvg.style.height = '100%';
                optimizedSvg.style.maxWidth = '100%';
                optimizedSvg.style.maxHeight = '100%';
            }
        }
    } catch (error) {
        console.error('Error updating SVG previews:', error);
        originalPreview.innerHTML = '<span class="text-red-400 text-sm">Error rendering SVG preview</span>';
        optimizedPreview.innerHTML = '<span class="text-red-400 text-sm">Error rendering SVG preview</span>';
    }
}

/**
 * Handle file upload
 */
function handleSvgFileUpload(input) {
    const file = input.files[0];
    if (!file) return;

    if (!file.type.includes('svg') && !file.name.toLowerCase().endsWith('.svg')) {
        showNotification('Please select a valid SVG file', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const svgContent = e.target.result;
        document.getElementById('svg-input').value = svgContent;
        showNotification('SVG file loaded successfully', 'success');
    };

    reader.onerror = function() {
        showNotification('Error reading file', 'error');
    };

    reader.readAsText(file);
}

/**
 * Copy optimized SVG to clipboard
 */
function copySvgToClipboard() {
    const outputElement = document.getElementById('svg-output');

    if (!outputElement.value) {
        showNotification('No optimized SVG to copy', 'error');
        return;
    }

    copyToClipboard('svg-output');
}

/**
 * Download optimized SVG as file
 */
function downloadOptimizedSvg() {
    const outputElement = document.getElementById('svg-output');

    if (!outputElement.value) {
        showNotification('No optimized SVG to download', 'error');
        return;
    }

    const blob = new Blob([outputElement.value], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'optimized.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showNotification('SVG file downloaded!', 'success');
}

/**
 * Clear all inputs and outputs
 */
function clearSvgInputs() {
    document.getElementById('svg-input').value = '';
    document.getElementById('svg-output').value = '';
    document.getElementById('svg-file-input').value = '';
    document.getElementById('optimization-stats').classList.add('hidden');
    document.getElementById('original-svg-preview').innerHTML = '<span class="text-stone-400 text-sm">Original SVG preview will appear here</span>';
    document.getElementById('optimized-svg-preview').innerHTML = '<span class="text-stone-400 text-sm">Optimized SVG preview will appear here</span>';

    originalSvgContent = '';
    optimizedSvgContent = '';

    disableOutputButtons();
    showNotification('Inputs cleared', 'success');
}

/**
 * Enable output buttons when optimization is complete
 */
function enableOutputButtons() {
    document.getElementById('copy-svg-btn').disabled = false;
    document.getElementById('download-svg-btn').disabled = false;
}

/**
 * Disable output buttons when no optimized content
 */
function disableOutputButtons() {
    document.getElementById('copy-svg-btn').disabled = true;
    document.getElementById('download-svg-btn').disabled = true;
}

/**
 * Format bytes to human readable format
 */
function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

/**
 * Add drag and drop functionality
 */
document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.querySelector('#svg-optimizer-tool .border-dashed');

    if (dropZone) {
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropZone.addEventListener(eventName, highlight, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropZone.addEventListener(eventName, unhighlight, false);
        });

        dropZone.addEventListener('drop', handleDrop, false);
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function highlight() {
        dropZone.classList.add('border-sky-500', 'bg-sky-500/10');
    }

    function unhighlight() {
        dropZone.classList.remove('border-sky-500', 'bg-sky-500/10');
    }

    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            const fileInput = document.getElementById('svg-file-input');
            fileInput.files = files;
            handleSvgFileUpload(fileInput);
        }
    }
});
