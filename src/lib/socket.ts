import { Server as HTTPServer } from 'http'
import { Socket as NetSocket } from 'net'
import { Server as SocketIOServer } from 'socket.io'
import { NextApiRequest } from 'next'
import { NextApiResponse } from 'next'

interface SocketServer extends HTTPServer {
  io?: SocketIOServer | undefined
}

interface SocketWithIO extends NetSocket {
  server: SocketServer
}

interface NextApiResponseWithSocket extends NextApiResponse {
  socket: SocketWithIO
}

let io: SocketIOServer | null = null

export function setupSocket(server: HTTPServer) {
  if (io) return io

  io = new SocketIOServer(server, {
    path: '/api/socketio',
  })

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id)
  })

  return io
}

export const initializeSocket = (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  if (!res.socket.server.io) {
    io = new SocketIOServer(res.socket.server)
    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Handle location updates
      socket.on('location:update', (data: {
        userId: string,
        latitude: number,
        longitude: number,
        battery: number,
        isMockLocation: boolean
      }) => {
        // Broadcast location update to admin clients
        res.socket.server.io!.emit('location:updated', {
          ...data,
          timestamp: new Date()
        })
      })

      // Handle attendance updates
      socket.on('attendance:update', (data: {
        type: 'CHECK_IN' | 'CHECK_OUT',
        userId: string,
        userName: string,
        timestamp: Date,
        coordinates?: string,
        totalHours?: number
      }) => {
        // Broadcast attendance update to admin clients
        res.socket.server.io!.emit('attendance:updated', data)
      })

      // Handle custom events for real-time tracking
      socket.on('track:start', (userId: string) => {
        socket.join(`tracking:${userId}`)
      })

      socket.on('track:stop', (userId: string) => {
        socket.leave(`tracking:${userId}`)
      })

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
  }
  
  return res.socket.server.io
}

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized')
  }
  return io
}

export { io }