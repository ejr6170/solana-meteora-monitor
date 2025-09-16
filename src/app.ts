import { EnhancedMeteoraMonitor } from './services/meteoraMonitor';
import { CONFIG } from './config/config';

async function main() {
    const monitor = new EnhancedMeteoraMonitor();
    try {
        await monitor.start();
        console.log('Started monitoring for Meteora pools');

        // Run periodic monitoring
        setInterval(async () => {
            try {
                await monitor.start();
            } catch (error) {
                console.error('Error in monitoring cycle:', error);
            }
        }, CONFIG.MONITORING_INTERVAL);
    } catch (error) {
        console.error('Failed to start monitoring:', error);
    }
}

main();