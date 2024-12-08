from flask import Flask, request, jsonify
from flask_cors import CORS
from api_handler import api_handler

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route('/api/save_credentials', methods=['POST', 'OPTIONS'])
def save_credentials():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        api_secret = data.get('api_secret')
        
        if not api_key or not api_secret:
            return jsonify({
                'success': False,
                'message': 'Missing API credentials'
            })
        
        success, message = api_handler.save_api_credentials(api_key, api_secret)
        return jsonify({
            'success': success,
            'message': message
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@app.route('/api/test_connection', methods=['POST', 'OPTIONS'])
def test_connection():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        data = request.get_json()
        api_key = data.get('api_key')
        api_secret = data.get('api_secret')
        
        if not api_key or not api_secret:
            return jsonify({
                'success': False,
                'message': 'Missing API credentials'
            })
        
        success, message = api_handler.test_connection(api_key, api_secret)
        return jsonify({
            'success': success,
            'message': message
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

@app.route('/api/load_credentials', methods=['GET', 'OPTIONS'])
def load_credentials():
    if request.method == 'OPTIONS':
        return '', 200
        
    try:
        credentials = api_handler.load_credentials()
        return jsonify({
            'success': True,
            'credentials': credentials
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'message': str(e)
        })

if __name__ == '__main__':
    print("API Server running on http://localhost:5000")
    app.run(debug=True, port=5000)