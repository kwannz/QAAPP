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
var CacheInvalidationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheInvalidationService = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const multi_layer_cache_service_1 = require("./multi-layer-cache.service");
let CacheInvalidationService = CacheInvalidationService_1 = class CacheInvalidationService {
    constructor(cacheService, eventEmitter) {
        this.cacheService = cacheService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(CacheInvalidationService_1.name);
        this.invalidationRules = new Map();
        this.delayedInvalidations = new Map();
        this.setupInvalidationRules();
    }
    onModuleDestroy() {
        this.logger.log('Cleaning up Cache Invalidation Service...');
        for (const [key, timeout] of this.delayedInvalidations.entries()) {
            clearTimeout(timeout);
        }
        this.delayedInvalidations.clear();
        this.logger.log('Cache Invalidation Service cleanup completed');
    }
    setupInvalidationRules() {
        const rules = [
            {
                entity: 'user',
                patterns: [
                    'user:*',
                    'user:profile:*',
                    'user:permissions:*',
                    'user:audit:*'
                ],
                dependencies: ['audit_logs', 'user_permissions']
            },
            {
                entity: 'position',
                patterns: [
                    'position:*',
                    'position:user:*',
                    'market:position:*',
                    'analytics:position:*'
                ],
                dependencies: ['user', 'audit_logs'],
                delay: 1000
            },
            {
                entity: 'order',
                patterns: [
                    'order:*',
                    'order:user:*',
                    'order:position:*',
                    'analytics:order:*'
                ],
                dependencies: ['position', 'user', 'audit_logs']
            },
            {
                entity: 'audit_log',
                patterns: [
                    'audit:*',
                    'audit:user:*',
                    'audit:entity:*'
                ],
                dependencies: []
            },
            {
                entity: 'market_data',
                patterns: [
                    'market:*',
                    'market:symbol:*',
                    'analytics:market:*'
                ],
                dependencies: ['position'],
                delay: 5000
            }
        ];
        rules.forEach(rule => {
            this.invalidationRules.set(rule.entity, rule);
        });
        this.logger.log(`Loaded ${rules.length} cache invalidation rules`);
    }
    async handleUserEvent(event) {
        this.logger.debug(`User event: ${event.action} for user ${event.id}`);
        await this.invalidateEntity('user', event.id?.toString());
    }
    async handlePositionEvent(event) {
        this.logger.debug(`Position event: ${event.action} for position ${event.id}`);
        await this.invalidateEntity('position', event.id?.toString());
        if (event.userId) {
            await this.invalidateUserRelated(event.userId);
        }
    }
    async handleOrderEvent(event) {
        this.logger.debug(`Order event: ${event.action} for order ${event.id}`);
        await this.invalidateEntity('order', event.id?.toString());
        if (event.userId) {
            await this.invalidateUserRelated(event.userId);
        }
        if (event.metadata?.positionId) {
            await this.invalidateEntity('position', event.metadata.positionId);
        }
    }
    async handleAuditEvent(event) {
        this.logger.debug(`Audit event: ${event.action} for audit ${event.id}`);
        await this.invalidateEntity('audit_log', event.id?.toString());
    }
    async handleMarketEvent(event) {
        this.logger.debug(`Market event: ${event.action} for symbol ${event.id}`);
        await this.invalidateEntity('market_data', event.id?.toString());
    }
    async invalidateEntity(entity, id) {
        const rule = this.invalidationRules.get(entity);
        if (!rule) {
            this.logger.warn(`No invalidation rule found for entity: ${entity}`);
            return;
        }
        const invalidationKey = `${entity}:${id || 'all'}`;
        if (rule.delay) {
            this.handleDelayedInvalidation(invalidationKey, rule, id);
            return;
        }
        await this.executeInvalidation(rule, id);
    }
    handleDelayedInvalidation(key, rule, id) {
        if (this.delayedInvalidations.has(key)) {
            clearTimeout(this.delayedInvalidations.get(key));
        }
        const timeout = setTimeout(async () => {
            await this.executeInvalidation(rule, id);
            this.delayedInvalidations.delete(key);
        }, rule.delay);
        this.delayedInvalidations.set(key, timeout);
        this.logger.debug(`Scheduled delayed invalidation for ${key} in ${rule.delay}ms`);
    }
    async executeInvalidation(rule, id) {
        const patterns = rule.patterns.map(pattern => id ? pattern.replace('*', id) : pattern);
        const invalidationPromises = patterns.map(async (pattern) => {
            try {
                const deleted = await this.cacheService.delete(pattern);
                this.logger.debug(`Invalidated cache pattern: ${pattern}, deleted: ${deleted}`);
                return { pattern, success: true, deleted };
            }
            catch (error) {
                this.logger.error(`Failed to invalidate cache pattern: ${pattern}`, error);
                return { pattern, success: false, error };
            }
        });
        const results = await Promise.allSettled(invalidationPromises);
        const failedCount = results.filter(r => r.status === 'rejected').length;
        if (failedCount > 0) {
            this.logger.warn(`Cache invalidation completed with ${failedCount} failures for entity: ${rule.entity}`);
        }
        else {
            this.logger.debug(`Cache invalidation completed successfully for entity: ${rule.entity}`);
        }
        await this.handleDependencyInvalidation(rule.dependencies, id);
    }
    async handleDependencyInvalidation(dependencies, id) {
        if (dependencies.length === 0)
            return;
        const dependencyPromises = dependencies.map(dep => this.invalidateEntity(dep, id));
        await Promise.allSettled(dependencyPromises);
    }
    async invalidateUserRelated(userId) {
        const userPatterns = [
            `user:${userId}:*`,
            `position:user:${userId}:*`,
            `order:user:${userId}:*`,
            `audit:user:${userId}:*`
        ];
        await Promise.all(userPatterns.map(pattern => this.cacheService.delete(pattern)));
    }
    async manualInvalidate(entity, id, reason) {
        this.logger.log(`Manual cache invalidation: entity=${entity}, id=${id}, reason=${reason}`);
        const event = {
            entity,
            id,
            action: 'update',
            timestamp: Date.now(),
            metadata: { reason, manual: true }
        };
        this.eventEmitter.emit(`${entity}.manual`, event);
    }
    async batchInvalidate(entities) {
        this.logger.log(`Batch cache invalidation for ${entities.length} entities`);
        const promises = entities.map(({ entity, id }) => this.invalidateEntity(entity, id?.toString()));
        await Promise.allSettled(promises);
    }
    async globalClear(confirmation) {
        if (confirmation !== 'CONFIRM_GLOBAL_CLEAR') {
            throw new Error('Invalid confirmation for global cache clear');
        }
        this.logger.warn('Executing global cache clear');
        this.delayedInvalidations.forEach(timeout => clearTimeout(timeout));
        this.delayedInvalidations.clear();
        await this.cacheService.delete('*');
        this.logger.warn('Global cache clear completed');
    }
    async getInvalidationStats() {
        return {
            rules: this.invalidationRules.size,
            delayedInvalidations: this.delayedInvalidations.size,
            recentInvalidations: []
        };
    }
};
exports.CacheInvalidationService = CacheInvalidationService;
__decorate([
    (0, event_emitter_1.OnEvent)('user.*'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CacheInvalidationService.prototype, "handleUserEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('position.*'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CacheInvalidationService.prototype, "handlePositionEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('order.*'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CacheInvalidationService.prototype, "handleOrderEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('audit.*'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CacheInvalidationService.prototype, "handleAuditEvent", null);
__decorate([
    (0, event_emitter_1.OnEvent)('market.*'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CacheInvalidationService.prototype, "handleMarketEvent", null);
exports.CacheInvalidationService = CacheInvalidationService = CacheInvalidationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [multi_layer_cache_service_1.MultiLayerCacheService,
        event_emitter_1.EventEmitter2])
], CacheInvalidationService);
//# sourceMappingURL=cache-invalidation.service.js.map