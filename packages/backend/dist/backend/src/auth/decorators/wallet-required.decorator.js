"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRequired = exports.WALLET_REQUIRED_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.WALLET_REQUIRED_KEY = 'walletRequired';
const WalletRequired = () => (0, common_1.SetMetadata)(exports.WALLET_REQUIRED_KEY, true);
exports.WalletRequired = WalletRequired;
//# sourceMappingURL=wallet-required.decorator.js.map