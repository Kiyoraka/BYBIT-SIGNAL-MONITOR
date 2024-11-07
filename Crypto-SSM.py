import ccxt
import numpy as np
import pandas as pd
from datetime import datetime
import time
from ta.momentum import RSIIndicator
from ta.trend import MACD
from ta.volatility import BollingerBands
import json
import os
import platform
import subprocess

def clear_screen():
    """
    Clear the console screen based on the operating system
    """
    try:
        # For Windows
        if platform.system().lower() == "windows":
            subprocess.call('cls', shell=True)
        # For Linux/Mac
        else:
            subprocess.call('clear', shell=True)
    except:
        # Fallback method if subprocess fails
        if platform.system().lower() == "windows":
            os.system('cls')
        else:
            os.system('clear')

class BybitMonitor:
    def __init__(self):
        self.load_config()
        self.initialize_exchange()
        self.last_request_time = {}
        self.request_interval = 0.1

    def load_config(self):
        config_file = 'short-config.json'
        
        if not os.path.exists(config_file):
            default_config = {
                'api_key': 'YOUR_API_KEY',
                'api_secret': 'YOUR_API_SECRET',
                'rsi_enabled': 1,
                'rsi_timeframe': '4h',
                'heikin_timeframe': '3m',
                'rsi_period': 14,
                'rsi_threshold': 90,
                'check_interval': 60,
                'batch_size': 5,
                'batch_delay': 2,
                'heikin_ashi_enabled': 1,
                'consecutive_ha_candles': 3
            }
            with open(config_file, 'w') as f:
                json.dump(default_config, f, indent=4)
            print(f"Created default config file: {config_file}")
            print("Please edit the config file with your API keys before running.")
            input("Press Enter to exit...")
            exit()

        with open(config_file, 'r') as f:
            self.config = json.load(f)

    def initialize_exchange(self):
        self.exchange = ccxt.bybit({
            'apiKey': self.config['api_key'],
            'secret': self.config['api_secret'],
            'options': {
                'defaultType': 'future',
                'adjustForTimeDifference': True,
                'recvWindow': 60000
            },
            'enableRateLimit': True,
            'rateLimit': 100
        })

    def calculate_heikin_ashi(self, df):
        """Calculate Heikin Ashi candles"""
        ha_df = pd.DataFrame(index=df.index)
    
        # Calculate Heikin Ashi values
        ha_df['ha_close'] = (df['open'] + df['high'] + df['low'] + df['close']) / 4
    
        # Initialize first ha_open with first candle's open price
        ha_df.loc[df.index[0], 'ha_open'] = df['open'].iloc[0]
    
         # Calculate subsequent ha_open values
        for i in range(1, len(df)):
            ha_df.loc[df.index[i], 'ha_open'] = (ha_df['ha_open'].iloc[i-1] + ha_df['ha_close'].iloc[i-1]) / 2
    
        # Calculate ha_high and ha_low
        ha_df['ha_high'] = df.apply(
            lambda x: max(x['high'], ha_df.loc[x.name, 'ha_open'], ha_df.loc[x.name, 'ha_close']),
            axis=1
        )
        ha_df['ha_low'] = df.apply(
            lambda x: min(x['low'], ha_df.loc[x.name, 'ha_open'], ha_df.loc[x.name, 'ha_close']),
            axis=1
        )
    
        return ha_df

    def check_heikin_ashi_signal(self, ha_df, lookback=3):
        """Check for bearish Heikin Ashi pattern"""
        if len(ha_df) < lookback:
            return False
    
        # Get the last n candles
        last_candles = ha_df.tail(lookback)
    
        # Check if all last n candles are bearish (close < open)
        bearish_candles = all(
            last_candles['ha_close'].values < last_candles['ha_open'].values
        )
    
        return bearish_candles

    def get_futures_symbols(self):
        try:
            markets = self.exchange.fetch_markets()
            futures_symbols = [market['symbol'] for market in markets 
                             if market['type'] == 'swap' 
                             and 'USDT' in market['symbol']]
            return futures_symbols
        except Exception as e:
            print(f"Error fetching symbols: {str(e)}")
            return []

    def wait_for_rate_limit(self, symbol):
        current_time = time.time()
        if symbol in self.last_request_time:
            elapsed = current_time - self.last_request_time[symbol]
            if elapsed < self.request_interval:
                time.sleep(self.request_interval - elapsed)
        self.last_request_time[symbol] = time.time()

    def fetch_ohlcv(self, symbol, timeframe, limit):
        try:
            self.wait_for_rate_limit(symbol)
            ohlcv = self.exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
            if not ohlcv:
                return None
            df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
            return df
        except Exception as e:
            if 'rate limit' in str(e).lower():
                print(f"\nRate limit hit for {symbol}, waiting...")
                time.sleep(2)
                return self.fetch_ohlcv(symbol, timeframe, limit)
            else:
                print(f"Error fetching OHLCV data for {symbol}: {str(e)}")
                return None

    def calculate_rsi(self, df, period):
        try:
            if len(df) < period:
                return None
            rsi_indicator = RSIIndicator(close=df['close'], window=period)
            return rsi_indicator.rsi()
        except Exception as e:
            print(f"Error calculating RSI: {str(e)}")
            return None
        
    def calculate_macd(self, df):
        """Calculate MACD indicator"""
        try:
            macd = MACD(
                close=df['close'],
                window_fast=self.config['macd_fast_period'],
                window_slow=self.config['macd_slow_period'],
                window_sign=self.config['macd_signal_period']
            )
            return {
                'macd': macd.macd(),
                'signal': macd.macd_signal(),
                'histogram': macd.macd_diff()
            }
        except Exception as e:
            print(f"Error calculating MACD: {str(e)}")
            return None

    def calculate_bollinger_bands(self, df):
        """Calculate Bollinger Bands"""
        try:
            indicator_bb = BollingerBands(
                close=df['close'],
                window=self.config['bb_period'],
                window_dev=self.config['bb_std_dev']
            )
            return {
                'upper': indicator_bb.bollinger_hband(),
                'middle': indicator_bb.bollinger_mavg(),
                'lower': indicator_bb.bollinger_lband(),
                'percentage': indicator_bb.bollinger_pband()
            }
        except Exception as e:
            print(f"Error calculating Bollinger Bands: {str(e)}")
            return None

    def calculate_volume_profile(self, df):
        """Calculate Volume Profile"""
        try:
            # Calculate relative volume
            df['volume_sma'] = df['volume'].rolling(window=self.config['volume_periods']).mean()
            df['volume_ratio'] = df['volume'] / df['volume_sma']
            
            # Calculate price movement
            df['price_change'] = df['close'].pct_change()
            
            # Identify high volume bars
            high_volume = df['volume_ratio'] > self.config['volume_threshold']
            
            return {
                'volume_ratio': df['volume_ratio'].iloc[-1],
                'high_volume_bearish': high_volume.iloc[-1] and df['price_change'].iloc[-1] < 0
            }
        except Exception as e:
            print(f"Error calculating Volume Profile: {str(e)}")
            return None

    def check_symbol(self, symbol): #Checking
        try:
            signals = {}
            current_price = None
            active_indicators = 0
            triggered_indicators = 0

            # Check RSI
            if self.config.get('rsi_enabled', 1):
                active_indicators += 1
                df_4h = self.fetch_ohlcv(symbol, self.config['rsi_timeframe'], 100)
                if df_4h is not None and not df_4h.empty:
                    rsi = self.calculate_rsi(df_4h, self.config['rsi_period'])
                    if rsi is not None:
                        current_price = df_4h['close'].iloc[-1]
                        current_rsi = rsi.iloc[-1]
                        if current_rsi > self.config['rsi_threshold']:
                            triggered_indicators += 1
                            signals['rsi'] = current_rsi

            # Check Heikin Ashi
            if self.config.get('heikin_ashi_enabled', 1):
                active_indicators += 1
                df_ha = self.fetch_ohlcv(symbol, self.config['heikin_timeframe'], 100)
                if df_ha is not None and not df_ha.empty:
                    ha_df = self.calculate_heikin_ashi(df_ha)
                    if self.check_heikin_ashi_signal(ha_df, self.config['consecutive_ha_candles']):
                        triggered_indicators += 1
                        signals['heikin_ashi'] = self.config['consecutive_ha_candles']
                    if current_price is None:
                        current_price = df_ha['close'].iloc[-1]

            # Check MACD
            if self.config.get('macd_enabled', 1):
                active_indicators += 1
                df_macd = self.fetch_ohlcv(symbol, self.config['macd_timeframe'], 100)
                if df_macd is not None and not df_macd.empty:
                    macd_data = self.calculate_macd(df_macd)
                    if macd_data is not None:
                        if macd_data['macd'].iloc[-1] > self.config['macd_overbought'] and \
                           macd_data['histogram'].iloc[-1] < 0:
                            triggered_indicators += 1
                            signals['macd'] = macd_data['macd'].iloc[-1]
                    if current_price is None:
                        current_price = df_macd['close'].iloc[-1]

            # Check Bollinger Bands
            if self.config.get('bb_enabled', 1):
                active_indicators += 1
                df_bb = self.fetch_ohlcv(symbol, self.config['bb_timeframe'], 100)
                if df_bb is not None and not df_bb.empty:
                    bb_data = self.calculate_bollinger_bands(df_bb)
                    if bb_data is not None:
                        if bb_data['percentage'].iloc[-1] * 100 > self.config['bb_percentage_threshold']:
                            triggered_indicators += 1
                            signals['bollinger'] = bb_data['percentage'].iloc[-1] * 100
                    if current_price is None:
                        current_price = df_bb['close'].iloc[-1]

            # Check Volume Profile
            if self.config.get('volume_enabled', 1):
                active_indicators += 1
                df_vol = self.fetch_ohlcv(symbol, self.config['volume_timeframe'], 100)
                if df_vol is not None and not df_vol.empty:
                    volume_data = self.calculate_volume_profile(df_vol)
                    if volume_data is not None and volume_data['high_volume_bearish']:
                        triggered_indicators += 1
                        signals['volume'] = volume_data['volume_ratio']
                    if current_price is None:
                        current_price = df_vol['close'].iloc[-1]

            # Check if enough indicators are triggered
            min_required = min(self.config.get('min_indicators_required', 3), active_indicators)
            if triggered_indicators >= min_required and current_price is not None:
                return {
                    'symbol': symbol,
                    'price': current_price,
                    'time': datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
                    'signals': signals,
                    'triggered': triggered_indicators,
                    'total_active': active_indicators
                }

            return None

        except Exception as e:
            print(f"Error checking {symbol}: {str(e)}")
            return None

    def process_batch(self, symbols):
        results = []
        for symbol in symbols:
            result = self.check_symbol(symbol)
            if result:
                results.append(result)
            time.sleep(0.1)
        return results

    def start_monitoring(self):
        clear_screen()
        print("\nCrypto Short Futures Signal Monitor - Enhanced Version")
        print("=============================================")
        
        # Display active indicators
        indicators = [
            ('RSI', 'rsi_enabled', 'rsi_timeframe'),
            ('Heikin Ashi', 'heikin_ashi_enabled', 'heikin_timeframe'),
            ('MACD', 'macd_enabled', 'macd_timeframe'),
            ('Bollinger Bands', 'bb_enabled', 'bb_timeframe'),
            ('Volume Profile', 'volume_enabled', 'volume_timeframe')
        ]

        print("\nActive Indicators:")
        for name, enabled_key, timeframe_key in indicators:
            if self.config.get(enabled_key, 0):
                print(f"✅ {name} ({self.config[timeframe_key]})")
            else:
                print(f"❌ {name}")

        print(f"\nMinimum Indicators Required: {self.config.get('min_indicators_required', 3)}")
        print(f"Check Interval: {self.config['check_interval']} seconds")
        
        # Continue with the rest of the monitoring logic
        symbols = self.get_futures_symbols()
        batch_size = self.config.get('batch_size', 5)
        batch_delay = self.config.get('batch_delay', 2)
        
        print(f"\nMonitoring {len(symbols)} pairs in batches of {batch_size}")
        print("\nPress Ctrl+C to stop")
        print("----------------------------------------")

        while True:
            try:
                current_time = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                print(f"\rLast check: {current_time}", end="")

                for i in range(0, len(symbols), batch_size):
                    batch = symbols[i:i + batch_size]
                    results = self.process_batch(batch)
                    
                    for result in results:
                        print("\n\n🔴 SHORT SIGNAL DETECTED!")
                        print(f"Time: {result['time']}")
                        print(f"Symbol: {result['symbol']}")
                        print(f"Price: {result['price']:.4f}")
                        print(f"Indicators Triggered: {result['triggered']}/{result['total_active']}")
                        
                        # Display triggered indicators
                        for indicator, value in result['signals'].items():
                            if indicator == 'rsi':
                                print(f"RSI ({self.config['rsi_timeframe']}): {value:.2f}")
                            elif indicator == 'heikin_ashi':
                                print(f"Heikin Ashi ({self.config['heikin_timeframe']}): {value} bearish candles")
                            elif indicator == 'macd':
                                print(f"MACD ({self.config['macd_timeframe']}): {value:.3f}")
                            elif indicator == 'bollinger':
                                print(f"Bollinger Band %B: {value:.2f}%")
                            elif indicator == 'volume':
                                print(f"Volume Ratio: {value:.2f}x average")
                        
                        print("----------------------------------------")
                    
                    time.sleep(batch_delay)

                time.sleep(self.config['check_interval'])

            except KeyboardInterrupt:
                print("\n\nMonitoring stopped by user")
                input("\nPress Enter to exit...")
                break
            except Exception as e:
                print(f"\nError in main loop: {str(e)}")
                time.sleep(self.config['check_interval'])

if __name__ == "__main__":
    try:
        monitor = BybitMonitor()
        monitor.start_monitoring()
    except Exception as e:
        print(f"\nError: {str(e)}")
        input("\nPress Enter to exit...")