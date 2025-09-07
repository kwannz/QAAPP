"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Deprecated = exports.DEPRECATION_KEY = void 0;
const common_1 = require("@nestjs/common");
const deprecation_interceptor_1 = require("../interceptors/deprecation.interceptor");
exports.DEPRECATION_KEY = 'deprecation';
const Deprecated = (options) => {
    return (target, propertyKey, descriptor) => {
        if (propertyKey !== undefined && descriptor) {
            (0, common_1.SetMetadata)(exports.DEPRECATION_KEY, options)(target, propertyKey, descriptor);
            (0, common_1.UseInterceptors)(deprecation_interceptor_1.DeprecationInterceptor)(target, propertyKey, descriptor);
        }
        else {
            ;
            (0, common_1.SetMetadata)(exports.DEPRECATION_KEY, options)(target);
            (0, common_1.UseInterceptors)(deprecation_interceptor_1.DeprecationInterceptor)(target);
        }
    };
};
exports.Deprecated = Deprecated;
//# sourceMappingURL=deprecated.decorator.js.map