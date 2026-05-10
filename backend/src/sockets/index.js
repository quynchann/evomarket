import { Server } from 'socket.io'
import http from 'http'
import express from 'express'
import { env } from '../config/env.js'
import { NAMESPACES } from './socket.constants.js'
import { socketAuthMiddleware } from './middlewares/socket.auth.js'
import { setupSystemNamespace } from './handlers/system.handler.js'
import { setupChatNamespace } from './handlers/chat.handler.js'

const app = express()

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: env.BASE_URL_FRONTEND,
    credentials: true,
    methods: ['GET', 'POST']
  },
  pingTimeout: 60000,
  connectTimeout: 20000
})

// ============================================
// Setup Namespace: /system
// ============================================
const systemNamespace = io.of(NAMESPACES.SYSTEM)

// Apply authentication middleware
systemNamespace.use(socketAuthMiddleware)

// Setup handlers
setupSystemNamespace(systemNamespace)

// ============================================
// Setup Namespace: /chat
// ============================================
const chatNamespace = io.of(NAMESPACES.CHAT)

// Apply authentication middleware
chatNamespace.use(socketAuthMiddleware)

// Setup handlers
setupChatNamespace(chatNamespace)

// ============================================
// Default namespace (không nên dùng)
// ============================================
io.on('connection', (socket) => {
  console.warn(
    `[Warning] Client connected to default namespace. Use /system or /chat instead. Socket ID: ${socket.id}`
  )

  socket.emit('error', {
    message: 'Please connect to /system or /chat namespace'
  })

  socket.disconnect(true)
})

export { io, app, server }
