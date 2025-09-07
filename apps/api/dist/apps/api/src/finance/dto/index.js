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
exports.BulkUpdateTransactionsDto = exports.ExportTransactionsDto = exports.ProcessTransactionDto = exports.UpdateTransactionStatusDto = exports.GetTransactionsDto = void 0;
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
class GetTransactionsDto {
}
exports.GetTransactionsDto = GetTransactionsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], GetTransactionsDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['PAYOUT', 'WITHDRAWAL', 'ALL']),
    __metadata("design:type", String)
], GetTransactionsDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
    __metadata("design:type", String)
], GetTransactionsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GetTransactionsDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], GetTransactionsDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(1000),
    __metadata("design:type", Number)
], GetTransactionsDto.prototype, "limit", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], GetTransactionsDto.prototype, "offset", void 0);
class UpdateTransactionStatusDto {
}
exports.UpdateTransactionStatusDto = UpdateTransactionStatusDto;
__decorate([
    (0, class_validator_1.IsEnum)(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
    __metadata("design:type", String)
], UpdateTransactionStatusDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], UpdateTransactionStatusDto.prototype, "metadata", void 0);
class ProcessTransactionDto {
}
exports.ProcessTransactionDto = ProcessTransactionDto;
__decorate([
    (0, class_validator_1.IsEnum)(['APPROVE', 'REJECT', 'PROCESS']),
    __metadata("design:type", String)
], ProcessTransactionDto.prototype, "action", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ProcessTransactionDto.prototype, "reason", void 0);
class ExportTransactionsDto {
}
exports.ExportTransactionsDto = ExportTransactionsDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ExportTransactionsDto.prototype, "userId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['PAYOUT', 'WITHDRAWAL', 'ALL']),
    __metadata("design:type", String)
], ExportTransactionsDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
    __metadata("design:type", String)
], ExportTransactionsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ExportTransactionsDto.prototype, "startDate", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsDateString)(),
    __metadata("design:type", String)
], ExportTransactionsDto.prototype, "endDate", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['csv', 'excel', 'json']),
    __metadata("design:type", String)
], ExportTransactionsDto.prototype, "format", void 0);
class BulkUpdateTransactionsDto {
}
exports.BulkUpdateTransactionsDto = BulkUpdateTransactionsDto;
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], BulkUpdateTransactionsDto.prototype, "ids", void 0);
__decorate([
    (0, class_validator_1.IsEnum)(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED']),
    __metadata("design:type", String)
], BulkUpdateTransactionsDto.prototype, "status", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    __metadata("design:type", Object)
], BulkUpdateTransactionsDto.prototype, "metadata", void 0);
//# sourceMappingURL=index.js.map