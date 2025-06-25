/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

export const environment = {
  environmentName: 'local',
  production: false,
  development: true,
  apiUrl: 'https://dev.api.paretofactory.com/v01',
  enableLogging: true,
  enableDebugInfo: true,
  logLevel: 'debug',
  cognito: {
    region: 'us-west-2',
    userPoolId: 'us-west-2_kYxBT6G5H',
    userPoolClientId: '7172bfnjgp98t3pjhj0ktj7360'
  },
  features: {
    enableAnalytics: false,
    enableErrorReporting: false,
    enablePerformanceMonitoring: false,
    enableFeatureFlags: true
  },
  auth: {
    tokenRefreshBuffer: 300000, // 5 minutes in milliseconds
    sessionTimeout: 3600000, // 1 hour in milliseconds
    enableRememberMe: true
  },
  ui: {
    enableThemeToggle: true,
    defaultTheme: 'light',
    enableAnimations: true,
    showDebugPanel: true
  }
};
