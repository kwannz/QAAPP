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
var CacheInterceptor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheInterceptor = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const rxjs_1 = require("rxjs");
const operators_1 = require("rxjs/operators");
const multi_layer_cache_service_1 = require("./multi-layer-cache.service");
const cache_invalidation_service_1 = require("./cache-invalidation.service");
const cache_decorator_1 = require("./cache.decorator");
let CacheInterceptor = CacheInterceptor_1 = class CacheInterceptor {
    constructor(reflector, cacheService, invalidationService) {
        this.reflector = reflector;
        this.cacheService = cacheService;
        this.invalidationService = invalidationService;
        this.logger = new common_1.Logger(CacheInterceptor_1.name);
    }
    intercept(context, next) {
        const cacheOptions = this.reflector.get(cache_decorator_1.CACHE_METADATA_KEY, context.getHandler());
        const invalidateOptions = this.reflector.get(cache_decorator_1.CACHE_INVALIDATE_METADATA_KEY, context.getHandler());
        if (!cacheOptions && !invalidateOptions) {
            return next.handle();
        }
        const request = context.switchToHttp().getRequest();
        const args = this.extractArguments(context);
        const methodName = context.getHandler().name;
        const className = context.getClass().name;
        if (cacheOptions) {
            return this.handleCache(cacheOptions, args, methodName, className, request, next);
        }
        if (invalidateOptions) {
            return this.handleInvalidation(invalidateOptions, args, next);
        }
        return next.handle();
    }
    handleCache(options, args, methodName, className, request, next) {
        if (options.condition && !options.condition(args)) {
            return next.handle();
        }
        const cacheKey = this.generateCacheKey(options.key, args, methodName, className, request);
        if (options.forcePut) {
            return next.handle().pipe((0, operators_1.tap)(async (result) => {
                if (!options.unless || !options.unless(result)) {
                    await this.cacheService.set(cacheKey, result, options.ttl);
                    this.logger.debug(`Cache put: ${cacheKey}`);
                }
            }));
        }
        return (0, rxjs_1.from)(this.cacheService.get(cacheKey)).pipe((0, operators_1.switchMap)((cachedResult) => {
            if (cachedResult !== null) {
                this.logger.debug(`Cache hit: ${cacheKey}`);
                return (0, rxjs_1.of)(cachedResult);
            }
            return next.handle().pipe((0, operators_1.tap)(async (result) => {
                if (!options.unless || !options.unless(result)) {
                    await this.cacheService.set(cacheKey, result, options.ttl);
                    this.logger.debug(`Cache miss, cached result: ${cacheKey}`);
                }
            }));
        }));
    }
    handleInvalidation(options, args, next) {
        if (options.beforeInvocation) {
            return (0, rxjs_1.from)(this.executeInvalidation(options, args)).pipe((0, operators_1.switchMap)(() => next.handle()));
        }
        return next.handle().pipe((0, operators_1.tap)(async () => {
            if (!options.condition || options.condition(args)) {
                await this.executeInvalidation(options, args);
            }
        }));
    }
    async executeInvalidation(options, args) {
        let keysToInvalidate = [];
        if (options.allEntries) {
            keysToInvalidate = ['*'];
        }
        else if (options.keys) {
            if (typeof options.keys === 'function') {
                const result = options.keys(args);
                keysToInvalidate = Array.isArray(result) ? result : [result];
            }
            else if (Array.isArray(options.keys)) {
                keysToInvalidate = options.keys;
            }
            else {
                keysToInvalidate = [options.keys];
            }
        }
        for (const key of keysToInvalidate) {
            await this.cacheService.delete(key);
            this.logger.debug(`Cache evicted: ${key}`);
        }
    }
    generateCacheKey(keyOption, args, methodName, className, request) {
        if (typeof keyOption === 'function') {
            return keyOption(args);
        }
        if (typeof keyOption === 'string') {
            return this.interpolateKey(keyOption, args, request);
        }
        const keyParts = [className, methodName];
        if (args && args.length > 0) {
            const argString = args
                .filter(arg => arg !== undefined && arg !== null)
                .map(arg => {
                if (typeof arg === 'object') {
                    return JSON.stringify(arg);
                }
                return String(arg);
            })
                .join(':');
            keyParts.push(argString);
        }
        if (request?.user?.id) {
            keyParts.push(`user:${request.user.id}`);
        }
        return keyParts.join(':');
    }
    interpolateKey(template, args, request) {
        return template.replace(/\{(\w+)\}/g, (match, key) => {
            for (let i = 0; i < args.length; i++) {
                if (args[i] && typeof args[i] === 'object' && args[i][key] !== undefined) {
                    return String(args[i][key]);
                }
            }
            if (request && request[key] !== undefined) {
                return String(request[key]);
            }
            if (request?.user && request.user[key] !== undefined) {
                return String(request.user[key]);
            }
            return match;
        });
    }
    extractArguments(context) {
        const type = context.getType();
        if (type === 'http') {
            const request = context.switchToHttp().getRequest();
            return [request.params, request.query, request.body].filter(Boolean);
        }
        if (type === 'ws') {
            return [context.switchToWs().getData()];
        }
        if (type === 'rpc') {
            return [context.switchToRpc().getData()];
        }
        return [];
    }
};
exports.CacheInterceptor = CacheInterceptor;
exports.CacheInterceptor = CacheInterceptor = CacheInterceptor_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        multi_layer_cache_service_1.MultiLayerCacheService,
        cache_invalidation_service_1.CacheInvalidationService])
], CacheInterceptor);
//# sourceMappingURL=cache.interceptor.js.map