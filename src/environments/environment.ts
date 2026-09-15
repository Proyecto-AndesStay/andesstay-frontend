export const environment = {
  production: false,
  apiBaseUrl: 'https://j1xya1b75e.execute-api.us-east-1.amazonaws.com/api',

  azure: {
    clientId: 'ad0920b4-a99e-449b-8df0-6703cf2402ed',
    tenantId: 'df536a4e-3386-4046-9c97-d8e41c89806d',
    authority: 'https://login.microsoftonline.com/df536a4e-3386-4046-9c97-d8e41c89806d',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    protectedResourceScopes: ['api://ad0920b4-a99e-449b-8df0-6703cf2402ed/access_as_user']
  }
};