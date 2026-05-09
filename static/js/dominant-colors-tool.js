document.addEventListener('DOMContentLoaded', function () {
	const dropZone = document.getElementById('dominant-colors-drop-zone');
	const fileInput = document.getElementById('dominant-colors-file');
	const previewImg = document.getElementById('dominant-colors-preview-img');
	const imagePreview = document.getElementById('dominant-colors-image-preview');
	const uploadContent = document.getElementById('dominant-colors-upload-content');
	const extractBtn = document.getElementById('extract-dominant-colors-btn');
	let selectedFile = null;

	dropZone.addEventListener('dragover', (e) => {
		e.preventDefault();
		dropZone.classList.add('border-sky-500');
	});
	dropZone.addEventListener('dragleave', (e) => {
		e.preventDefault();
		dropZone.classList.remove('border-sky-500');
	});
	dropZone.addEventListener('drop', (e) => {
		e.preventDefault();
		dropZone.classList.remove('border-sky-500');
		if (e.dataTransfer.files && e.dataTransfer.files[0]) {
			handleDominantColorsFile(e.dataTransfer.files[0]);
		}
	});
	fileInput.addEventListener('change', (e) => {
		if (e.target.files && e.target.files[0]) {
			handleDominantColorsFile(e.target.files[0]);
		}
	});

	function handleDominantColorsFile(file) {
		if (!file.type.startsWith('image/')) return;

        // Validate file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            showNotification('Image size must be less than 10MB', 'error');
            return;
        }

		selectedFile = file;
		const reader = new FileReader();
		reader.onload = function(e) {
			previewImg.src = e.target.result;
			imagePreview.classList.remove('hidden');
			uploadContent.classList.add('hidden');
			extractBtn.disabled = false;
			document.getElementById('dominant-colors-image-info').textContent = `${file.name} (${Math.round(file.size/1024)} KB)`;
		};
		reader.readAsDataURL(file);
	}

	window.clearDominantColorsImage = function() {
		selectedFile = null;
		previewImg.src = '';
		imagePreview.classList.add('hidden');
		uploadContent.classList.remove('hidden');
		extractBtn.disabled = true;
	};

	window.clearDominantColorsResults = function() {
		document.getElementById('dominant-colors-results').classList.add('hidden');
		document.getElementById('dominant-colors-swatches').innerHTML = '';
		document.getElementById('dominant-colors-values').innerHTML = '';
		window.clearDominantColorsImage();
	};


	extractBtn.addEventListener('click', async function() {
		if (!selectedFile) return;
		extractBtn.disabled = true;
		extractBtn.textContent = 'Extracting...';
		const reader = new FileReader();
		reader.onload = async function(e) {
			let base64 = e.target.result;
			// Remove the data URL prefix if present
			if (base64.startsWith('data:')) {
				base64 = base64.split(',')[1];
			}
			try {
				const res = await fetch('/api/colors/extract', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ image: base64 })
				});
				if (!res.ok) throw new Error('Failed to extract colors');
				const data = await res.json();
				showDominantColorsResults(data.colors);
			} catch (err) {
				alert('Error: ' + err.message);
			} finally {
				extractBtn.disabled = false;
				extractBtn.textContent = 'Extract Dominant Colors';
			}
		};
		reader.readAsDataURL(selectedFile);
	});

	function showDominantColorsResults(colors) {
		const swatches = document.getElementById('dominant-colors-swatches');
		const values = document.getElementById('dominant-colors-values');
		swatches.innerHTML = '';
		values.innerHTML = '';
		colors.forEach((rgb, i) => {
			const hex = rgbToHex(rgb[0], rgb[1], rgb[2]);
			const swatch = document.createElement('div');
			swatch.className = 'w-16 h-16 rounded shadow border border-stone-600 flex items-center justify-center';
			swatch.style.background = hex;
			swatch.title = hex;
			swatches.appendChild(swatch);
			const val = document.createElement('div');
			val.className = 'text-stone-200 text-sm';
			val.innerHTML = `<span class="font-mono">${hex}</span> <span class="ml-2 text-stone-400">RGB(${rgb[0]}, ${rgb[1]}, ${rgb[2]})</span>`;
			values.appendChild(val);
		});
		document.getElementById('dominant-colors-results').classList.remove('hidden');
	}

	function rgbToHex(r, g, b) {
		return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('');
	}
});
