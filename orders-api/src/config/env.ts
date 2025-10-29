import dotenv from 'dotenv';

dotenv.config();

export const config = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3002', 10),

  db: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306', 10),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'rootpassword',
    database: process.env.DB_NAME || 'customers_orders',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'your-jwt-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
  },

  serviceToken: process.env.SERVICE_TOKEN || 'your-service-token',

  customersApiBase: process.env.CUSTOMERS_API_BASE || 'http://localhost:3001',

  idempotency: {
    expirationHours: parseInt(process.env.IDEMPOTENCY_KEY_EXPIRATION_HOURS || '24', 10),
  },

  orders: {
    cancellationWindowMinutes: parseInt(process.env.ORDER_CANCELLATION_WINDOW_MINUTES || '10', 10),
  },

  logLevel: process.env.LOG_LEVEL || 'info',
};
