// Base64 Encoder/Decoder Tool Functions

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