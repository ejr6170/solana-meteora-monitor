"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const meteoraMonitor_1 = require("./services/meteoraMonitor");
const config_1 = require("./config/config");
async function main() {
    const monitor = new meteoraMonitor_1.EnhancedMeteoraMonitor();
    try {
        await monitor.start();
        console.log('Started monitoring for Meteora pools');
        // Run periodic monitoring
        setInterval(async () => {
            try {
                await monitor.start();
            }
            catch (error) {
                console.error('Error in monitoring cycle:', error);
            }
        }, config_1.CONFIG.MONITORING_INTERVAL);
    }
    catch (error) {
        console.error('Failed to start monitoring:', error);
    }
}
main();
