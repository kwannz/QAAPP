import { Injectable, Logger } from '@nestjs/common';
import { ethers } from 'ethers';
import * as crypto from 'crypto';

export interface WalletChallenge {
  message: string;
  nonce: string;
  timestamp: string;
  expiresAt: Date;
}

@Injectable()
export class WalletSignatureService {
  private readonly logger = new Logger(WalletSignatureService.name);
  private readonly challenges = new Map<string, WalletChallenge>();

  /**
   * 生成钱包签名挑战
   */
  generateChallenge(address: string): WalletChallenge {
    const nonce = crypto.randomBytes(16).toString('hex');
    const timestamp = new Date().toISOString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10分钟过期

    const message = this.createMessage(nonce, timestamp);

    const challenge: WalletChallenge = {
      message,
      nonce,
      timestamp,
      expiresAt,
    };

    // 存储挑战，使用地址+随机数作为键
    const challengeKey = `${address.toLowerCase()}-${nonce}`;
    this.challenges.set(challengeKey, challenge);

    // 清理过期的挑战
    this.cleanupExpiredChallenges();

    this.logger.debug(`Generated challenge for address ${address}: ${nonce}`);

    return challenge;
  }

  /**
   * 验证钱包签名
   */
  async verifySignature(
    address: string,
    signature: string,
    message: string,
  ): Promise<boolean> {
    try {
      // 从消息中提取nonce
      const nonceMatch = message.match(/Nonce: (\w+)/);
      if (!nonceMatch) {
        this.logger.warn(`Invalid message format: ${message}`);
        return false;
      }

      const nonce = nonceMatch[1];
      const challengeKey = `${address.toLowerCase()}-${nonce}`;

      // 检查挑战是否存在
      const challenge = this.challenges.get(challengeKey);
      if (!challenge) {
        this.logger.warn(`Challenge not found for address ${address} with nonce ${nonce}`);
        return false;
      }

      // 检查挑战是否过期
      if (new Date() > challenge.expiresAt) {
        this.logger.warn(`Challenge expired for address ${address}`);
        this.challenges.delete(challengeKey);
        return false;
      }

      // 验证消息内容
      if (challenge.message !== message) {
        this.logger.warn(`Message mismatch for address ${address}`);
        return false;
      }

      // 使用ethers验证签名
      const recoveredAddress = ethers.verifyMessage(message, signature);
      const isValid = recoveredAddress.toLowerCase() === address.toLowerCase();

      if (isValid) {
        this.logger.log(`Signature verified successfully for address ${address}`);
        // 验证成功后删除挑战，防止重放攻击
        this.challenges.delete(challengeKey);
      } else {
        this.logger.warn(
          `Signature verification failed. Expected: ${address}, Recovered: ${recoveredAddress}`
        );
      }

      return isValid;
    } catch (error) {
      this.logger.error(`Error verifying signature for address ${address}:`, error);
      return false;
    }
  }

  /**
   * 创建签名消息
   */
  private createMessage(nonce: string, timestamp: string): string {
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

  /**
   * 清理过期的挑战
   */
  private cleanupExpiredChallenges(): void {
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

  /**
   * 获取活跃挑战数量 (用于监控)
   */
  getActiveChallengeCount(): number {
    return this.challenges.size;
  }
}