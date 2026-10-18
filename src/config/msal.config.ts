import {
  IPublicClientApplication,
  PublicClientApplication,
  InteractionType,
  LogLevel,
  BrowserCacheLocation,
} from '@azure/msal-browser';
import {
  MsalGuardConfiguration,
  MsalInterceptorConfiguration,
} from '@azure/msal-angular';
import { environment } from '../environments/environment';

const msalInstance = new PublicClientApplication({
  auth: {
    clientId: environment.azure.clientId,
    authority: environment.azure.authority,
    redirectUri: environment.azure.redirectUri,
    postLogoutRedirectUri: environment.azure.postLogoutRedirectUri,
  },
  cache: {
    cacheLocation: BrowserCacheLocation.LocalStorage,
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (level === LogLevel.Error) console.error(message);
      },
      logLevel: environment.production ? LogLevel.Error : LogLevel.Warning,
      piiLoggingEnabled: false,
    },
  },
});

// ❌ QUITAMOS DE AQUÍ EL "getAllAccounts()" PARA EVITAR EL ERROR DE INICIALIZACIÓN

export function msalInstanceFactory(): IPublicClientApplication {
  return msalInstance;
}

export function msalGuardConfigFactory(): MsalGuardConfiguration {
  return {
    interactionType: InteractionType.Redirect,
    authRequest: {
      scopes: [...environment.azure.protectedResourceScopes, 'user.read'],
    },
    loginFailedRoute: '/login-failed',
  };
}

export function msalInterceptorConfigFactory(): MsalInterceptorConfiguration {
  const protectedResourceMap = new Map<string, Array<string> | null>();

  protectedResourceMap.set(
    environment.apiBaseUrl,
    environment.azure.protectedResourceScopes
  );
  protectedResourceMap.set(
    `${environment.apiBaseUrl}/*`,
    environment.azure.protectedResourceScopes
  );

  return {
    interactionType: InteractionType.Redirect,
    protectedResourceMap,
  };
}