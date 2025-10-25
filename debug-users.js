#!/usr/bin/env node

const mongoose = require('mongoose');
require('dotenv').config({ path: './backend/.env' });

// Import models
const User = require('./backend/models/user.model.js');
const RegisteredUser = require('./backend/models/registeredUsers.model.js');

async function debugUsers() {
    try {
        // Connect to MongoDB
        await mongoose.connect(process.env.MONGO_URL);
        console.log('Connected to MongoDB');

        // Get all users from both collections
        const users = await User.find({}).select('email role createdAt');
        const registeredUsers = await RegisteredUser.find({}).select('email status createdAt');

        console.log('\n=== USER COLLECTION (Approved Users) ===');
        console.log(`Total users: ${users.length}`);
        users.forEach(user => {
            console.log(`- ${user.email} (${user.role}) - Created: ${user.createdAt}`);
        });

        console.log('\n=== REGISTERED USER COLLECTION (Pending/Rejected) ===');
        console.log(`Total registered users: ${registeredUsers.length}`);
        registeredUsers.forEach(user => {
            console.log(`- ${user.email} (${user.status}) - Created: ${user.createdAt}`);
        });

        console.log('\n=== SUMMARY ===');
        console.log(`Total approved users: ${users.length}`);
        console.log(`Total pending/rejected users: ${registeredUsers.length}`);
        console.log(`Total users in system: ${users.length + registeredUsers.length}`);

        // Check for duplicates
        const allEmails = [...users.map(u => u.email), ...registeredUsers.map(u => u.email)];
        const uniqueEmails = [...new Set(allEmails)];
        
        if (allEmails.length !== uniqueEmails.length) {
            console.log('\n⚠️  WARNING: Duplicate emails found!');
            const duplicates = allEmails.filter((email, index) => allEmails.indexOf(email) !== index);
            console.log('Duplicate emails:', duplicates);
        } else {
            console.log('\n✅ No duplicate emails found');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\nDisconnected from MongoDB');
    }
}

debugUsers(); 