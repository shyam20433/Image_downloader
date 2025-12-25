document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('downloadForm');
    const generateBtn = document.getElementById('generateBtn');
    const btnText = generateBtn.querySelector('.btn-text');
    const loader = document.getElementById('loader');
    const messageDiv = document.getElementById('message');
    const imageGallery = document.getElementById('imageGallery');
    const imageGrid = document.getElementById('imageGrid');
    const selectAllBtn = document.getElementById('selectAll');
    const deselectAllBtn = document.getElementById('deselectAll');
    const selectionCount = document.getElementById('selectionCount');
    const downloadSelectedBtn = document.getElementById('downloadSelected');
    const progressContainer = document.getElementById('progressContainer');
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');

    let currentSessionId = null;
    let selectedImages = new Set();

    form.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Get form values
        const query = document.getElementById('query').value.trim();
        const limit = document.getElementById('limit').value;

        // Validate inputs
        if (!query) {
            showMessage('Please enter a search query', 'error');
            return;
        }

        // Disable button and show loader
        generateBtn.disabled = true;
        btnText.textContent = 'Generating...';
        loader.style.display = 'inline-block';
        messageDiv.style.display = 'none';
        imageGallery.style.display = 'none';
        imageGrid.innerHTML = '';
        selectedImages.clear();

        // Show and reset progress bar
        progressContainer.style.display = 'block';
        updateProgress(0);

        // Simulate progress (since we can't get real-time progress from bing-image-downloader)
        const progressInterval = simulateProgress(parseInt(limit));

        try {
            // Send request to backend
            const response = await fetch('/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query,
                    limit: parseInt(limit)
                })
            });

            const data = await response.json();

            // Clear progress interval
            clearInterval(progressInterval);

            if (data.success) {
                updateProgress(100);
                setTimeout(() => {
                    showMessage(data.message, 'success');
                    currentSessionId = data.session_id;
                    displayImages(data.images);
                    progressContainer.style.display = 'none';
                }, 500);
            } else {
                updateProgress(0);
                progressContainer.style.display = 'none';
                showMessage(data.message || 'An error occurred', 'error');
            }

        } catch (error) {
            clearInterval(progressInterval);
            updateProgress(0);
            progressContainer.style.display = 'none';
            showMessage('Network error: ' + error.message, 'error');
        } finally {
            // Re-enable button and hide loader
            generateBtn.disabled = false;
            btnText.textContent = 'Generate Images';
            loader.style.display = 'none';
        }
    });

    function simulateProgress(totalImages) {
        let progress = 0;
        // Estimate time based on number of images (roughly 1-2 seconds per image)
        const estimatedTime = totalImages * 1500; // 1.5 seconds per image
        const updateInterval = 100; // Update every 100ms
        const incrementPerUpdate = (95 / (estimatedTime / updateInterval)); // Go up to 95%, leave 5% for completion

        return setInterval(() => {
            if (progress < 95) {
                progress += incrementPerUpdate;
                updateProgress(Math.min(progress, 95));
            }
        }, updateInterval);
    }

    function updateProgress(percent) {
        const roundedPercent = Math.round(percent);
        progressBar.style.width = roundedPercent + '%';
        progressBar.setAttribute('aria-valuenow', roundedPercent);
        progressText.textContent = roundedPercent + '%';

        // Change color based on progress
        if (roundedPercent === 100) {
            progressBar.classList.remove('progress-bar-animated');
            progressBar.classList.add('bg-success');
        } else {
            progressBar.classList.add('progress-bar-animated');
            progressBar.classList.remove('bg-success');
        }
    }

    function displayImages(images) {
        imageGrid.innerHTML = '';

        images.forEach((image, index) => {
            // Create Bootstrap column
            const col = document.createElement('div');
            col.className = 'col-6 col-sm-4 col-md-3 col-lg-2';

            const imageItem = document.createElement('div');
            imageItem.className = 'image-item';
            imageItem.dataset.filename = image.filename;

            imageItem.innerHTML = `
                <input type="checkbox" class="image-checkbox" data-filename="${image.filename}">
                <img src="${image.url}" alt="${image.filename}" loading="lazy">
                <div class="image-overlay">${image.filename}</div>
            `;

            // Click on image to toggle selection
            imageItem.addEventListener('click', function (e) {
                if (e.target.classList.contains('image-checkbox')) {
                    return; // Let checkbox handle its own click
                }
                const checkbox = imageItem.querySelector('.image-checkbox');
                checkbox.checked = !checkbox.checked;
                toggleImageSelection(image.filename, checkbox.checked, imageItem);
            });

            // Checkbox change event
            const checkbox = imageItem.querySelector('.image-checkbox');
            checkbox.addEventListener('change', function (e) {
                e.stopPropagation();
                toggleImageSelection(image.filename, this.checked, imageItem);
            });

            col.appendChild(imageItem);
            imageGrid.appendChild(col);
        });

        imageGallery.style.display = 'block';
        updateSelectionCount();
    }

    function toggleImageSelection(filename, isSelected, imageItem) {
        if (isSelected) {
            selectedImages.add(filename);
            imageItem.classList.add('selected');
        } else {
            selectedImages.delete(filename);
            imageItem.classList.remove('selected');
        }
        updateSelectionCount();
    }

    function updateSelectionCount() {
        selectionCount.textContent = `${selectedImages.size} selected`;
    }

    selectAllBtn.addEventListener('click', function () {
        document.querySelectorAll('.image-checkbox').forEach(checkbox => {
            checkbox.checked = true;
            const filename = checkbox.dataset.filename;
            const imageItem = checkbox.closest('.image-item');
            selectedImages.add(filename);
            imageItem.classList.add('selected');
        });
        updateSelectionCount();
    });

    deselectAllBtn.addEventListener('click', function () {
        document.querySelectorAll('.image-checkbox').forEach(checkbox => {
            checkbox.checked = false;
            const filename = checkbox.dataset.filename;
            const imageItem = checkbox.closest('.image-item');
            selectedImages.delete(filename);
            imageItem.classList.remove('selected');
        });
        updateSelectionCount();
    });

    downloadSelectedBtn.addEventListener('click', async function () {
        if (selectedImages.size === 0) {
            showMessage('Please select at least one image', 'error');
            return;
        }

        downloadSelectedBtn.disabled = true;
        const originalText = downloadSelectedBtn.innerHTML;
        downloadSelectedBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Creating ZIP...';

        try {
            const response = await fetch('/download-selected', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    session_id: currentSessionId,
                    images: Array.from(selectedImages)
                })
            });

            const data = await response.json();

            if (data.success) {
                showMessage(data.message, 'success');
                // Trigger download
                window.location.href = `/download-zip/${data.zip_file}`;
            } else {
                showMessage(data.message || 'An error occurred', 'error');
            }

        } catch (error) {
            showMessage('Network error: ' + error.message, 'error');
        } finally {
            downloadSelectedBtn.disabled = false;
            downloadSelectedBtn.innerHTML = originalText;
        }
    });

    function showMessage(text, type) {
        // Use Bootstrap alert classes
        const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
        messageDiv.className = `alert ${alertClass}`;
        messageDiv.innerHTML = `<i class="bi bi-${type === 'success' ? 'check-circle-fill' : 'exclamation-triangle-fill'}"></i> ${text}`;
        messageDiv.style.display = 'block';

        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});
