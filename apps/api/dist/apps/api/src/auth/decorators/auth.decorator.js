"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Auth = Auth;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../guards/jwt-auth.guard");
const roles_guard_1 = require("../guards/roles.guard");
const roles_decorator_1 = require("./roles.decorator");
function Auth(...roles) {
    const decorators = [(0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard)];
    if (roles && roles.length > 0) {
        decorators.push((0, roles_decorator_1.Roles)(...roles));
    }
    return (0, common_1.applyDecorators)(...decorators);
}
//# sourceMappingURL=auth.decorator.js.map