import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: { origin: process.env.FRONTEND_URL || "http://localhost:3000" }
});

app.use(helmet());
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.get('/api/requests', (req, res) => {
  res.json({ 
    requests: [
      {
        id: '1',
        request_id: 'SR-001',
        type: 'Pothole',
        category: 'pothole',
        description: 'Large pothole on Main St',
        location_address: '123 Main St, Chicago, IL',
        ward: 5,
        priority_score: 75,
        status: 'open',
        created_at: new Date().toISOString()
      }
    ]
  });
});

app.get('/api/crews', (req, res) => {
  res.json({
    crews: [
      {
        id: '1',
        name: 'Crew Alpha',
        type: 'pothole',
        available: true,
        equipment_type: ['asphalt_truck', 'compactor']
      }
    ]
  });
});

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

export { server, io };