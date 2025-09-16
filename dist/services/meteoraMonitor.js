"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.EnhancedMeteoraMonitor = void 0;
const web3_js_1 = require("@solana/web3.js");
const anchor_1 = require("@project-serum/anchor");
const bn_js_1 = __importDefault(require("bn.js"));
const borsh = __importStar(require("borsh"));
const config_1 = require("../config/config");
const helpers_1 = require("../utils/helpers");
// Define the PoolAccount class with appropriate types
class PoolAccount {
    constructor(fields) {
        this.tokenAReserve = new bn_js_1.default(fields.tokenAReserve);
        this.tokenBReserve = new bn_js_1.default(fields.tokenBReserve);
        this.tokenAMint = new web3_js_1.PublicKey(fields.tokenAMint);
        this.tokenBMint = new web3_js_1.PublicKey(fields.tokenBMint);
    }
}
// Define serializable schema class for borsh
class SerializablePool {
    constructor(props) {
        this.tokenAReserve = props.tokenAReserve;
        this.tokenBReserve = props.tokenBReserve;
        this.tokenAMint = props.tokenAMint;
        this.tokenBMint = props.tokenBMint;
    }
}
// Define Borsh schema
const schema = new Map([
    [
        SerializablePool,
        {
            kind: 'struct',
            fields: [
                ['tokenAReserve', 'u64'],
                ['tokenBReserve', 'u64'],
                ['tokenAMint', [32]],
                ['tokenBMint', [32]],
            ],
        },
    ],
]);
// Function to deserialize pool data using borsh
function deserializePoolData(buffer) {
    try {
        // Use deserialize from borsh
        const deserialized = borsh.deserialize(schema, SerializablePool, buffer);
        // Convert to PoolAccount format
        return new PoolAccount({
            tokenAReserve: deserialized.tokenAReserve,
            tokenBReserve: deserialized.tokenBReserve,
            tokenAMint: deserialized.tokenAMint,
            tokenBMint: deserialized.tokenBMint
        });
    }
    catch (error) {
        console.error('Error deserializing pool data:', error);
        throw new Error('Failed to deserialize pool data');
    }
}
class EnhancedMeteoraMonitor {
    constructor() {
        this.connection = new web3_js_1.Connection(config_1.CONFIG.RPC_ENDPOINT, 'confirmed');
        this.pools = new Map();
        this.suspiciousPoolsCache = new Set();
        const dummyKeypair = web3_js_1.Keypair.generate();
        const mockWallet = {
            publicKey: dummyKeypair.publicKey,
            payer: dummyKeypair,
            signTransaction: () => Promise.reject(new Error('Mock wallet cannot sign')),
            signAllTransactions: () => Promise.reject(new Error('Mock wallet cannot sign')),
        };
        this.provider = new anchor_1.AnchorProvider(this.connection, mockWallet, { commitment: 'confirmed' });
    }
    async createPool(poolAddress) {
        try {
            const accountInfo = await this.connection.getAccountInfo(poolAddress);
            if (!accountInfo)
                throw new Error(`Pool account ${poolAddress.toString()} not found`);
            const buffer = accountInfo.data;
            return deserializePoolData(buffer);
        }
        catch (error) {
            console.error(`Error creating pool instance for ${poolAddress.toString()}:`, error);
            throw error;
        }
    }
    async getUSDCAmount(pool) {
        const usdcMint = new web3_js_1.PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
        if (pool.tokenAMint.equals(usdcMint)) {
            return pool.tokenAReserve;
        }
        else if (pool.tokenBMint.equals(usdcMint)) {
            return pool.tokenBReserve;
        }
        return new bn_js_1.default(0);
    }
    async monitorForAdvanceCreation(poolAddress) {
        try {
            const pool = await this.createPool(poolAddress);
            const actualCreationTime = await (0, helpers_1.getAccountCreationTime)(this.connection, poolAddress);
            const currentTime = Date.now();
            const timeDifference = currentTime - actualCreationTime;
            if (timeDifference >= 12 * 60 * 60 * 1000 && timeDifference <= config_1.CONFIG.ADVANCE_CREATION_THRESHOLD) {
                const usdcAmount = await this.getUSDCAmount(pool);
                if (usdcAmount.lt(new bn_js_1.default(1000 * 10 ** 6))) {
                    this.pools.set(poolAddress.toString(), {
                        poolAddress,
                        creationTime: currentTime,
                        actualCreationTime,
                        lastLiquidity: usdcAmount,
                        tokenA: pool.tokenAMint.toString(),
                        tokenB: pool.tokenBMint.toString(),
                        recentAdditions: [],
                        isAdvanceCreated: true
                    });
                    this.suspiciousPoolsCache.add(poolAddress.toString());
                    console.log(`Potential advance-created pool detected:
                        Address: ${poolAddress.toString()}
                        Created: ${(timeDifference / (60 * 60 * 1000)).toFixed(2)} hours ago
                        USDC: ${usdcAmount.div(new bn_js_1.default(10 ** 6)).toString()} USDC`);
                }
            }
        }
        catch (error) {
            console.error(`Error monitoring pool ${poolAddress.toString()}:`, error);
        }
    }
    async start() {
        try {
            const newPools = await (0, helpers_1.discoverNewPools)(this.connection);
            for (const poolAddress of newPools) {
                await this.monitorForAdvanceCreation(poolAddress);
            }
        }
        catch (error) {
            console.error('Error in monitoring loop:', error);
            throw error;
        }
    }
}
exports.EnhancedMeteoraMonitor = EnhancedMeteoraMonitor;
