export const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1/my_database'
export const TEST_RUN_MONGO_URI = process.env.TEST_RUN_MONGO_URI || 'mongodb://localhost:27017/JestDB'
export const PORT = process.env.PORT || 3000
export const WS_PORT = process.env.WS_PORT || 3001
export const SECRET = process.env.SECRET || 'secret'
export const MAILER_SERVICE = process.env.MAILER_SERVICE || 'gmail'
export const MAILER_AUTH_USER = process.env.MAILER_AUTH_USER
export const MAILER_AUTH_PASS = process.env.MAILER_AUTH_PASS
