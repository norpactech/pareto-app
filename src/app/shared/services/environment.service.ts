/**
 * Copyright (c) 2025 Northern Pacific Technologies, LLC
 * Licensed under the MIT License.
 */

import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EnvironmentService {
  
  get production(): boolean {
    return environment.production;
  }

  get development(): boolean {
    return environment.development;
  }

  get environmentName(): string {
    return environment.environmentName;
  }
  get apiUrl(): string {
    return environment.apiUrl;
  }

  get enableLogging(): boolean {
    return environment.enableLogging;
  }

  get enableDebugInfo(): boolean {
    return environment.enableDebugInfo;
  }

  get logLevel(): string {
    return environment.logLevel;
  }

  get features() {
    return environment.features;
  }

  get auth() {
    return environment.auth;
  }

  get cognito() {
    return environment.cognito;
  }

  get ui() {
    return environment.ui;
  }

  // Helper methods
  isFeatureEnabled(feature: keyof typeof environment.features): boolean {
    return environment.features[feature];
  }

  shouldShowDebugPanel(): boolean {
    return environment.ui.showDebugPanel;
  }

  getDefaultTheme(): string {
    return environment.ui.defaultTheme;
  }

  // Logging helper
  log(level: 'debug' | 'info' | 'warn' | 'error', message: string, ...args: unknown[]): void {
    if (!this.enableLogging) return;

    const logLevels = ['debug', 'info', 'warn', 'error'];
    const currentLevelIndex = logLevels.indexOf(this.logLevel);
    const messageLevelIndex = logLevels.indexOf(level);

    if (messageLevelIndex >= currentLevelIndex) {
      const logMethod = console[level] || console.log;
      logMethod(`[${this.environmentName.toUpperCase()}] ${message}`, ...args);
    }
  }
}
