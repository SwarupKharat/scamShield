# Troubleshooting Guide - Authentication Issues

## 🚨 **"User associated with this token does not exist" Error**

This error occurs when the JWT token contains a `userId` that doesn't exist in the `User` collection. Here's how to fix it:

### **Root Cause**
The issue was caused by a mismatch between user collections:
- **Signup**: Creates users in `RegisteredUser` collection (pending approval)
- **Login**: Should only work with users in `User` collection (approved users)
- **Authentication**: Looks for users in `User` collection

### **What Was Fixed**

1. **Signup Process**: 
   - Users are now created in `RegisteredUser` collection with `status: 'pending'`
   - No JWT token is generated during signup (user needs approval first)

2. **Login Process**:
   - First checks `User` collection for approved users
   - If not found, checks `RegisteredUser` collection and shows appropriate message
   - Only generates JWT token for approved users

3. **Authentication Middleware**:
   - Added better debugging to identify token issues
   - Validates token format and userId presence

## 🔧 **How to Fix Your Current Issue**

### **Step 1: Check Your Database State**

Run the debug script to see what's in your database:

```bash
cd Incident-Reporting-System
node debug-users.js
```

This will show you:
- Users in the `User` collection (approved users)
- Users in the `RegisteredUser` collection (pending/rejected users)
- Any duplicate emails

### **Step 2: Clear Invalid Tokens**

If you have users with invalid tokens, clear your browser cookies:

1. Open browser developer tools (F12)
2. Go to Application/Storage tab
3. Clear all cookies for `localhost:5000`
4. Refresh the page

### **Step 3: Test the Fixed Flow**

1. **Register a new user**:
   ```bash
   # This should create a user in RegisteredUser collection
   # No JWT token should be generated
   ```

2. **Check approval status**:
   ```bash
   # Use the check-approval endpoint
   POST /api/auth/check-approval
   Body: { "email": "user@example.com" }
   ```

3. **Login as admin** and approve the user:
   ```bash
   # Admin should see pending registrations
   GET /api/admin/view-registrations
   
   # Approve the user
   POST /api/admin/verify/{userId}
   Body: { "approval": true }
   ```

4. **User can now login**:
   ```bash
   # After approval, user can login
   POST /api/auth/login
   Body: { "email": "user@example.com", "password": "password" }
   ```

### **Step 4: Debug API Endpoints**

Use the debug endpoint to check your database:

```bash
# Check all users in both collections
GET http://localhost:5000/api/auth/debug/users
```

## 🐛 **Common Issues and Solutions**

### **Issue 1: User exists but can't login**

**Symptoms**: User registered but gets "User not found" on login

**Solution**: 
1. Check if user is in `RegisteredUser` collection with `status: 'pending'`
2. Admin needs to approve the user first
3. After approval, user will be moved to `User` collection

### **Issue 2: Token exists but authentication fails**

**Symptoms**: "User associated with this token does not exist"

**Solution**:
1. Clear browser cookies
2. Check if user exists in `User` collection
3. If not, user needs to be approved by admin
4. User should login again after approval

### **Issue 3: Admin can't see pending registrations**

**Symptoms**: Admin dashboard shows no pending registrations

**Solution**:
1. Check if admin is logged in with correct role
2. Verify admin has proper permissions
3. Check if users are actually in `RegisteredUser` collection

### **Issue 4: User approved but still can't login**

**Symptoms**: User approved but login still fails

**Solution**:
1. Check if user was properly moved to `User` collection
2. Verify the approval process completed successfully
3. Check for any database errors during approval

## 🔍 **Debugging Steps**

### **1. Check Server Logs**

Look for these debug messages in your backend console:

```
Decoded token: { userId: '...' }
Looking for user with ID: ...
User found: user@example.com Role: user
```

### **2. Check Database Collections**

Use MongoDB Compass or command line:

```javascript
// Check User collection
db.users.find({})

// Check RegisteredUser collection  
db.registeredusers.find({})
```

### **3. Test API Endpoints**

Use Postman or curl to test:

```bash
# Test login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# Test debug endpoint
curl http://localhost:5000/api/auth/debug/users
```

## 🚀 **Quick Fix for Existing Users**

If you have existing users with invalid tokens:

1. **Clear all cookies** in your browser
2. **Run the debug script** to see current state
3. **Re-register users** or **approve existing pending users**
4. **Login again** with approved users

## 📋 **Testing Checklist**

- [ ] User registration creates entry in `RegisteredUser` collection
- [ ] Admin can see pending registrations
- [ ] Admin can approve users (moves to `User` collection)
- [ ] Approved users can login successfully
- [ ] JWT tokens work for authenticated requests
- [ ] Role-based access works correctly

## 🆘 **Still Having Issues?**

If you're still experiencing problems:

1. **Check the server logs** for detailed error messages
2. **Run the debug script** to see database state
3. **Clear all cookies** and try again
4. **Check if MongoDB is running** and accessible
5. **Verify environment variables** are set correctly

## 📞 **Support**

If none of the above solutions work, please provide:
- Server logs with error messages
- Output from the debug script
- Steps to reproduce the issue
- Browser console errors (if any) 