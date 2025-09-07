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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommissionStatus = exports.CommissionType = exports.PositionStatus = exports.OrderStatus = exports.KycStatus = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["USER"] = "USER";
    UserRole["AGENT"] = "AGENT";
    UserRole["ADMIN"] = "ADMIN";
})(UserRole || (exports.UserRole = UserRole = {}));
var KycStatus;
(function (KycStatus) {
    KycStatus["PENDING"] = "PENDING";
    KycStatus["APPROVED"] = "APPROVED";
    KycStatus["REJECTED"] = "REJECTED";
    KycStatus["EXPIRED"] = "EXPIRED";
})(KycStatus || (exports.KycStatus = KycStatus = {}));
var OrderStatus;
(function (OrderStatus) {
    OrderStatus["PENDING"] = "PENDING";
    OrderStatus["SUCCESS"] = "SUCCESS";
    OrderStatus["FAILED"] = "FAILED";
    OrderStatus["CANCELED"] = "CANCELED";
})(OrderStatus || (exports.OrderStatus = OrderStatus = {}));
var PositionStatus;
(function (PositionStatus) {
    PositionStatus["ACTIVE"] = "ACTIVE";
    PositionStatus["REDEEMING"] = "REDEEMING";
    PositionStatus["CLOSED"] = "CLOSED";
    PositionStatus["DEFAULTED"] = "DEFAULTED";
})(PositionStatus || (exports.PositionStatus = PositionStatus = {}));
var CommissionType;
(function (CommissionType) {
    CommissionType["REFERRAL"] = "REFERRAL";
    CommissionType["AGENT"] = "AGENT";
})(CommissionType || (exports.CommissionType = CommissionType = {}));
var CommissionStatus;
(function (CommissionStatus) {
    CommissionStatus["PENDING"] = "PENDING";
    CommissionStatus["READY"] = "READY";
    CommissionStatus["PAID"] = "PAID";
    CommissionStatus["FAILED"] = "FAILED";
})(CommissionStatus || (exports.CommissionStatus = CommissionStatus = {}));
__exportStar(require("./cache.types"), exports);
