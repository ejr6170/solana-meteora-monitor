import * as dotenv from 'dotenv';
dotenv.config();

import { MeteoraAdvanceCreationMonitor } from './services/meteoraMonitor';
// ... rest of the code

async function startMonitoring() {
  const monitor = new MeteoraAdvanceCreationMonitor();
  try {
    await monitor.start();
  } catch (error) {
    console.error('Failed to start monitoring:', error);
  }
}

startMonitoring();