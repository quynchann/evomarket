import cors from 'cors'
import 'dotenv/config'
import router from './routes/api'
import { connectDB } from './config/database'
import cookieParser from 'cookie-parser'
import { errorConverter, errorHandler } from './middlewares/error.middleware'
import { env } from './config'
import { app, server } from './sockets'
import express from 'express'

const port = env.PORT
app.use(
  cors({
    origin: env.BASE_URL_FRONTEND,
    credentials: true
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Serve static files (uploaded images)
app.use('/uploads', express.static('uploads'))

connectDB()

// API Routes
app.use('/api-v1', router)

// Convert error to ApiError, if needed
app.use(errorConverter)

// Global Error Handler
app.use(errorHandler)

server.listen(port, () => {
  console.log(`Server is running on port http://localhost:${port}`)
})
