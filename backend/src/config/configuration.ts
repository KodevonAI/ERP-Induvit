export default () => ({
  port: parseInt(process.env.PORT, 10) || 3001,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwt: {
    secret: process.env.JWT_SECRET || 'change_me_in_production',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h',
  },
  cors: {
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  dian: {
    wsdlUrl: process.env.DIAN_WSDL_URL || 'https://vpfe-hab.dian.gov.co/WcfDianCustomerServices.svc?wsdl',
    certPath: process.env.DIAN_CERT_PATH || './certs/indusvit.p12',
    certPassword: process.env.DIAN_CERT_PASSWORD || '',
    nit: process.env.DIAN_NIT || '900000001',
    nitDian: process.env.DIAN_NIT_DIAN || '800197268',
  },
});
