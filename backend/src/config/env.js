import 'dotenv/config'

export const env = {
  PORT: process.env.PORT || 8080,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Frontend URL
  BASE_URL_FRONTEND: process.env.BASE_URL_FRONTEND || 'http://localhost:3000',

  // MySQL configuration
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_USER: process.env.DB_USER || 'root',
  DB_PASSWORD: process.env.DB_PASSWORD || '',
  DB_NAME: process.env.DB_NAME || 'evo_market',
  DB_DIALECT: process.env.DB_DIALECT || 'mysql',
  DB_PORT: process.env.DB_PORT || 3306,

  // JWT configuration
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE || '15m',
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE || '30d'
}
