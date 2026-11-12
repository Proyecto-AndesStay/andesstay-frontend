export const environment = {
  production: false,

  // Apuntamos al AWS API Gateway público incluyendo la ruta /api/bff
  apiBaseUrl: 'https://av639vleh1.execute-api.us-east-1.amazonaws.com/api/bff',

  azure: {
    clientId: '086deb4c-cded-42b0-8dfb-ab7cdb7e0346',
    tenantId: 'df536a4e-3386-4046-9c97-d8e41c89806d',
    authority: 'https://login.microsoftonline.com/df536a4e-3386-4046-9c97-d8e41c89806d',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    protectedResourceScopes: ['api://086deb4c-cded-42b0-8dfb-ab7cdb7e0346/access_as_user']
  }
};