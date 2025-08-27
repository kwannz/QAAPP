"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KycRequired = exports.KYC_REQUIRED_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.KYC_REQUIRED_KEY = 'kycRequired';
const KycRequired = () => (0, common_1.SetMetadata)(exports.KYC_REQUIRED_KEY, true);
exports.KycRequired = KycRequired;
//# sourceMappingURL=kyc-required.decorator.js.map