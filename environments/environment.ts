export const environment = {
    production: false,
    enableApiLogs: true,
     API_URL: 'https://ethrai.sa/api/',
    EMAIL_REGEX: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    PASSWORD_REGEX:/^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
    BIRTHDATE_REGEX:/^((0?[1-9]|1[012])[- /.](0?[1-9]|[12][0-9]|3[01])[- /.](19|20)?[0-9]{2})*$/,
    WEB_API: 'https://ethrai.sa/',
    ETHRAI_GUID:'8ae475e9-b8d1-4c9a-8058-0a0ede2c0551'
  };