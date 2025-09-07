"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CACHE_INVALIDATE_METADATA_KEY = exports.CACHE_METADATA_KEY = void 0;
exports.Cacheable = Cacheable;
exports.CacheEvict = CacheEvict;
exports.CachePut = CachePut;
exports.CacheableEvict = CacheableEvict;
const common_1 = require("@nestjs/common");
exports.CACHE_METADATA_KEY = 'cache:options';
exports.CACHE_INVALIDATE_METADATA_KEY = 'cache:invalidate';
function Cacheable(options = {}) {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(exports.CACHE_METADATA_KEY, options));
}
function CacheEvict(options) {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(exports.CACHE_INVALIDATE_METADATA_KEY, options));
}
function CachePut(options = {}) {
    return (0, common_1.applyDecorators)((0, common_1.SetMetadata)(exports.CACHE_METADATA_KEY, { ...options, forcePut: true }));
}
function CacheableEvict(cacheOptions = {}, evictOptions = {}) {
    return (0, common_1.applyDecorators)(Cacheable(cacheOptions), CacheEvict(evictOptions));
}
//# sourceMappingURL=cache.decorator.js.map