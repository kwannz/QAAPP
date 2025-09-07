import { ConfigService } from '@nestjs/config';
export declare class AppModule {
    private configService;
    private readonly logger;
    constructor(configService: ConfigService);
}
