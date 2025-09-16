"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAccountCreationTime = getAccountCreationTime;
exports.discoverNewPools = discoverNewPools;
const config_1 = require("../config/config");
async function getAccountCreationTime(connection, account) {
    try {
        const accountInfo = await connection.getAccountInfo(account);
        if (!accountInfo)
            return Date.now();
        const signatures = await connection.getConfirmedSignaturesForAddress2(account, { limit: 1 });
        if (signatures.length === 0)
            return Date.now();
        const signature = signatures[0].signature;
        const transaction = await connection.getConfirmedTransaction(signature);
        if (!transaction)
            return Date.now();
        return transaction.blockTime ? transaction.blockTime * 1000 : Date.now();
    }
    catch (error) {
        console.error(`Error fetching creation time for ${account.toString()}:`, error);
        return Date.now();
    }
}
async function discoverNewPools(connection) {
    try {
        const filters = [
            {
                dataSize: 800, // Adjust based on your pool account size
            },
        ];
        const accounts = await connection.getProgramAccounts(config_1.CONFIG.METEORA_PROGRAM_ID, { filters });
        return accounts.map(account => account.pubkey);
    }
    catch (error) {
        console.error('Error discovering new pools:', error);
        return [];
    }
}
