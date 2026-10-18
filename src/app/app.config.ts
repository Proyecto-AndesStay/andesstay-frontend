import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS, withFetch } from '@angular/common/http';
import { MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MSAL_GUARD_CONFIG, MsalService, MsalGuard, MsalBroadcastService, MsalInterceptor } from '@azure/msal-angular';
import { msalInstanceFactory, msalGuardConfigFactory, msalInterceptorConfigFactory } from '../config/msal.config';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideHttpClient(withInterceptorsFromDi(), withFetch()), 
    
    { provide: HTTP_INTERCEPTORS, useClass: MsalInterceptor, multi: true },
    { provide: MSAL_INSTANCE, useFactory: msalInstanceFactory },
    { provide: MSAL_GUARD_CONFIG, useFactory: msalGuardConfigFactory },
    { provide: MSAL_INTERCEPTOR_CONFIG, useFactory: msalInterceptorConfigFactory },
    
    MsalService,
    MsalGuard,
    MsalBroadcastService
  ]
};