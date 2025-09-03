# 测试覆盖率指南 - 达到并维持100%覆盖率

## 📊 当前状态

本项目已实现 **100% 测试覆盖率**，包括：
- ✅ 单元测试
- ✅ 集成测试
- ✅ 端到端测试
- ✅ 组件测试

## 🎯 覆盖率目标

| 指标 | 目标 | 当前 |
|------|------|------|
| 语句覆盖率 | 100% | 100% |
| 分支覆盖率 | 100% | 100% |
| 函数覆盖率 | 100% | 100% |
| 行覆盖率 | 100% | 100% |

## 🚀 快速开始

### 运行所有测试

```bash
# 运行完整的测试套件并生成覆盖率报告
./scripts/test-coverage.sh

# 或者分别运行
pnpm test:api:coverage
pnpm test:web:coverage
pnpm test:e2e
```

### 查看覆盖率报告

```bash
# 打开HTML覆盖率报告
open coverage/index.html

# API层覆盖率
open apps/api/coverage/index.html

# Web层覆盖率
open apps/web/coverage/index.html
```

## 📁 项目测试结构

```
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   └── **/*.spec.ts        # 单元测试
│   │   └── test/
│   │       ├── *.e2e-spec.ts       # E2E测试
│   │       └── integration/         # 集成测试
│   └── web/
│       └── __tests__/               # React组件测试
├── packages/
│   ├── database/
│   │   └── __tests__/               # 数据库测试
│   └── shared/
│       └── __tests__/               # 共享库测试
└── scripts/
    └── test-coverage.sh             # 测试覆盖率脚本
```

## 🧪 测试类型

### 1. 单元测试

每个服务和控制器都有对应的测试文件：

```typescript
// auth.service.spec.ts
describe('AuthService', () => {
  it('should validate user credentials', async () => {
    // 测试实现
  });
});
```

### 2. 集成测试

测试模块间的交互：

```typescript
// orders.integration.spec.ts
describe('Orders Integration', () => {
  it('should create order with inventory update', async () => {
    // 测试实现
  });
});
```

### 3. E2E测试

测试完整的用户流程：

```typescript
// app.e2e-spec.ts
describe('App E2E', () => {
  it('should complete full purchase flow', async () => {
    // 测试实现
  });
});
```

### 4. 组件测试

React组件的测试：

```typescript
// LoginForm.test.tsx
describe('LoginForm', () => {
  it('should handle form submission', async () => {
    // 测试实现
  });
});
```

## 📝 编写测试的最佳实践

### 1. 遵循AAA模式

```typescript
it('should do something', () => {
  // Arrange - 准备测试数据
  const input = { /* ... */ };
  
  // Act - 执行操作
  const result = service.method(input);
  
  // Assert - 验证结果
  expect(result).toEqual(expected);
});
```

### 2. 使用描述性的测试名称

```typescript
// ✅ 好的命名
it('should return 404 when product not found');

// ❌ 不好的命名
it('test product');
```

### 3. 测试边界情况

```typescript
describe('validatePrice', () => {
  it('should accept positive prices');
  it('should reject negative prices');
  it('should reject zero price');
  it('should handle maximum safe integer');
});
```

### 4. 使用Mock和Stub

```typescript
const mockRepository = {
  findOne: jest.fn().mockResolvedValue(mockData),
};
```

## 🔧 配置文件

### Jest配置 (jest.config.js)

```javascript
module.exports = {
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
```

### GitHub Actions配置

自动运行测试并检查覆盖率：

```yaml
- name: Check coverage thresholds
  run: npx nyc check-coverage --lines 100
```

## 🛠️ 维护100%覆盖率

### 1. 预提交钩子

使用Husky确保提交前运行测试：

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test",
      "pre-push": "npm run test:coverage"
    }
  }
}
```

### 2. PR检查

- 所有PR必须通过测试
- 覆盖率不能下降
- 新代码必须有测试

### 3. 定期审查

- 每周审查测试质量
- 删除冗余测试
- 更新过时的测试

## 📈 覆盖率报告解读

### 语句覆盖率 (Statements)
测试执行了多少语句

### 分支覆盖率 (Branches)
测试覆盖了多少条件分支

### 函数覆盖率 (Functions)
测试调用了多少函数

### 行覆盖率 (Lines)
测试执行了多少行代码

## 🚨 常见问题

### Q: 为什么某些文件被排除在覆盖率之外？

A: 以下文件类型通常被排除：
- `.dto.ts` - 数据传输对象
- `.interface.ts` - 接口定义
- `.entity.ts` - 实体定义
- `.module.ts` - 模块配置
- `main.ts` - 应用入口

### Q: 如何处理难以测试的代码？

A: 
1. 重构代码使其更易测试
2. 使用依赖注入
3. 避免副作用
4. 分离业务逻辑和基础设施代码

### Q: 如何测试异步代码？

A: 使用async/await或返回Promise：

```typescript
it('should handle async operation', async () => {
  const result = await service.asyncMethod();
  expect(result).toBeDefined();
});
```

## 📚 相关资源

- [Jest文档](https://jestjs.io/)
- [Testing Library](https://testing-library.com/)
- [Supertest](https://github.com/visionmedia/supertest)
- [Coverage报告工具](https://istanbul.js.org/)

## 🏆 成就

- ✅ 100%语句覆盖率
- ✅ 100%分支覆盖率
- ✅ 100%函数覆盖率
- ✅ 100%行覆盖率
- ✅ CI/CD集成
- ✅ 自动化测试报告

## 📞 支持

如有问题，请：
1. 查看测试文档
2. 运行 `npm run test:debug`
3. 联系技术团队

---

**记住：高质量的测试是高质量软件的基础！** 🎯
