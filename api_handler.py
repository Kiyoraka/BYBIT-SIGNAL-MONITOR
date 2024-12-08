import json
import os
import ccxt
from pathlib import Path

class APIHandler:
    def __init__(self):
        self.settings_dir = "settings"
        self.api_file = os.path.join(self.settings_dir, "apikey.json")
        self.ensure_settings_dir()

    def ensure_settings_dir(self):
        """Create settings directory if it doesn't exist"""
        if not os.path.exists(self.settings_dir):
            os.makedirs(self.settings_dir)

    def save_api_credentials(self, api_key, api_secret):
        """Save API credentials to JSON file"""
        try:
            credentials = {
                "api_key": api_key,
                "api_secret": api_secret
            }
            
            with open(self.api_file, 'w') as f:
                json.dump(credentials, f, indent=4)
            return True, "API credentials saved successfully"
        except Exception as e:
            return False, f"Error saving API credentials: {str(e)}"

    def test_connection(self, api_key, api_secret):
        """Test Bybit API connection"""
        try:
            exchange = ccxt.bybit({
                'apiKey': api_key,
                'secret': api_secret,
                'options': {
                    'defaultType': 'future',
                    'adjustForTimeDifference': True,
                    'recvWindow': 60000
                },
                'enableRateLimit': True
            })
            
            # Test connection by fetching balance
            exchange.fetch_balance()
            return True, "API connection successful"
        except Exception as e:
            return False, f"API connection failed: {str(e)}"

    def load_credentials(self):
        """Load existing API credentials"""
        try:
            if os.path.exists(self.api_file):
                with open(self.api_file, 'r') as f:
                    return json.load(f)
            return None
        except Exception:
            return None

# Create handler instance
api_handler = APIHandler()