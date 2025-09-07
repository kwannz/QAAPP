module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  plugins: [
    '@typescript-eslint',
    'import',
    'promise',
    'unicorn'
  ],
  extends: [
    'eslint:recommended',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:import/typescript',
    'plugin:promise/recommended',
    'plugin:unicorn/recommended'
  ],
  parserOptions: {
    ecmaVersion: 2022,
    sourceType: 'module',
    projectService: true,
    tsconfigRootDir: __dirname,
  },
  env: {
    node: true,
    es2022: true,
    jest: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        alwaysTryTypes: true,
        project: './tsconfig.json',
      },
      node: {
        extensions: ['.js', '.jsx', '.ts', '.tsx']
      }
    }
  },
  rules: {
    // TypeScript规则
    '@typescript-eslint/no-unused-vars': ['error', { 
      argsIgnorePattern: '^_',
      varsIgnorePattern: '^_',
      ignoreRestSiblings: true
    }],
    '@typescript-eslint/no-explicit-any': 'warn', // 降级为警告
    '@typescript-eslint/prefer-nullish-coalescing': 'off', // 需要strictNullChecks
    '@typescript-eslint/prefer-optional-chain': 'error',
    '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/no-inferrable-types': 'error',
    '@typescript-eslint/no-unnecessary-type-assertion': 'error',
    '@typescript-eslint/prefer-as-const': 'error',
    '@typescript-eslint/prefer-reduce-type-parameter': 'error',
    '@typescript-eslint/promise-function-async': 'error',
    '@typescript-eslint/require-await': 'error',
    '@typescript-eslint/return-await': 'error',
    '@typescript-eslint/strict-boolean-expressions': 'off', // 需要strictNullChecks
    '@typescript-eslint/switch-exhaustiveness-check': 'error',
    '@typescript-eslint/prefer-string-starts-ends-with': 'error',
    '@typescript-eslint/prefer-includes': 'error',

    // 导入规则
    'import/order': ['error', {
      'groups': [
        'builtin',
        'external', 
        'internal',
        'parent',
        'sibling',
        'index',
        'object'
      ],
      'newlines-between': 'always',
      'alphabetize': {
        order: 'asc',
        caseInsensitive: true
      }
    }],
    'import/no-unresolved': 'error',
    'import/no-cycle': 'error',
    'import/no-self-import': 'error',
    'import/no-useless-path-segments': 'error',
    'import/no-duplicates': 'error',

    // Security rules disabled - eslint-plugin-security@3.0.1 incompatible with ESLint@8.57.1
    // Consider upgrading to ESLint v9+ for security rule compatibility

    // Promise规则
    'promise/always-return': 'error',
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-nesting': 'error',
    'promise/no-promise-in-callback': 'error',
    'promise/no-callback-in-promise': 'error',
    'promise/avoid-new': 'error',

    // Unicorn规则 (现代JavaScript最佳实践)
    'unicorn/filename-case': ['error', {
      cases: {
        kebabCase: true,
        camelCase: true,
        pascalCase: true
      }
    }],
    'unicorn/no-array-instanceof': 'error',
    'unicorn/no-console-spaces': 'error',
    'unicorn/no-for-loop': 'error',
    'unicorn/prefer-includes': 'error',
    'unicorn/prefer-string-starts-ends-with': 'error',
    'unicorn/prefer-string-trim-start-end': 'error',
    'unicorn/prefer-type-error': 'error',
    'unicorn/throw-new-error': 'error',
    'unicorn/prefer-node-protocol': 'error',
    'unicorn/prefer-module': 'error',

    // 通用代码质量规则
    'no-console': 'warn',
    'no-debugger': 'error',
    'no-alert': 'error',
    'no-var': 'error',
    'prefer-const': 'error',
    'prefer-arrow-callback': 'error',
    'prefer-template': 'error',
    'prefer-spread': 'error',
    'prefer-rest-params': 'error',
    'prefer-destructuring': ['error', {
      array: true,
      object: true
    }],
    'object-shorthand': 'error',
    'quote-props': ['error', 'as-needed'],
    'no-unneeded-ternary': 'error',
    'no-nested-ternary': 'error',
    'no-duplicate-imports': 'error',
    'no-useless-rename': 'error',
    'no-useless-return': 'error',
    'no-useless-constructor': 'error',
    'no-useless-computed-key': 'error',
    'no-useless-concat': 'error',
    'no-lonely-if': 'error',
    'no-else-return': 'error',
    'no-empty-function': 'error',
    'no-implicit-coercion': 'error',
    'no-magic-numbers': ['error', {
      ignore: [0, 1, -1],
      ignoreArrayIndexes: true,
      ignoreDefaultValues: true,
      detectObjects: false
    }],
    'no-shadow': 'off', // 使用TypeScript版本
    '@typescript-eslint/no-shadow': 'error',
    'no-param-reassign': 'error',
    'no-return-assign': 'error',
    'no-sequences': 'error',
    'no-throw-literal': 'error',
    'no-undef-init': 'error',
    'no-undefined': 'error',
    'no-underscore-dangle': ['error', {
      allowAfterThis: true,
      allowAfterSuper: true,
      enforceInMethodNames: false,
      allowFunctionParams: false
    }],

    // 代码风格
    'array-bracket-spacing': ['error', 'never'],
    'block-spacing': 'error',
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'comma-dangle': ['error', 'always-multiline'],
    'comma-spacing': 'error',
    'comma-style': 'error',
    'computed-property-spacing': 'error',
    'eol-last': 'error',
    'func-call-spacing': 'error',
    'indent': 'off', // 禁用由于与React/JSX冲突导致的递归问题
    'key-spacing': 'error',
    'keyword-spacing': 'error',
    'line-comment-position': 'off', // 禁用内联注释位置规则
    'lines-around-comment': ['error', {
      beforeBlockComment: true,
      beforeLineComment: true,
      allowBlockStart: true,
      allowObjectStart: true,
      allowArrayStart: true
    }],
    'max-len': ['error', {
      code: 120,
      tabWidth: 2,
      ignoreUrls: true,
      ignoreStrings: true,
      ignoreTemplateLiterals: true,
      ignoreRegExpLiterals: true
    }],
    'multiline-ternary': ['error', 'always-multiline'],
    'new-cap': 'error',
    'newline-per-chained-call': ['error', { ignoreChainWithDepth: 3 }],
    'no-mixed-spaces-and-tabs': 'error',
    'no-multiple-empty-lines': ['error', { max: 2, maxBOF: 0, maxEOF: 1 }],
    'no-tabs': 'error',
    'no-trailing-spaces': 'error',
    'no-whitespace-before-property': 'error',
    'object-curly-spacing': ['error', 'always'],
    'operator-linebreak': ['error', 'before'],
    'padded-blocks': ['error', 'never'],
    'quotes': ['error', 'single', { avoidEscape: true }],
    'semi': ['error', 'always'],
    'semi-spacing': 'error',
    'space-before-blocks': 'error',
    'space-before-function-paren': ['error', {
      anonymous: 'always',
      named: 'never',
      asyncArrow: 'always'
    }],
    'space-in-parens': 'error',
    'space-infix-ops': 'error',
    'space-unary-ops': 'error',
    'spaced-comment': 'error'
  },
  overrides: [
    {
      // API项目特定规则
      files: ['apps/api/**/*.ts'],
      rules: {
        'unicorn/prefer-module': 'off', // Node.js可能需要CommonJS
        '@typescript-eslint/no-var-requires': 'error'
      }
    },
    {
      // Web项目特定规则  
      files: ['apps/web/**/*.{ts,tsx}'],
      extends: [
        // Use Next.js recommended rules for App Router projects
        'next',
        'next/core-web-vitals'
      ],
      plugins: [],
      settings: {
        react: {
          version: 'detect'
        }
      },
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      env: {
        browser: true
      },
      rules: {
        // Tune severities to reduce noise while we refactor
        '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', ignoreRestSiblings: true }],
        '@typescript-eslint/require-await': 'warn',
        '@typescript-eslint/promise-function-async': 'warn',
        'import/order': 'warn',
        'no-implicit-coercion': 'warn',
        'no-magic-numbers': ['warn', { ignore: [0, 1, -1], ignoreArrayIndexes: true, ignoreDefaultValues: true, detectObjects: false }],
        'no-undefined': 'off',
        'operator-linebreak': 'warn',
        'max-len': ['warn', { code: 120, tabWidth: 2, ignoreUrls: true, ignoreStrings: true, ignoreTemplateLiterals: true, ignoreRegExpLiterals: true }],
        'comma-dangle': ['warn', 'always-multiline'],
        'unicorn/no-null': 'off',
        'unicorn/no-nested-ternary': 'warn',
        'unicorn/prevent-abbreviations': 'warn',
        'react/no-array-index-key': 'warn',
        'no-console': 'warn',

        // React规则
        'react/react-in-jsx-scope': 'off', // Next.js不需要导入React
        'react/prop-types': 'off', // 使用TypeScript
        'react/jsx-uses-react': 'off',
        'react/jsx-uses-vars': 'error',
        'react/jsx-no-undef': 'error',
        'react/jsx-fragments': 'error',
        'react/jsx-boolean-value': 'error',
        'react/jsx-closing-bracket-location': 'error',
        'react/jsx-closing-tag-location': 'error',
        'react/jsx-curly-spacing': 'error',
        'react/jsx-equals-spacing': 'error',
        'react/jsx-first-prop-new-line': 'error',
        'react/jsx-indent': 'off', // 禁用避免与通用indent规则冲突
        'react/jsx-indent-props': 'off', // 禁用避免与通用indent规则冲突
        'react/jsx-max-props-per-line': ['error', { maximum: 3 }],
        'react/jsx-no-duplicate-props': 'error',
        'react/jsx-no-useless-fragment': 'error',
        'react/jsx-props-no-multi-spaces': 'error',
        'react/jsx-tag-spacing': 'error',
        'react/jsx-wrap-multilines': 'error',
        'react/no-array-index-key': 'error',
        'react/no-danger': 'error',
        'react/no-deprecated': 'error',
        'react/no-direct-mutation-state': 'error',
        'react/no-unused-state': 'error',
        'react/prefer-stateless-function': 'error',
        'react/self-closing-comp': 'error',

        // React Hooks规则（keep strict to avoid runtime bugs）
        'react-hooks/rules-of-hooks': 'error',
        'react-hooks/exhaustive-deps': 'error',

        // 可访问性规则
        'jsx-a11y/alt-text': 'error',
        'jsx-a11y/anchor-has-content': 'error',
        'jsx-a11y/anchor-is-valid': 'error',
        'jsx-a11y/aria-activedescendant-has-tabindex': 'error',
        'jsx-a11y/aria-props': 'error',
        'jsx-a11y/aria-proptypes': 'error',
        'jsx-a11y/aria-role': 'error',
        'jsx-a11y/aria-unsupported-elements': 'error',
        'jsx-a11y/click-events-have-key-events': 'error',
        'jsx-a11y/heading-has-content': 'error',
        'jsx-a11y/img-redundant-alt': 'error',
        'jsx-a11y/mouse-events-have-key-events': 'error',
        'jsx-a11y/no-access-key': 'error',
        'jsx-a11y/role-has-required-aria-props': 'error',
        'jsx-a11y/role-supports-aria-props': 'error'
      }
    },
    {
      // 测试文件特定规则
      files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
      extends: ['plugin:jest/recommended'],
      plugins: ['jest'],
      env: {
        jest: true
      },
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        'no-magic-numbers': 'off',
        'max-len': 'off'
      }
    },
    {
      // 配置文件规则
      files: ['*.config.{js,ts}', '.eslintrc.js'],
      rules: {
        'unicorn/prefer-module': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        'no-magic-numbers': 'off'
      }
    }
  ],
  ignorePatterns: [
    'node_modules/',
    'dist/',
    'build/',
    '.next/',
    '*.min.js',
    'coverage/',
    '.turbo/',
    '*.d.ts'
  ]
};
