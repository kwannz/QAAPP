"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VersionStatus = exports.ApiVersioningStrategy = void 0;
var ApiVersioningStrategy;
(function (ApiVersioningStrategy) {
    ApiVersioningStrategy["URL_PATH"] = "URL_PATH";
    ApiVersioningStrategy["QUERY_PARAMETER"] = "QUERY_PARAM";
    ApiVersioningStrategy["HEADER"] = "HEADER";
    ApiVersioningStrategy["CONTENT_NEGOTIATION"] = "CONTENT";
    ApiVersioningStrategy["SUBDOMAIN"] = "SUBDOMAIN";
    ApiVersioningStrategy["CUSTOM_HEADER"] = "CUSTOM_HEADER";
})(ApiVersioningStrategy || (exports.ApiVersioningStrategy = ApiVersioningStrategy = {}));
var VersionStatus;
(function (VersionStatus) {
    VersionStatus["BETA"] = "BETA";
    VersionStatus["STABLE"] = "STABLE";
    VersionStatus["DEPRECATED"] = "DEPRECATED";
    VersionStatus["SUNSET"] = "SUNSET";
})(VersionStatus || (exports.VersionStatus = VersionStatus = {}));
