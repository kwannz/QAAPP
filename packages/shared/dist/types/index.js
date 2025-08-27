"use strict";
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
