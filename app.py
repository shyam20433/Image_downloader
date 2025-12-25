from flask import Flask, render_template, request, jsonify, send_file, send_from_directory
from bing_image_downloader import downloader
import os
import shutil
import zipfile
from datetime import datetime
import json

app = Flask(__name__)

# Configure folders
DOWNLOAD_FOLDER = 'downloads'
TEMP_FOLDER = 'temp_images'

for folder in [DOWNLOAD_FOLDER, TEMP_FOLDER]:
    if not os.path.exists(folder):
        os.makedirs(folder)

# Store current session data
current_session = {}

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/generate', methods=['POST'])
def generate_images():
    """Generate images and return preview URLs"""
    try:
        data = request.json
        query = data.get('query', '')
        limit = int(data.get('limit', 10))
        
        if not query:
            return jsonify({'success': False, 'message': 'Please provide a search query'}), 400
        
        # Create a unique session ID
        session_id = datetime.now().strftime('%Y%m%d_%H%M%S')
        session_folder = os.path.join(TEMP_FOLDER, session_id)
        
        # Download images
        print(f"Downloading {limit} images for query: {query}")
        downloader.download(
            query,
            limit=limit,
            output_dir=TEMP_FOLDER,
            adult_filter_off=True,
            force_replace=False,
            timeout=60,
            verbose=True
        )
        
        # The bing_image_downloader creates a folder with the query name
        source_folder = os.path.join(TEMP_FOLDER, query)
        
        if not os.path.exists(source_folder):
            return jsonify({'success': False, 'message': 'No images found'}), 404
        
        # Rename to session folder
        if os.path.exists(session_folder):
            shutil.rmtree(session_folder)
        os.rename(source_folder, session_folder)
        
        # Get list of images
        images = []
        for filename in os.listdir(session_folder):
            if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp')):
                images.append({
                    'filename': filename,
                    'url': f'/image/{session_id}/{filename}'
                })
        
        # Store session data
        current_session[session_id] = {
            'query': query,
            'folder': session_folder,
            'images': images
        }
        
        return jsonify({
            'success': True,
            'message': f'Successfully generated {len(images)} images',
            'session_id': session_id,
            'images': images
        })
        
    except Exception as e:
        print(f"Error in generate_images: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/image/<session_id>/<filename>')
def serve_image(session_id, filename):
    """Serve individual images"""
    try:
        session_folder = os.path.join(TEMP_FOLDER, session_id)
        return send_from_directory(session_folder, filename)
    except Exception as e:
        print(f"Error serving image: {str(e)}")
        return str(e), 404

@app.route('/download-selected', methods=['POST'])
def download_selected():
    """Download only selected images"""
    try:
        data = request.json
        session_id = data.get('session_id', '')
        selected_images = data.get('images', [])
        
        print(f"Download request - Session ID: {session_id}")
        print(f"Selected images: {selected_images}")
        print(f"Available sessions: {list(current_session.keys())}")
        
        if not session_id:
            return jsonify({'success': False, 'message': 'Session ID is missing'}), 400
            
        if session_id not in current_session:
            return jsonify({'success': False, 'message': f'Invalid session. Session {session_id} not found. Available sessions: {list(current_session.keys())}'}), 400
        
        if not selected_images:
            return jsonify({'success': False, 'message': 'No images selected'}), 400
        
        session_data = current_session[session_id]
        session_folder = session_data['folder']
        query = session_data['query']
        
        print(f"Session folder: {session_folder}")
        print(f"Query: {query}")
        
        # Create a zip file with selected images
        zip_filename = f'{query}_{session_id}_selected.zip'
        zip_path = os.path.join(DOWNLOAD_FOLDER, zip_filename)
        
        images_added = 0
        with zipfile.ZipFile(zip_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            for filename in selected_images:
                file_path = os.path.join(session_folder, filename)
                if os.path.exists(file_path):
                    zipf.write(file_path, filename)
                    images_added += 1
                else:
                    print(f"Warning: File not found: {file_path}")
        
        print(f"Created ZIP with {images_added} images")
        
        return jsonify({
            'success': True,
            'message': f'Successfully created zip with {images_added} images',
            'zip_file': zip_filename
        })
        
    except Exception as e:
        print(f"Error in download_selected: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/download-zip/<filename>')
def download_zip(filename):
    """Download the zip file"""
    try:
        file_path = os.path.join(DOWNLOAD_FOLDER, filename)
        if os.path.exists(file_path):
            return send_file(file_path, as_attachment=True, download_name=filename)
        else:
            return jsonify({'success': False, 'message': 'File not found'}), 404
    except Exception as e:
        print(f"Error downloading zip: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

@app.route('/cleanup', methods=['POST'])
def cleanup():
    """Clean up old files"""
    try:
        # Clean up zip files
        for file in os.listdir(DOWNLOAD_FOLDER):
            file_path = os.path.join(DOWNLOAD_FOLDER, file)
            if os.path.isfile(file_path) and file.endswith('.zip'):
                os.remove(file_path)
        
        # Clean up temp folders
        for folder in os.listdir(TEMP_FOLDER):
            folder_path = os.path.join(TEMP_FOLDER, folder)
            if os.path.isdir(folder_path):
                shutil.rmtree(folder_path)
        
        current_session.clear()
        
        return jsonify({'success': True, 'message': 'Cleanup completed'})
    except Exception as e:
        print(f"Error in cleanup: {str(e)}")
        return jsonify({'success': False, 'message': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
