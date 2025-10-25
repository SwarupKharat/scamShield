const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const Scammer = require("./models/scammer.model"); // adjust path

async function seedScammers() {
  try {
    await mongoose.connect("mongodb://localhost:27017/scam");

    const scamTypes = [
      "phishing", "investment", "romance", "tech-support",
      "fake-calls", "social-media", "upi-fraud", "banking", "other"
    ];
    const riskLevels = ["low", "medium", "high", "critical"];

    const scammers = [];

    for (let i = 0; i < 100; i++) {
      scammers.push({
        name: faker.person.fullName(),
        phoneNumber: `900000${1000 + i}`, // unique
        upiId: `scammer${i}@upi`,        // unique
        email: `scammer${i}@example.com`,// unique
        website: faker.internet.url(),
        scamType: faker.helpers.arrayElement(scamTypes),
        description: faker.lorem.sentence(10),
        verificationStatus: "pending",
        reportCount: faker.number.int({ min: 0, max: 20 }),
        lastKnownLocation: faker.location.city(),
        pincode: faker.location.zipCode("######"),
        coordinates: {
          latitude: faker.location.latitude(),
          longitude: faker.location.longitude(),
        },
        aliases: [faker.internet.username(), faker.internet.username()],
        socialMediaHandles: [
          { platform: "facebook", handle: faker.internet.username() },
          { platform: "whatsapp", handle: `+91${faker.number.int({ min: 6000000000, max: 9999999999 })}` },
        ],
        evidence: [
          {
            type: "screenshot",
            url: faker.internet.url(),
            description: faker.lorem.sentence(),
          },
        ],
        riskLevel: faker.helpers.arrayElement(riskLevels),
        isActive: true,
        totalReports: faker.number.int({ min: 0, max: 50 }),
        uniqueReporters: faker.number.int({ min: 0, max: 30 }),
        lastReportedAt: faker.date.recent({ days: 30 }),
      });
    }

    await Scammer.insertMany(scammers, { ordered: false });
    console.log("✅ 100 unique scammers inserted successfully");
  } catch (err) {
    console.error("❌ Error seeding scammers:", err);
  } finally {
    mongoose.connection.close();
  }
}

seedScammers();
