"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FinanceMappingUtils = void 0;
class FinanceMappingUtils {
    static nullToUndefined(value) {
        return value === null ? undefined : value;
    }
    static mapDatabasePositionToMock(position) {
        return {
            ...position,
            nextPayoutAt: this.nullToUndefined(position.nextPayoutAt),
            nftTokenId: this.nullToUndefined(position.nftTokenId),
            metadata: this.nullToUndefined(position.metadata),
        };
    }
    static mapDatabasePayoutToMock(payout) {
        return {
            ...payout,
            claimedAt: this.nullToUndefined(payout.claimedAt),
            txHash: this.nullToUndefined(payout.txHash),
        };
    }
}
exports.FinanceMappingUtils = FinanceMappingUtils;
//# sourceMappingURL=mapping.interface.js.map