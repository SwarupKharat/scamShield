const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
require('dotenv').config();
const connectDB = require('./config/db.js');
const bodyParser = require('body-parser')
const app = express();
const PORT = process.env.PORT || 5000;

const authRoutes = require('./routes/auth.routes.js')
const authorityRoutes = require('./routes/authority.routes.js')
const adminRoutes = require('./routes/admin.routes.js')

// Middleware
app.use(cors({
    origin: 'https://prabhodanyaya.netlify.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
  }));
  
app.use(express.json());
app.use(bodyParser.json({ limit: '20mb' })); // Adjust the size limit accordingly
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));
app.use(cookieParser());

// Database Connection
connectDB()
    .then(() => console.log("MongoDB connected successfully!"))
    .catch(err => console.error("MongoDB connection failed:", err));

// Server Listening
app.listen(PORT, () => {
    console.log(`Server is running at: http://localhost:${PORT}`);
});

app.use('/api/auth', authRoutes);
app.use('/api/authority', authorityRoutes);
app.use('/api/admin', adminRoutes);

// Graceful Shutdown
process.on('SIGINT', async () => {
    console.log("Shutting down server...");
    await mongoose.disconnect();
    process.exit(0);
});
