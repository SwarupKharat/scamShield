const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { faker } = require("@faker-js/faker");
 // install with: npm install faker

const User = require("./models/user.model"); // adjust path to your schema file

async function seedUsers() {
  try {
    await mongoose.connect("mongodb://localhost:27017/scam");

    // Hash password once
    const hashedPassword = await bcrypt.hash("123456", 10);

    const users = [];

    for (let i = 0; i < 1000; i++) {
      users.push({
        name: "user",
        email: `user${i}@example.com`, // unique
        mobile: `9000000${1000 + i}`, // unique
        password: hashedPassword,
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        address: faker.location.streetAddress(),
        aadharCard: `${100000000000 + i}`, // unique 12-digit number
        role: "user",
        profilePic: null,
        reportedEvents: [],
        notifications: [],
      });
    }

    await User.insertMany(users);
    console.log("✅ 1000 users inserted successfully");
  } catch (err) {
    console.error("❌ Error seeding users:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedUsers();
