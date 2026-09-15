import eslint from '@eslint/js';
import angular from 'angular-eslint';
import prettierRecommended from 'eslint-plugin-prettier/recommended';
import { defineConfig } from 'eslint/config';
import tseslint from 'typescript-eslint';

export default defineConfig(
  {
    ignores: ['projects/**/*'],
  },

  {
    files: ['**/*.ts'],
    ignores: ['cypress/**/*.ts', 'cypress.config.ts'],

    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
      prettierRecommended,
    ],

    processor: angular.processInlineTemplates,

    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      '@angular-eslint/prefer-standalone': 'off',

      '@angular-eslint/component-class-suffix': [
        'warn',
        {
          suffixes: ['Component', 'Page', 'Form', 'Dialog'],
        },
      ],

      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'app',
          style: 'kebab-case',
        },
      ],

      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'app',
          style: 'camelCase',
        },
      ],

      'prettier/prettier': 'error',

      'no-console': [
        'warn',
        {
          allow: ['warn', 'error'],
        },
      ],

      'no-debugger': 'error',

      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],

      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/no-floating-promises': 'error',

      '@angular-eslint/directive-class-suffix': [
        'warn',
        {
          suffixes: ['Directive'],
        },
      ],

      '@angular-eslint/no-empty-lifecycle-method': 'warn',
      '@angular-eslint/use-lifecycle-interface': 'warn',
      '@angular-eslint/prefer-on-push-component-change-detection': 'warn',
    },
  },

  {
    files: ['src/app/**/*.html'],

    extends: [...angular.configs.templateRecommended, prettierRecommended],

    rules: {
      '@angular-eslint/template/eqeqeq': 'error',
      '@angular-eslint/template/no-negated-async': 'warn',
    },
  },

  {
    files: ['cypress/**/*.ts', 'cypress.config.ts'],

    extends: [eslint.configs.recommended, ...tseslint.configs.recommended, prettierRecommended],

    languageOptions: {
      parserOptions: {
        project: ['./cypress/tsconfig.json'],
        tsconfigRootDir: import.meta.dirname,
      },
    },

    rules: {
      'prettier/prettier': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': 'error',
    },
  },
);
