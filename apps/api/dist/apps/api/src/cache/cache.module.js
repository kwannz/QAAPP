"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const event_emitter_1 = require("@nestjs/event-emitter");
const core_1 = require("@nestjs/core");
const multi_layer_cache_service_1 = require("./multi-layer-cache.service");
const cache_invalidation_service_1 = require("./cache-invalidation.service");
const cache_interceptor_1 = require("./cache.interceptor");
const cache_health_service_1 = require("./cache-health.service");
let CacheModule = class CacheModule {
};
exports.CacheModule = CacheModule;
exports.CacheModule = CacheModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            event_emitter_1.EventEmitterModule.forRoot({
                wildcard: true,
                delimiter: '.',
                newListener: false,
                removeListener: false,
                maxListeners: 20,
                verboseMemoryLeak: true
            })
        ],
        providers: [
            multi_layer_cache_service_1.MultiLayerCacheService,
            cache_invalidation_service_1.CacheInvalidationService,
            cache_health_service_1.CacheHealthService,
            {
                provide: core_1.APP_INTERCEPTOR,
                useClass: cache_interceptor_1.CacheInterceptor
            }
        ],
        exports: [
            multi_layer_cache_service_1.MultiLayerCacheService,
            cache_invalidation_service_1.CacheInvalidationService,
            cache_health_service_1.CacheHealthService
        ]
    })
], CacheModule);
//# sourceMappingURL=cache.module.js.map