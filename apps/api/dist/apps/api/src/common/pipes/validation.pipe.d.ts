import { ArgumentMetadata, ValidationPipe as NestValidationPipe } from '@nestjs/common';
export declare class CustomValidationPipe extends NestValidationPipe {
    constructor();
    private formatValidationErrors;
    private getConstraintCode;
    private getConstraintMessage;
}
export declare class QueryValidationPipe extends CustomValidationPipe {
    constructor();
    transform(value: any, metadata: ArgumentMetadata): Promise<any>;
}
