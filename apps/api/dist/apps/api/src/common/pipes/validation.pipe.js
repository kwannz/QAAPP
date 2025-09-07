"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueryValidationPipe = exports.CustomValidationPipe = void 0;
const common_1 = require("@nestjs/common");
let CustomValidationPipe = class CustomValidationPipe extends common_1.ValidationPipe {
    constructor() {
        super({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
            exceptionFactory: (validationErrors = []) => {
                return new common_1.BadRequestException({
                    code: 'VALIDATION_ERROR',
                    message: 'Validation failed',
                    details: this.formatValidationErrors(validationErrors),
                });
            },
        });
    }
    formatValidationErrors(errors) {
        const formatError = (error) => {
            const result = {
                field: error.property,
                value: error.value,
                constraints: {},
            };
            if (error.constraints) {
                Object.keys(error.constraints).forEach((key) => {
                    result.constraints[key] = {
                        code: this.getConstraintCode(key),
                        message: this.getConstraintMessage(key, error.constraints[key], error.property),
                    };
                });
            }
            if (error.children && error.children.length > 0) {
                result.children = error.children.map(formatError);
            }
            return result;
        };
        return errors.map(formatError);
    }
    getConstraintCode(constraintKey) {
        const constraintCodeMap = {
            isEmail: 'INVALID_EMAIL',
            isString: 'INVALID_STRING',
            isNumber: 'INVALID_NUMBER',
            isBoolean: 'INVALID_BOOLEAN',
            isArray: 'INVALID_ARRAY',
            isObject: 'INVALID_OBJECT',
            isNotEmpty: 'FIELD_REQUIRED',
            minLength: 'MIN_LENGTH_ERROR',
            maxLength: 'MAX_LENGTH_ERROR',
            min: 'MIN_VALUE_ERROR',
            max: 'MAX_VALUE_ERROR',
            isUUID: 'INVALID_UUID',
            isUrl: 'INVALID_URL',
            isPhoneNumber: 'INVALID_PHONE_NUMBER',
            isDateString: 'INVALID_DATE',
            matches: 'PATTERN_MISMATCH',
            isEnum: 'INVALID_ENUM_VALUE',
            isOptional: 'FIELD_OPTIONAL',
            isDefined: 'FIELD_REQUIRED',
        };
        return constraintCodeMap[constraintKey] || 'VALIDATION_ERROR';
    }
    getConstraintMessage(constraintKey, originalMessage, fieldName) {
        const friendlyMessages = {
            isEmail: (field) => `${field} must be a valid email address`,
            isNotEmpty: (field) => `${field} is required and cannot be empty`,
            minLength: (field, msg) => {
                const match = msg.match(/minimum of (\d+) characters/);
                const min = match ? match[1] : 'required';
                return `${field} must be at least ${min} characters long`;
            },
            maxLength: (field, msg) => {
                const match = msg.match(/maximum of (\d+) characters/);
                const max = match ? match[1] : 'allowed';
                return `${field} must not exceed ${max} characters`;
            },
            min: (field, msg) => {
                const match = msg.match(/minimum allowed value is (\d+)/);
                const min = match ? match[1] : '0';
                return `${field} must be at least ${min}`;
            },
            max: (field, msg) => {
                const match = msg.match(/maximum allowed value is (\d+)/);
                const max = match ? match[1] : 'the limit';
                return `${field} must not exceed ${max}`;
            },
            isString: (field) => `${field} must be a text value`,
            isNumber: (field) => `${field} must be a number`,
            isBoolean: (field) => `${field} must be true or false`,
            isArray: (field) => `${field} must be an array`,
            isObject: (field) => `${field} must be an object`,
            isUUID: (field) => `${field} must be a valid UUID`,
            isUrl: (field) => `${field} must be a valid URL`,
            isPhoneNumber: (field) => `${field} must be a valid phone number`,
            isDateString: (field) => `${field} must be a valid date string`,
            matches: (field) => `${field} format is invalid`,
            isEnum: (field, msg) => {
                const match = msg.match(/must be one of the following values: (.+)/);
                const values = match ? match[1] : 'allowed values';
                return `${field} must be one of: ${values}`;
            },
        };
        const friendlyMessageFn = friendlyMessages[constraintKey];
        if (friendlyMessageFn) {
            return friendlyMessageFn(fieldName, originalMessage);
        }
        return originalMessage;
    }
};
exports.CustomValidationPipe = CustomValidationPipe;
exports.CustomValidationPipe = CustomValidationPipe = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], CustomValidationPipe);
let QueryValidationPipe = class QueryValidationPipe extends CustomValidationPipe {
    constructor() {
        super();
    }
    async transform(value, metadata) {
        if (value && typeof value === 'object') {
            Object.keys(value).forEach((key) => {
                if (typeof value[key] === 'string' && value[key].startsWith('[') && value[key].endsWith(']')) {
                    try {
                        value[key] = JSON.parse(value[key]);
                    }
                    catch (e) {
                    }
                }
            });
        }
        return super.transform(value, metadata);
    }
};
exports.QueryValidationPipe = QueryValidationPipe;
exports.QueryValidationPipe = QueryValidationPipe = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], QueryValidationPipe);
//# sourceMappingURL=validation.pipe.js.map