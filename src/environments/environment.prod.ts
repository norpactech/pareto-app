/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

export const environment = {
  production: true,
  development: false,
  environmentName: 'production',
  apiUrl: 'https://api.paretofactory.com/v01',
  enableLogging: false,
  enableDebugInfo: false,
  logLevel: 'error',  cognito: {
    region: 'us-west-2',
    userPoolId: 'us-west-2_kYxBT6G5H',
    userPoolClientId: '7172bfnjgp98t3pjhj0ktj7360'
  },
  features: {
    enableAnalytics: true,
    enableErrorReporting: true,
    enablePerformanceMonitoring: true,
    enableFeatureFlags: false
  },
  auth: {
    tokenRefreshBuffer: 300000, // 5 minutes in milliseconds
    sessionTimeout: 7200000, // 2 hours in milliseconds
    enableRememberMe: true
  },
  ui: {
    enableThemeToggle: true,
    defaultTheme: 'light',
    enableAnimations: true,
    showDebugPanel: false
  }
};
