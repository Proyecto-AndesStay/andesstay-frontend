export const environment = {
  production: false,
  
  // Apuntamos al BFF local con la ruta correcta incluyendo /bff
  apiBaseUrl: 'http://localhost:8080/api/bff', 
  
  azure: {
    clientId: '086deb4c-cded-42b0-8dfb-ab7cdb7e0346',
    tenantId: 'df536a4e-3386-4046-9c97-d8e41c89806d',
    authority: 'https://login.microsoftonline.com/df536a4e-3386-4046-9c97-d8e41c89806d',
    redirectUri: 'http://localhost:4200',
    postLogoutRedirectUri: 'http://localhost:4200',
    protectedResourceScopes: ['api://086deb4c-cded-42b0-8dfb-ab7cdb7e0346/access_as_user']
  }
};