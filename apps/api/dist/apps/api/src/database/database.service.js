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
var DatabaseService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DatabaseService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const database_1 = require("@qa-app/database");
const error_utils_1 = require("../common/utils/error.utils");
let DatabaseService = DatabaseService_1 = class DatabaseService extends database_1.PrismaClient {
    constructor(configService) {
        const databaseUrl = configService.get('DATABASE_URL');
        const nodeEnv = configService.get('NODE_ENV', 'development');
        super({
            datasources: {
                db: {
                    url: databaseUrl,
                },
            },
            log: nodeEnv === 'development' ? [
                {
                    emit: 'event',
                    level: 'query',
                },
                {
                    emit: 'event',
                    level: 'error',
                },
                {
                    emit: 'event',
                    level: 'info',
                },
                {
                    emit: 'event',
                    level: 'warn',
                },
            ] : [
                {
                    emit: 'event',
                    level: 'error',
                },
                {
                    emit: 'event',
                    level: 'warn',
                },
            ],
        });
        this.configService = configService;
        this.logger = new common_1.Logger(DatabaseService_1.name);
        this.$on('query', (e) => {
            this.logger.debug(`Query: ${e.query}`);
            this.logger.debug(`Duration: ${e.duration}ms`);
        });
        this.$on('error', (e) => {
            this.logger.error(e);
        });
        this.$on('info', (e) => {
            this.logger.log(e);
        });
        this.$on('warn', (e) => {
            this.logger.warn(e);
        });
    }
    async onModuleInit() {
        try {
            await this.$connect();
            this.logger.log('✅ Database connection established successfully');
            const result = await this.$queryRaw `SELECT 1 as test`;
            this.logger.log('🔍 Database health check passed', result);
        }
        catch (error) {
            this.logger.error('❌ Failed to connect to database:', error);
            throw error;
        }
    }
    async onModuleDestroy() {
        await this.$disconnect();
        this.logger.log('🔌 Database connection closed');
    }
    async healthCheck() {
        try {
            await this.$queryRaw `SELECT 1`;
            return { status: 'healthy', timestamp: new Date().toISOString() };
        }
        catch (error) {
            this.logger.error('Database health check failed:', error);
            return { status: 'unhealthy', error: (0, error_utils_1.getErrorMessage)(error), timestamp: new Date().toISOString() };
        }
    }
};
exports.DatabaseService = DatabaseService;
exports.DatabaseService = DatabaseService = DatabaseService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], DatabaseService);
//# sourceMappingURL=database.service.js.map