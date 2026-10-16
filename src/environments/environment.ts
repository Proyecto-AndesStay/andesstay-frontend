export const environment = {
  production: false,
  apiBaseUrl: 'https://j1xya1b75e.execute-api.us-east-1.amazonaws.com/api',

  azure: {
    clientId: '086deb4c-cded-42b0-8dfb-ab7cdb7e0346',
    tenantId: 'df536a4e-3386-4046-9c97-d8e41c89806d',
    authority: 'https://login.microsoftonline.com/df536a4e-3386-4046-9c97-d8e41c89806d',
    redirectUri: 'https://frontend-andesstay.vercel.app',
    postLogoutRedirectUri: 'https://frontend-andesstay.vercel.app',
    protectedResourceScopes: ['api://086deb4c-cded-42b0-8dfb-ab7cdb7e0346/access_as_user']
  }
};
