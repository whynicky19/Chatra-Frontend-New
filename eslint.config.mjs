import js from '@eslint/js'
import vue from 'eslint-plugin-vue'
import tsParser from '@typescript-eslint/parser'
import vueParser from 'vue-eslint-parser'

export default [
  {
    ignores: [
      '.nuxt/**', '.output/**', 'dist/**', 'node_modules/**',
      'coverage/**', 'playwright-report/**', 'test-results/**', 'venv/**', '.venv/**',
    ],
  },
  js.configs.recommended,
  ...vue.configs['flat/essential'],
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tsParser,
      parserOptions: { ecmaVersion: 'latest', sourceType: 'module' },
      globals: {
        defineNuxtConfig: 'readonly', defineNuxtPlugin: 'readonly', definePageMeta: 'readonly',
        navigateTo: 'readonly', useHead: 'readonly', useRuntimeConfig: 'readonly',
        window: 'readonly', document: 'readonly', navigator: 'readonly', localStorage: 'readonly',
        URLSearchParams: 'readonly', FormData: 'readonly', File: 'readonly', Blob: 'readonly',
        HTMLElement: 'readonly', KeyboardEvent: 'readonly', BroadcastChannel: 'readonly',
        fetch: 'readonly', console: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly',
      },
    },
    rules: {
      // Type checking owns symbol usage; disabling the base rule avoids false
      // positives for Vue templates and type-only declarations.
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-useless-assignment': 'off',
      'no-control-regex': 'off',
    },
  },
  {
    files: ['**/*.vue'],
    languageOptions: {
      parser: vueParser,
      parserOptions: { parser: tsParser, ecmaVersion: 'latest', sourceType: 'module' },
      globals: {
        window: 'readonly', document: 'readonly', navigator: 'readonly', localStorage: 'readonly',
        URLSearchParams: 'readonly', FormData: 'readonly', File: 'readonly', Blob: 'readonly',
        HTMLElement: 'readonly', KeyboardEvent: 'readonly', BroadcastChannel: 'readonly',
        fetch: 'readonly', console: 'readonly', setTimeout: 'readonly', clearTimeout: 'readonly',
      },
    },
    rules: {
      'no-undef': 'off',
      'no-unused-vars': 'off',
      'no-empty': ['error', { allowEmptyCatch: true }],
      'no-useless-assignment': 'off',
      'no-control-regex': 'off',
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'off',
      'vue/no-unused-vars': 'off',
      'vue/no-parsing-error': 'off',
    },
  },
]
