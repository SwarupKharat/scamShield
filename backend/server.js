const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB = require('./config/db.js');
const bodyParser = require('body-parser')
const app = express();
const PORT = process.env.PORT || 5000;
const path = require('path');


const authRoutes = require('./routes/auth.routes.js')
const authorityRoutes = require('./routes/authority.routes.js')
const adminRoutes = require('./routes/admin.routes.js')
const communityRoutes = require('./routes/community.routes.js')
const mapRoutes = require('./routes/map.routes.js')
const helplineRoutes = require('./routes/helpline.routes.js')
const scammerRoutes = require('./routes/scammer.routes.js')// NEW: Video routes

// Register routes

// Middleware
const allowedOrigins = [
  'http://localhost:19006',      // Expo web (local)
  'http://192.168.1.42:19006',   // Expo web (LAN)
  'http://localhost:5173',       // Vite/React dev
  'http://192.168.1.7:19006',    // Another LAN dev IP
  'exp://192.168.1.7:19000',     // Expo tunnel
  'exp://localhost:19000'        // Expo local
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like React Native mobile or curl)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));


  
app.use(express.json());
app.use(bodyParser.json({ limit: '20mb' })); // Adjust the size limit accordingly
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({ 
        success: true, 
        message: 'Backend server is running!',
        timestamp: new Date().toISOString(),
        status: 'healthy'
    });
});

// Database Connection
connectDB()
    .then(() => console.log("MongoDB connected successfully!"))
    .catch(err => console.error("MongoDB connection failed:", err));

// Server Listening

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});


app.use('/api/auth', authRoutes);
app.use('/api/authority', authorityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/map', mapRoutes);
app.use('/api/helpline', helplineRoutes);
app.use('/api/scammers', scammerRoutes);

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log("Shutting down server...");
    await mongoose.disconnect();
    process.exit(0);
});
