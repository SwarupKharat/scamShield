#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up Incident Reporting System...\n');

// Colors for console output
const colors = {
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  if (majorVersion < 16) {
    log('❌ Node.js version 16 or higher is required', 'red');
    log(`Current version: ${nodeVersion}`, 'yellow');
    process.exit(1);
  }
  
  log(`✅ Node.js version: ${nodeVersion}`, 'green');
}

function checkMongoDB() {
  log('📋 Checking MongoDB connection...', 'blue');
  // This is a basic check - users should ensure MongoDB is running
  log('⚠️  Please ensure MongoDB is running on your system', 'yellow');
  log('   You can use MongoDB Atlas (cloud) or local MongoDB', 'yellow');
}

function createEnvFile() {
  const backendPath = path.join(__dirname, 'backend');
  const envPath = path.join(backendPath, '.env');
  const envExamplePath = path.join(backendPath, 'env.example');
  
  if (fs.existsSync(envPath)) {
    log('✅ .env file already exists', 'green');
    return;
  }
  
  if (!fs.existsSync(envExamplePath)) {
    log('❌ env.example file not found', 'red');
    return;
  }
  
  try {
    fs.copyFileSync(envExamplePath, envPath);
    log('✅ Created .env file from env.example', 'green');
    log('⚠️  Please edit backend/.env with your configuration', 'yellow');
  } catch (error) {
    log('❌ Failed to create .env file', 'red');
    console.error(error);
  }
}

function installDependencies() {
  log('📦 Installing backend dependencies...', 'blue');
  try {
    execSync('npm install', { 
      cwd: path.join(__dirname, 'backend'),
      stdio: 'inherit'
    });
    log('✅ Backend dependencies installed', 'green');
  } catch (error) {
    log('❌ Failed to install backend dependencies', 'red');
    process.exit(1);
  }
  
  log('📦 Installing frontend dependencies...', 'blue');
  try {
    execSync('npm install', { 
      cwd: path.join(__dirname, 'frontend'),
      stdio: 'inherit'
    });
    log('✅ Frontend dependencies installed', 'green');
  } catch (error) {
    log('❌ Failed to install frontend dependencies', 'red');
    process.exit(1);
  }
}

function createUploadsDirectory() {
  const uploadsPath = path.join(__dirname, 'backend', 'uploads');
  
  if (!fs.existsSync(uploadsPath)) {
    try {
      fs.mkdirSync(uploadsPath, { recursive: true });
      log('✅ Created uploads directory', 'green');
    } catch (error) {
      log('❌ Failed to create uploads directory', 'red');
    }
  } else {
    log('✅ Uploads directory already exists', 'green');
  }
}

function displayNextSteps() {
  log('\n🎉 Setup completed successfully!', 'green');
  log('\n📋 Next steps:', 'blue');
  log('1. Edit backend/.env file with your configuration:', 'yellow');
  log('   - MONGO_URL: Your MongoDB connection string', 'yellow');
  log('   - JWT_SECRET: A secure random string for JWT tokens', 'yellow');
  log('   - GEMINI_API: Your Google Generative AI API key', 'yellow');
  
  log('\n2. Start the backend server:', 'yellow');
  log('   cd backend && npm start', 'green');
  
  log('\n3. Start the frontend development server:', 'yellow');
  log('   cd frontend && npm run dev', 'green');
  
  log('\n4. Access the application:', 'yellow');
  log('   Frontend: http://localhost:5173', 'green');
  log('   Backend API: https://prathmesh00007-prabhodyanyaya-incident-ostr.onrender.com', 'green');
  
  log('\n📚 For more information, see README.md', 'blue');
}

// Main setup process
try {
  checkNodeVersion();
  checkMongoDB();
  createEnvFile();
  installDependencies();
  createUploadsDirectory();
  displayNextSteps();
} catch (error) {
  log('❌ Setup failed', 'red');
  console.error(error);
  process.exit(1);
} 