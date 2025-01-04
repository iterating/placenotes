// API URL configuration
const DEV_API_URL = 'http://localhost:5000/api'
const PROD_API_URL = '/api'

export const SERVER = import.meta.env.PROD ? PROD_API_URL : DEV_API_URL