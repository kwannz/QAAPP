import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
  ValidationPipe as NestValidationPipe,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';

@Injectable()
export class CustomValidationPipe extends NestValidationPipe {
  constructor() {
    super({
      whitelist: true, // 自动移除不在DTO中的属性
      forbidNonWhitelisted: true, // 如果存在不被允许的属性，抛出错误
      transform: true, // 自动转换类型
      transformOptions: {
        enableImplicitConversion: true, // 启用隐式类型转换
      },
      exceptionFactory: (validationErrors: ValidationError[] = []) => {
        return new BadRequestException({
          code: 'VALIDATION_ERROR',
          message: 'Validation failed',
          details: this.formatValidationErrors(validationErrors),
        });
      },
    });
  }

  private formatValidationErrors(errors: ValidationError[]): any {
    const formatError = (error: ValidationError): any => {
      const result: any = {
        field: error.property,
        value: error.value,
        constraints: {},
      };

      // 格式化约束错误信息
      if (error.constraints) {
        Object.keys(error.constraints).forEach((key) => {
          result.constraints[key] = {
            code: this.getConstraintCode(key),
            message: this.getConstraintMessage(key, error.constraints![key], error.property),
          };
        });
      }

      // 处理嵌套验证错误
      if (error.children && error.children.length > 0) {
        result.children = error.children.map(formatError);
      }

      return result;
    };

    return errors.map(formatError);
  }

  private getConstraintCode(constraintKey: string): string {
    const constraintCodeMap: Record<string, string> = {
      isEmail: 'INVALID_EMAIL',
      isString: 'INVALID_STRING',
      isNumber: 'INVALID_NUMBER',
      isBoolean: 'INVALID_BOOLEAN',
      isArray: 'INVALID_ARRAY',
      isObject: 'INVALID_OBJECT',
      isNotEmpty: 'FIELD_REQUIRED',
      minLength: 'MIN_LENGTH_ERROR',
      maxLength: 'MAX_LENGTH_ERROR',
      min: 'MIN_VALUE_ERROR',
      max: 'MAX_VALUE_ERROR',
      isUUID: 'INVALID_UUID',
      isUrl: 'INVALID_URL',
      isPhoneNumber: 'INVALID_PHONE_NUMBER',
      isDateString: 'INVALID_DATE',
      matches: 'PATTERN_MISMATCH',
      isEnum: 'INVALID_ENUM_VALUE',
      isOptional: 'FIELD_OPTIONAL',
      isDefined: 'FIELD_REQUIRED',
    };

    return constraintCodeMap[constraintKey] || 'VALIDATION_ERROR';
  }

  private getConstraintMessage(
    constraintKey: string,
    originalMessage: string,
    fieldName: string,
  ): string {
    // 自定义更友好的错误信息
    const friendlyMessages: Record<string, (field: string, message: string) => string> = {
      isEmail: (field) => `${field} must be a valid email address`,
      isNotEmpty: (field) => `${field} is required and cannot be empty`,
      minLength: (field, msg) => {
        const match = msg.match(/minimum of (\d+) characters/);
        const min = match ? match[1] : 'required';
        return `${field} must be at least ${min} characters long`;
      },
      maxLength: (field, msg) => {
        const match = msg.match(/maximum of (\d+) characters/);
        const max = match ? match[1] : 'allowed';
        return `${field} must not exceed ${max} characters`;
      },
      min: (field, msg) => {
        const match = msg.match(/minimum allowed value is (\d+)/);
        const min = match ? match[1] : '0';
        return `${field} must be at least ${min}`;
      },
      max: (field, msg) => {
        const match = msg.match(/maximum allowed value is (\d+)/);
        const max = match ? match[1] : 'the limit';
        return `${field} must not exceed ${max}`;
      },
      isString: (field) => `${field} must be a text value`,
      isNumber: (field) => `${field} must be a number`,
      isBoolean: (field) => `${field} must be true or false`,
      isArray: (field) => `${field} must be an array`,
      isObject: (field) => `${field} must be an object`,
      isUUID: (field) => `${field} must be a valid UUID`,
      isUrl: (field) => `${field} must be a valid URL`,
      isPhoneNumber: (field) => `${field} must be a valid phone number`,
      isDateString: (field) => `${field} must be a valid date string`,
      matches: (field) => `${field} format is invalid`,
      isEnum: (field, msg) => {
        // 尝试从原始消息中提取枚举值
        const match = msg.match(/must be one of the following values: (.+)/);
        const values = match ? match[1] : 'allowed values';
        return `${field} must be one of: ${values}`;
      },
    };

    const friendlyMessageFn = friendlyMessages[constraintKey];
    if (friendlyMessageFn) {
      return friendlyMessageFn(fieldName, originalMessage);
    }

    return originalMessage;
  }
}

// 特定的验证管道
@Injectable()
export class QueryValidationPipe extends CustomValidationPipe {
  constructor() {
    super();
  }

  async transform(value: any, metadata: ArgumentMetadata) {
    // 对于查询参数，需要特殊处理数组和对象
    if (value && typeof value === 'object') {
      // 处理数组字符串转换
      Object.keys(value).forEach((key) => {
        if (typeof value[key] === 'string' && value[key].startsWith('[') && value[key].endsWith(']')) {
          try {
            value[key] = JSON.parse(value[key]);
          } catch (e) {
            // 如果解析失败，保持原值
          }
        }
      });
    }

    return super.transform(value, metadata);
  }
}