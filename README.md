# Crypto Trading Signal Monitor

A sophisticated trading signal monitoring system for Futures Market, capable of tracking both long and short trading opportunities using multiple technical indicators.

## Features

- Dual monitoring system for both long and short signals
- Multiple technical indicators support:
  - RSI (Relative Strength Index)
  - Heikin Ashi candlesticks
  - MACD (Moving Average Convergence Divergence)
  - Bollinger Bands
  - Volume Profile
- Batch processing to handle multiple trading pairs efficiently
- Rate limiting and error handling
- Configurable parameters for each indicator
- Real-time monitoring with customizable check intervals

## Prerequisites

- Python 3.x
- Required Python packages:
  ```
  ccxt
  numpy
  pandas
  ta
  ```

## File Structure

- `Crypto Signal Monitor.bat` - Windows batch file to start both monitors
- `Crypto-LSM.py` - Long Signal Monitor script
- `Crypto-SSM.py` - Short Signal Monitor script
- `long-config.json` - Configuration file for long signals
- `short-config.json` - Configuration file for short signals

## Configuration

### API Setup
1. Create an account on Bybit
2. Generate API keys from your Bybit account
3. Edit both config files (`long-config.json` and `short-config.json`)
4. Replace the placeholder values:
   ```json
   "api_key": "paste here",
   "api_secret": "paste here"
   ```

### Technical Indicators Configuration

#### RSI (Relative Strength Index)
- Long signals (oversold conditions):
  ```json
  "rsi_threshold": 10
  "rsi_timeframe": "4h"
  "rsi_period": 7
  ```
- Short signals (overbought conditions):
  ```json
  "rsi_threshold": 90
  "rsi_timeframe": "4h"
  "rsi_period": 7
  ```

#### Heikin Ashi
```json
"heikin_ashi_enabled": 1,
"consecutive_ha_candles": 3,
"heikin_timeframe": "5m"
```

#### MACD
```json
"macd_enabled": 1,
"macd_timeframe": "4h",
"macd_fast_period": 12,
"macd_slow_period": 26,
"macd_signal_period": 9
```

#### Bollinger Bands
```json
"bb_enabled": 1,
"bb_timeframe": "4h",
"bb_period": 20,
"bb_std_dev": 2
```

#### Volume Profile
```json
"volume_enabled": 1,
"volume_timeframe": "4h",
"volume_periods": 24,
"volume_threshold": 2.0
```

### General Settings
```json
"check_interval": 5,      // Time between checks in seconds
"batch_size": 10,         // Number of symbols to check in each batch
"batch_delay": 2,         // Delay between batches in seconds
"min_indicators_required": 3  // Minimum number of indicators needed for a signal
```

## Usage

### Windows
1. Double-click the `Bybit Signal Monitor.bat` file
2. Two command windows will open:
   - Long Signal Monitor (Green)
   - Short Signal Monitor (Red)

### Manual Start
You can also start the monitors individually:
```bash
python Bybit-LSM.py  # For long signals
python Bybit-SSM.py  # For short signals
```

## Signal Conditions

### Long Signals
- RSI below 10 (oversold)
- Consecutive bullish Heikin Ashi candles
- MACD below -0.3 with positive histogram
- Bollinger Band %B below 5%
- High volume with positive price change

### Short Signals
- RSI above 90 (overbought)
- Consecutive bearish Heikin Ashi candles
- MACD above 0.3 with negative histogram
- Bollinger Band %B above 95%
- High volume with negative price change

## Monitor Output

The monitor displays:
- Active indicators and their timeframes
- Number of pairs being monitored
- Real-time status updates
- Detailed signal information when triggered:
  - Timestamp
  - Symbol
  - Current price
  - Triggered indicators count
  - Individual indicator values

## Error Handling

The system includes:
- Rate limit management
- Exchange connection error handling
- Data fetching retries
- Graceful error reporting

## Safety Notes

- Always test with small amounts first
- Monitor and adjust indicator settings based on market conditions
- Keep your API keys secure and never share them
- Use appropriate risk management strategies

## Termination

To stop the monitors:
- Press Ctrl+C in each monitor window
- Close the command windows

## Disclaimer

This tool is for educational and informational purposes only. Trading cryptocurrencies carries significant risks. Always conduct your own research and consider your risk tolerance before trading.