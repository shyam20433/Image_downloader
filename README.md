# Flask Image Downloader

A simple Flask web application for downloading images from Bing for CNN projects. Features include image preview, selective download, and a modern UI.

## Features
- 🔍 Search and generate images from Bing
- 🖼️ Preview images in a responsive gallery
- ✅ Select specific images to download
- 📦 Download selected images as a ZIP file
- 🎨 Modern, gradient UI with smooth animations

## Installation

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the application:
```bash
python app.py
```

3. Open your browser and navigate to:
```
http://localhost:5000
```

## Usage

1. Enter a search query (e.g., "cats", "dogs", "flowers")
2. Specify the number of images you want to generate
3. Click "Generate Images" and wait for the images to load
4. Select the images you want to download by clicking on them
5. Click "Download Selected Images" to get a ZIP file

## Project Structure

```
image downloader/
├── app.py                 # Flask application
├── requirements.txt       # Python dependencies
├── templates/
│   └── index.html        # HTML template
├── static/
│   ├── style.css         # CSS styles
│   └── script.js         # JavaScript functionality
├── downloads/            # ZIP files (auto-created)
└── temp_images/          # Temporary image storage (auto-created)
```

## Technologies Used

- **Backend**: Flask, bing-image-downloader
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Design**: CSS Grid, Gradients, Animations

## License

Free to use for educational purposes.
