# Solana Meteora Monitor

- A real-time monitoring tool designed to track activity on the Meteora protocol within the Solana blockchain ecosystem. This project focuses on detecting significant events such as large transactions flowing into liquidity pools, unusual or irregular price movements, and interactions with key contract addresses. It's ideal for traders, analysts, and developers who want to stay ahead of market dynamics on Solana's dynamic DeFi landscape. Features Real-Time Transaction Monitoring: Streams and analyzes transactions targeting Meteora liquidity pools for high-volume inflows.

- Optional docker setup will connect the bot to a live feed webpage for easy access viewing

- Irregular Movement Detection: Identifies anomalous price swings or volume spikes using configurable thresholds.

- Contract Address Tracking: Monitors interactions with specified Meteora program IDs and token contracts.

- Customizable Alerts: Supports logging to console, file, or external services (e.g., via webhooks).

- Efficient Solana Integration: Leverages lightweight RPC calls to minimize latency and costs.

- Modular Design: Easy to extend for additional metrics like TVL changes or pool health.

Tech Stack

- Python 3.10+
- @solana/web3.js (via Python bindings like solana-py)
- Pandas / NumPy
- Docker (optional)


## (Optional) Docker Setup:
- Build and run bash
- docker build -t solana-meteora-monitor .
- docker run -d --env-file .env solana-meteora-monitor
- UsageRunning the MonitorBasic Run bash
- poetry run python main.py

This starts the monitor, connecting to the configured RPC and subscribing to Meteora events. It will log detections to the console. 

## Example Output
- 2025-09-16 14:30:15 - INFO - Monitoring Meteora DLMM pools...
- 2025-09-16 14:32:42 - ALERT - Large inflow detected: 50,000 USDC into SOL-USDC pool from address 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU
- 2025-09-16 14:35:10 - WARNING - Irregular movement: Price deviation +15% in 1min on ETH-USDC pool (Z-score: 2.5)

## rpc
  - url: "https://api.mainnet-beta.solana.com" 
  - commitment: "confirmed"

## thresholds
  - volume_sol: 10000  # Minimum volume in SOL to trigger alert
  - anomaly_zscore: 2.0  # Statistical threshold for irregularities

## pools
  - "SOL-USDC"  # Pool symbols to monitor
  - "ETH-USDC"

## alerts
  - enabled: true
  - webhook_url: ""  # Optional for external alerts

Inspired by Meteora's innovative DLMM (Dynamic Liquidity Market Maker) design. Created by Eli
