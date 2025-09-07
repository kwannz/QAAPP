"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheOperation = exports.CacheLayer = void 0;
var CacheLayer;
(function (CacheLayer) {
    CacheLayer["L1_MEMORY"] = "L1_MEMORY";
    CacheLayer["L2_REDIS"] = "L2_REDIS";
    CacheLayer["L3_CDN"] = "L3_CDN";
})(CacheLayer || (exports.CacheLayer = CacheLayer = {}));
var CacheOperation;
(function (CacheOperation) {
    CacheOperation["GET"] = "GET";
    CacheOperation["SET"] = "SET";
    CacheOperation["DELETE"] = "DELETE";
    CacheOperation["INVALIDATE"] = "INVALIDATE";
})(CacheOperation || (exports.CacheOperation = CacheOperation = {}));
//# sourceMappingURL=cache.types.js.map