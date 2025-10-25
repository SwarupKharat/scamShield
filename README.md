# Incident Reporting System

A full-stack web application for reporting, managing, and resolving incidents efficiently with role-based access control and AI-powered severity prediction.

## 🚀 Features

### Core Features
- **User Registration & Authentication**: Secure user registration with document upload and admin approval workflow
- **Role-Based Access Control**: Three user roles (Admin, Authority, User) with different permissions
- **Incident Reporting**: Users can report incidents with images and AI-powered severity prediction
- **Incident Management**: Authorities can assign, update status, and resolve incidents
- **Real-time Notifications**: Users receive notifications about incident updates
- **Dashboard Analytics**: Comprehensive dashboards for admins and authorities with charts and statistics

### Admin Features
- **User Management**: Approve/reject user registrations, manage existing users
- **System Overview**: View system statistics, incident trends, and user analytics
- **Incident Monitoring**: Track all incidents across the system

### Authority Features
- **Incident Assignment**: Get assigned incidents and manage their lifecycle
- **Status Updates**: Update incident status and add messages
- **Resolution Tracking**: Mark incidents as resolved and generate reports

### User Features
- **Incident Reporting**: Report incidents with detailed descriptions and images
- **Incident Tracking**: View status of reported incidents and receive updates
- **Profile Management**: Update personal information and change password

## 🛠️ Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication
- **Multer** - File upload handling
- **Google Generative AI** - Severity prediction
- **Cloudinary** - Cloud file storage (optional)

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **DaisyUI** - Component library
- **React Router** - Navigation
- **Zustand** - State management
- **Chart.js** - Data visualization
- **Framer Motion** - Animations
- **Lucide React** - Icons

## 📁 Project Structure

```
Incident-Reporting-System/
├── backend/
│   ├── config/
│   │   ├── cloudinary.js
│   │   ├── db.js
│   │   └── utils.js
│   ├── controllers/
│   │   ├── admin.controllers.js
│   │   ├── auth.controller.js
│   │   └── authority.controllers.js
│   ├── middleware/
│   │   ├── admin.middleware.js
│   │   ├── auth.middleware.js
│   │   └── authority.middleware.js
│   ├── models/
│   │   ├── incident.model.js
│   │   ├── registeredUsers.model.js
│   │   ├── report.model.js
│   │   └── user.model.js
│   ├── routes/
│   │   ├── admin.routes.js
│   │   ├── auth.routes.js
│   │   └── authority.routes.js
│   ├── uploads/
│   ├── env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   │   ├── AdminDashboard/
    │   │   ├── AuthorityDashboard/
    │   │   ├── Home/
    │   │   ├── Login/
    │   │   └── ...
    │   ├── stores/
    │   ├── App.jsx
    │   └── main.jsx
    ├── package.json
    └── vite.config.js
```

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Google Generative AI API key

### 1. Clone the Repository
```bash
git clone <repository-url>
cd Incident-Reporting-System
```

### 2. Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp env.example .env

# Edit .env file with your configuration
# MONGO_URL=mongodb://localhost:27017/incident-reporting-system
# JWT_SECRET=your-super-secret-jwt-key-here
# GEMINI_API=your-gemini-api-key
# PORT=5000

# Start the server
npm start
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

### 4. Access the Application
- Frontend: http://localhost:5173
- Backend API: https://prathmesh00007-prabhodyanyaya-incident-ostr.onrender.com

## 🔧 Environment Variables

Create a `.env` file in the backend directory:

```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017/incident-reporting-system

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-here

# Google Generative AI
GEMINI_API=your-gemini-api-key

# Server Configuration
PORT=5000
NODE_ENV=development

# Optional: Cloudinary Configuration (for cloud file storage)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 👥 User Roles & Workflows

### 1. User Registration Flow
1. User registers with personal details and documents
2. Admin reviews and approves/rejects registration
3. Approved users can log in and report incidents

### 2. Incident Reporting Flow
1. User reports incident with description and image
2. AI predicts severity level
3. Incident is assigned to authority
4. Authority updates status and adds messages
5. User receives notifications about updates
6. Incident is marked as resolved

### 3. Admin Management Flow
1. Admin views pending registrations
2. Approves or rejects user applications
3. Monitors system statistics and user activity
4. Manages existing users

## 📊 API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/admin-signup` - Admin registration
- `POST /api/auth/authority-signup` - Authority registration

### User Management
- `GET /api/auth/notifications` - Get user notifications
- `PUT /api/auth/update-profile` - Update user profile
- `PUT /api/auth/change-password` - Change password
- `GET /api/auth/user-incidents` - Get user's incidents

### Incident Management
- `POST /api/auth/report-incident` - Report new incident
- `GET /api/authority/view-incidents` - View all incidents
- `GET /api/authority/assigned-incidents` - Get assigned incidents
- `PUT /api/authority/update-incident/:id` - Update incident
- `PUT /api/authority/mark-solved/:id` - Mark incident as resolved

### Admin Management
- `GET /api/admin/dashboard-stats` - Get dashboard statistics
- `GET /api/admin/view-registrations` - View pending registrations
- `POST /api/admin/verify/:id` - Approve/reject user
- `GET /api/admin/all-users` - Get all users
- `DELETE /api/admin/remove-user/:id` - Remove user

## 🎨 UI Components

### Dashboards
- **Admin Dashboard**: User management, system statistics, incident overview
- **Authority Dashboard**: Incident management, assignment tracking, status updates

### Key Pages
- **Home**: Landing page with statistics and testimonials
- **Login/Signup**: Authentication forms
- **Incident Form**: Report new incidents
- **Profile**: User profile management
- **Incidents**: View and track incidents

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Password hashing with bcrypt
- File upload validation
- Input sanitization
- CORS configuration

## 📈 Analytics & Reporting

- Real-time statistics
- Chart.js visualizations
- Incident trend analysis
- User activity tracking
- Resolution rate metrics

## 🚀 Deployment

### Backend Deployment
```bash
# Build for production
npm run build

# Start production server
npm start
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve static files
npm run preview
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [Vite](https://vitejs.dev/) - Fast build tool
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [DaisyUI](https://daisyui.com/) - Component library
- [Google Generative AI](https://ai.google.dev/) - AI-powered features
- [Chart.js](https://www.chartjs.org/) - Data visualization
- [Framer Motion](https://www.framer.com/motion/) - Animation library

## 📞 Support

For support and questions, please open an issue in the repository or contact the development team. 