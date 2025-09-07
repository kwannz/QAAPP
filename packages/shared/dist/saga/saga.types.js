"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SagaStepType = exports.SagaStatus = exports.SagaStepStatus = void 0;
var SagaStepStatus;
(function (SagaStepStatus) {
    SagaStepStatus["PENDING"] = "PENDING";
    SagaStepStatus["RUNNING"] = "RUNNING";
    SagaStepStatus["COMPLETED"] = "COMPLETED";
    SagaStepStatus["FAILED"] = "FAILED";
    SagaStepStatus["COMPENSATED"] = "COMPENSATED";
})(SagaStepStatus || (exports.SagaStepStatus = SagaStepStatus = {}));
var SagaStatus;
(function (SagaStatus) {
    SagaStatus["CREATED"] = "CREATED";
    SagaStatus["RUNNING"] = "RUNNING";
    SagaStatus["COMPLETED"] = "COMPLETED";
    SagaStatus["FAILED"] = "FAILED";
    SagaStatus["COMPENSATING"] = "COMPENSATING";
    SagaStatus["COMPENSATED"] = "COMPENSATED";
})(SagaStatus || (exports.SagaStatus = SagaStatus = {}));
var SagaStepType;
(function (SagaStepType) {
    SagaStepType["ACTION"] = "ACTION";
    SagaStepType["COMPENSATION"] = "COMPENSATION";
})(SagaStepType || (exports.SagaStepType = SagaStepType = {}));
