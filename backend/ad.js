#!/usr/bin/env node

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config({ path: './backend/.env' });

// Import the User model
const User = require('./models/user.model.js');

async function createAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect("mongodb://localhost:27017/scam");
        console.log('✅ Connected to MongoDB');

        const adminEmail = 'paranade370123@kkwagh.edu.in';
        const adminPassword = '123456';

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminEmail });
        if (existingAdmin) {
            console.log('⚠️  Admin account already exists with this email');
            console.log(`Email: ${existingAdmin.email}`);
            console.log(`Role: ${existingAdmin.role}`);
            console.log(`Created: ${existingAdmin.createdAt}`);
            return;
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(adminPassword, 10);

        // Create admin user
        const adminUser = new User({
            firstName: 'Admin',
            lastName: 'User',
            email: adminEmail,
            mobile: '1234567890',
            address: 'Admin Address',
            password: hashedPassword,
            role: 'admin',
            name: 'Admin User',
            aadharCard: 'ADMIN123456789',
            profilePic: null,
            createdAt: new Date(),
            reportedEvents: [],
            notifications: []
        });

        // Save the admin user
        await adminUser.save();

        console.log('✅ Admin account created successfully!');
        console.log('�� Admin Details:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log(`   Role: ${adminUser.role}`);
        console.log(`   ID: ${adminUser._id}`);
        console.log(`   Created: ${adminUser.createdAt}`);

        console.log('\n🚀 You can now login with these credentials:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);

    } catch (error) {
        console.error('❌ Error creating admin account:', error);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run the script
createAdmin();