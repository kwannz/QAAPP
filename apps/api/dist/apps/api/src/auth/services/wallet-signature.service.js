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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var WalletSignatureService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletSignatureService = void 0;
const common_1 = require("@nestjs/common");
const ethers_1 = require("ethers");
const crypto = __importStar(require("crypto"));
let WalletSignatureService = WalletSignatureService_1 = class WalletSignatureService {
    constructor() {
        this.logger = new common_1.Logger(WalletSignatureService_1.name);
        this.challenges = new Map();
    }
    generateChallenge(address) {
        const nonce = crypto.randomBytes(16).toString('hex');
        const timestamp = new Date().toISOString();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
        const message = this.createMessage(nonce, timestamp);
        const challenge = {
            message,
            nonce,
            timestamp,
            expiresAt,
        };
        const challengeKey = `${address.toLowerCase()}-${nonce}`;
        this.challenges.set(challengeKey, challenge);
        this.cleanupExpiredChallenges();
        this.logger.debug(`Generated challenge for address ${address}: ${nonce}`);
        return challenge;
    }
    async verifySignature(address, signature, message) {
        try {
            const nonceMatch = message.match(/Nonce: (\w+)/);
            if (!nonceMatch) {
                this.logger.warn(`Invalid message format: ${message}`);
                return false;
            }
            const nonce = nonceMatch[1];
            const challengeKey = `${address.toLowerCase()}-${nonce}`;
            const challenge = this.challenges.get(challengeKey);
            if (!challenge) {
                this.logger.warn(`Challenge not found for address ${address} with nonce ${nonce}`);
                return false;
            }
            if (new Date() > challenge.expiresAt) {
                this.logger.warn(`Challenge expired for address ${address}`);
                this.challenges.delete(challengeKey);
                return false;
            }
            if (challenge.message !== message) {
                this.logger.warn(`Message mismatch for address ${address}`);
                return false;
            }
            const recoveredAddress = ethers_1.ethers.verifyMessage(message, signature);
            const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();
            if (isValid) {
                this.logger.log(`Signature verified successfully for address ${address}`);
                this.challenges.delete(challengeKey);
            }
            else {
                this.logger.warn(`Signature verification failed. Expected: ${address}, Recovered: ${recoveredAddress}`);
            }
            return isValid;
        }
        catch (error) {
            this.logger.error(`Error verifying signature for address ${address}:`, error);
            return false;
        }
    }
    createMessage(nonce, timestamp) {
        return [
            'Welcome to QA App!',
            '',
            'Sign this message to authenticate your wallet.',
            'This request will not trigger a blockchain transaction or cost any gas fees.',
            '',
            `Nonce: ${nonce}`,
            `Timestamp: ${timestamp}`,
        ].join('\n');
    }
    cleanupExpiredChallenges() {
        const now = new Date();
        let expiredCount = 0;
        for (const [key, challenge] of this.challenges.entries()) {
            if (now > challenge.expiresAt) {
                this.challenges.delete(key);
                expiredCount++;
            }
        }
        if (expiredCount > 0) {
            this.logger.debug(`Cleaned up ${expiredCount} expired challenges`);
        }
    }
    getActiveChallengeCount() {
        return this.challenges.size;
    }
};
exports.WalletSignatureService = WalletSignatureService;
exports.WalletSignatureService = WalletSignatureService = WalletSignatureService_1 = __decorate([
    (0, common_1.Injectable)()
], WalletSignatureService);
//# sourceMappingURL=wallet-signature.service.js.map