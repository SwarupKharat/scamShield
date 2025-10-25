# Dependencies to Install

## Required Dependencies for Mobile App

Run the following commands in your mobile app directory (`Incident-Reporting-System/mobile-app/`):

### 1. Vector Icons
```bash
npm install react-native-vector-icons
```

### 2. Linear Gradient (Expo)
```bash
npx expo install expo-linear-gradient
```

### 3. Toast Messages
```bash
npm install react-native-toast-message
```

### 4. Image Picker (if not already installed)
```bash
npm install expo-image-picker
```

### 5. Async Storage (if not already installed)
```bash
npm install @react-native-async-storage/async-storage
```

### 6. React Native Maps (for map functionality)
```bash
npm install react-native-maps
```

### 7. Gesture Handler (for smooth interactions)
```bash
npm install react-native-gesture-handler
```

### 8. Reanimated (for animations)
```bash
npm install react-native-reanimated
```

## Installation Commands

Run all dependencies at once:

```bash
cd Incident-Reporting-System/mobile-app
npm install react-native-vector-icons react-native-toast-message @react-native-async-storage/async-storage react-native-maps react-native-gesture-handler react-native-reanimated
npx expo install expo-linear-gradient expo-image-picker
```

## Post-Installation Setup

### For React Native Vector Icons:
1. For iOS, add to `ios/Podfile`:
```ruby
pod 'RNVectorIcons', :path => '../node_modules/react-native-vector-icons'
```

2. For Android, add to `android/app/build.gradle`:
```gradle
apply from: "../../node_modules/react-native-vector-icons/fonts.gradle"
```

### For Expo Linear Gradient:
No additional setup required - works out of the box with Expo.

### For React Native Maps:
1. For iOS, add to `ios/Podfile`:
```ruby
pod 'react-native-google-maps', :path => '../node_modules/react-native-maps'
```

2. For Android, add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
<uses-permission android:name="android.permission.ACCESS_COARSE_LOCATION" />
```

## Additional Setup for Enhanced Features

### For Gesture Handler and Reanimated:
1. Add to `android/app/src/main/java/.../MainActivity.java`:
```java
import com.swmansion.gesturehandler.react.RNGestureHandlerEnabledRootView;

public class MainActivity extends ReactActivity {
  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new ReactActivityDelegateWrapper(this, new ReactActivityDelegate(this, getMainComponentName()) {
      @Override
      protected ReactRootView createRootView() {
        return new RNGestureHandlerEnabledRootView(MainActivity.this);
      }
    });
  }
}
```

### For Toast Messages:
Add to your main App.js:
```javascript
import Toast from 'react-native-toast-message';

// Add at the end of your App component
<Toast />
```

## Verification

After installation, verify all dependencies are working by:

1. Running the app: `npm start` or `expo start`
2. Checking for any import errors in the console
3. Testing the new features:
   - Instagram-style community feed
   - Enhanced login screen with gradients
   - Beautiful dashboard with animations
   - Admin panel improvements

## Troubleshooting

If you encounter issues:

1. **Metro bundler cache**: `npx react-native start --reset-cache`
2. **iOS build issues**: `cd ios && pod install && cd ..`
3. **Android build issues**: `cd android && ./gradlew clean && cd ..`
4. **Expo issues**: `expo install --fix`

## Notes

- All dependencies are compatible with React Native 0.70+
- Some dependencies may require additional native configuration
- Test on both iOS and Android devices/emulators
- The app now includes beautiful animations, gradients, and modern UI components
