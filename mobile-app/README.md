# Prabhodhanyaya Mobile App

A React Native mobile application for the Prabhodhanyaya Scam Reporting System. This app provides a comprehensive platform for reporting scams, viewing community posts, accessing helpline services, and managing scammer databases.

## Features

### 🔐 Authentication
- User registration and login
- Profile management
- Role-based access (User, Admin, Authority)

### 📝 Incident Reporting
- Report scam incidents with detailed information
- Include scammer details (name, phone, UPI ID, email, website)
- Upload evidence images
- Location-based reporting with pincode

### 👥 Community
- View and create community posts
- Share scam experiences
- Filter by scam type and region
- Anonymous posting option

### 🗺️ Interactive Map
- View scam incidents and community posts on map
- Filter by type and severity
- Identify scam hotspots
- Real-time data visualization

### 📞 Helpline
- Emergency contact numbers
- Quick action messages
- Custom message sending
- Safety tips and guidelines

### 🛡️ Scammer Database
- Search verified scammer information
- Filter by verification status and scam type
- Detailed scammer profiles
- Report tracking

### 📊 Dashboards
- User dashboard with statistics
- Admin dashboard for management
- Authority dashboard for incident handling

## Tech Stack

- **React Native** - Mobile app framework
- **Expo** - Development platform
- **React Navigation** - Navigation library
- **Zustand** - State management
- **React Native Maps** - Map integration
- **Expo Image Picker** - Image handling
- **React Native Paper** - UI components
- **Axios** - HTTP client

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Incident-Reporting-System/mobile-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Install Expo CLI globally**
   ```bash
   npm install -g @expo/cli
   ```

4. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

## Configuration

### API Configuration
Update the API base URL in `src/config/api.js`:
```javascript
export const API_BASE_URL = 'http://your-backend-url:5000';
```

### Environment Variables
Create a `.env` file in the root directory:
```env
API_BASE_URL=http://localhost:5000
```

## Running the App

### Development
```bash
# Start Expo development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run on web
npm run web
```

### Production Build
```bash
# Build for Android
expo build:android

# Build for iOS
expo build:ios
```

## Project Structure

```
mobile-app/
├── App.js                 # Main app component
├── package.json           # Dependencies
├── app.json              # Expo configuration
├── babel.config.js       # Babel configuration
├── metro.config.js       # Metro bundler configuration
└── src/
    ├── config/
    │   └── api.js        # API configuration
    ├── stores/
    │   └── authStore.js  # Authentication state management
    └── screens/
        ├── auth/         # Authentication screens
        ├── dashboard/    # Dashboard screens
        ├── incident/     # Incident reporting
        ├── community/    # Community features
        ├── map/          # Map functionality
        ├── helpline/     # Helpline services
        ├── scammer/      # Scammer database
        └── profile/      # User profile
```

## Features Overview

### 1. Authentication System
- Secure login/signup with validation
- JWT token-based authentication
- Persistent login state
- Role-based navigation

### 2. Incident Reporting
- Comprehensive form with validation
- Image upload functionality
- Scammer details integration
- Location services integration

### 3. Community Features
- Post creation and viewing
- Search and filtering
- Anonymous posting
- Scam type categorization

### 4. Map Integration
- Interactive map with markers
- Real-time data visualization
- Filtering capabilities
- Hotspot identification

### 5. Helpline Services
- Quick contact options
- Message templates
- Emergency procedures
- Safety guidelines

### 6. Scammer Database
- Search and filter functionality
- Detailed profiles
- Verification status tracking
- Report statistics

## API Integration

The app integrates with the backend API endpoints:
- Authentication: `/api/auth/*`
- Community: `/api/community/*`
- Map: `/api/map/*`
- Helpline: `/api/helpline/*`
- Scammer Database: `/api/scammers/*`

## State Management

Uses Zustand for state management:
- Authentication state
- User profile data
- API loading states
- Error handling

## Navigation

Implements stack navigation with:
- Authentication flow
- Role-based dashboard routing
- Feature-specific screens
- Modal presentations

## Styling

- Consistent design system
- Responsive layouts
- Platform-specific adaptations
- Dark/light theme support

## Testing

```bash
# Run tests
npm test

# Run with coverage
npm run test:coverage
```

## Deployment

### Android
1. Generate signed APK
2. Upload to Google Play Store
3. Configure app signing

### iOS
1. Build for App Store
2. Upload to App Store Connect
3. Submit for review

## Troubleshooting

### Common Issues

1. **Metro bundler issues**
   ```bash
   npx expo start --clear
   ```

2. **Dependency conflicts**
   ```bash
   rm -rf node_modules
   npm install
   ```

3. **Android build issues**
   - Ensure Android SDK is properly configured
   - Check Java version compatibility

4. **iOS build issues**
   - Ensure Xcode is up to date
   - Check iOS deployment target

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## Changelog

### v1.0.0
- Initial release
- Core functionality implementation
- Authentication system
- Incident reporting
- Community features
- Map integration
- Helpline services
- Scammer database
