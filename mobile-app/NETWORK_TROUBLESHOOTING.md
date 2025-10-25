# Network Troubleshooting Guide

## Common Network Issues and Solutions

### 1. **"Network request failed" Error**

**Cause:** The mobile app cannot reach the backend server.

**Solutions:**
1. **Check if backend server is running:**
   ```bash
   cd Incident-Reporting-System/backend
   npm start
   ```
   You should see: `Server is running on port 5000`

2. **Find your computer's IP address:**
   - **Windows:** Open Command Prompt and run `ipconfig`
   - **Mac/Linux:** Open Terminal and run `ifconfig`
   - Look for your local network IP (usually starts with 192.168.x.x or 10.x.x.x)

3. **Update API_BASE_URL in mobile app:**
   ```javascript
   // In src/config/api.js
   export const API_BASE_URL = 'http://YOUR_IP_ADDRESS:5000';
   ```

### 2. **"Connection refused" Error**

**Cause:** Backend server is not running or not accessible.

**Solutions:**
1. **Start the backend server:**
   ```bash
   cd Incident-Reporting-System/backend
   npm install
   npm start
   ```

2. **Check if server is accessible:**
   - Open browser and go to `http://YOUR_IP:5000`
   - You should see the server response

3. **Check firewall settings:**
   - Allow port 5000 through Windows Firewall
   - Ensure your antivirus isn't blocking the connection

### 3. **"Timeout" Error**

**Cause:** Network request is taking too long.

**Solutions:**
1. **Check network connection:**
   - Ensure phone and computer are on same WiFi network
   - Try switching WiFi networks

2. **Increase timeout:**
   ```javascript
   const response = await fetch(url, {
     method: 'POST',
     timeout: 10000, // 10 seconds
     // ... other options
   });
   ```

### 4. **"CORS" Error**

**Cause:** Cross-Origin Resource Sharing issues.

**Solutions:**
1. **Check backend CORS configuration:**
   ```javascript
   // In backend/server.js
   app.use(cors({
     origin: ['http://localhost:5173', 'http://192.168.1.7:5173'],
     credentials: true,
   }));
   ```

2. **Add mobile app origin to CORS:**
   ```javascript
   app.use(cors({
     origin: true, // Allow all origins for development
     credentials: true,
   }));
   ```

### 5. **Different IP Addresses for Different Platforms**

**Android Emulator:**
```javascript
export const API_BASE_URL = 'http://10.0.2.2:5000';
```

**iOS Simulator:**
```javascript
export const API_BASE_URL = 'http://127.0.0.1:5000';
```

**Physical Device:**
```javascript
export const API_BASE_URL = 'http://192.168.1.7:5000'; // Your computer's IP
```

### 6. **Testing Network Connectivity**

Use the Network Debug screen in the app:
1. Navigate to Network Debug screen
2. Run network tests
3. Check test results
4. Try different IP addresses

### 7. **Quick Fixes**

1. **Restart everything:**
   ```bash
   # Stop backend server (Ctrl+C)
   # Restart backend
   cd Incident-Reporting-System/backend
   npm start
   
   # Restart mobile app
   # Stop Expo (Ctrl+C)
   npx expo start --clear
   ```

2. **Clear cache:**
   ```bash
   npx expo start --clear
   ```

3. **Check network settings:**
   - Ensure phone and computer are on same network
   - Try mobile hotspot if WiFi issues persist

### 8. **Development vs Production**

**Development (Local Network):**
```javascript
export const API_BASE_URL = 'http://192.168.1.7:5000';
```

**Production (Deployed Server):**
```javascript
export const API_BASE_URL = 'https://your-domain.com';
```

### 9. **Network Debug Commands**

**Test backend server:**
```bash
curl http://192.168.1.7:5000/api/auth/test
```

**Check if port is open:**
```bash
# Windows
netstat -an | findstr :5000

# Mac/Linux
netstat -an | grep :5000
```

### 10. **Common IP Addresses**

- **localhost:** 127.0.0.1 (only works on same machine)
- **Android Emulator:** 10.0.2.2
- **iOS Simulator:** 127.0.0.1
- **Physical Device:** Your computer's local IP (192.168.x.x)

### 11. **Step-by-Step Debugging**

1. **Check backend server:**
   - Is it running? `npm start` in backend folder
   - Can you access it in browser? `http://YOUR_IP:5000`

2. **Check mobile app configuration:**
   - Is API_BASE_URL correct?
   - Are you using the right IP address?

3. **Check network connectivity:**
   - Same WiFi network?
   - Firewall blocking?
   - Antivirus interference?

4. **Test with Network Debug screen:**
   - Run network tests
   - Try different IP addresses
   - Check error messages

### 12. **Alternative Solutions**

If local network doesn't work:
1. **Use ngrok for tunneling:**
   ```bash
   npm install -g ngrok
   ngrok http 5000
   # Use the https URL provided
   ```

2. **Deploy backend to cloud:**
   - Heroku, Vercel, or similar
   - Use the deployed URL

3. **Use Expo tunnel:**
   ```bash
   npx expo start --tunnel
   ```

## Quick Checklist

- [ ] Backend server is running on port 5000
- [ ] Mobile app and computer are on same network
- [ ] API_BASE_URL is set to correct IP address
- [ ] Firewall allows port 5000
- [ ] No antivirus blocking the connection
- [ ] Network Debug screen shows successful tests
