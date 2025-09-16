"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CONFIG = void 0;
const web3_js_1 = require("@solana/web3.js");
const bn_js_1 = __importDefault(require("bn.js"));
const dynamic_amm_sdk_1 = require("@mercurial-finance/dynamic-amm-sdk");
exports.CONFIG = {
    RPC_ENDPOINT: process.env.RPC_ENDPOINT || 'https://mainnet.helius-rpc.com/?api-key=d44bd5e6-b8ef-434b-8430-34e2efd5b7c0',
    MONITORING_INTERVAL: 300000,
    LARGE_LIQUIDITY_THRESHOLD: new bn_js_1.default(100000 * 10 ** 6),
    ADVANCE_CREATION_THRESHOLD: 24 * 60 * 60 * 1000,
    METEORA_PROGRAM_ID: new web3_js_1.PublicKey(process.env.METEORA_PROGRAM_ID || 'LBUZKhRxPF3XUpBCjp4YzTKgLccjZhTSDM9YuVaPwxo'),
    MONITORED_POOLS: [
        dynamic_amm_sdk_1.MAINNET_POOL.USDC_SOL,
        dynamic_amm_sdk_1.MAINNET_POOL.USDT_USDC,
    ],
};
