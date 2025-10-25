const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const User = require('./backend/models/user.model.js');
const Incident = require('./backend/models/incident.model.js');

async function debugIssues() {
  try {
    console.log('\n=== DEBUGGING USER ROLES AND INCIDENTS ===\n');

    // Check all users and their roles
    console.log('1. Checking all users and their roles:');
    const users = await User.find({}).select('email firstName lastName role');
    console.log(`Total users found: ${users.length}`);
    
    users.forEach((user, index) => {
      console.log(`${index + 1}. Email: ${user.email}, Name: ${user.firstName} ${user.lastName}, Role: ${user.role || 'NOT SET'}`);
    });

    // Check all incidents and their reportedBy field
    console.log('\n2. Checking all incidents and their reporters:');
    const incidents = await Incident.find({}).populate('reportedBy', 'email firstName lastName role');
    console.log(`Total incidents found: ${incidents.length}`);
    
    incidents.forEach((incident, index) => {
      const reporter = incident.reportedBy;
      console.log(`${index + 1}. Title: ${incident.title}, Reporter: ${reporter ? `${reporter.email} (${reporter.role})` : 'NO REPORTER'}, Status: ${incident.status}`);
    });

    // Check for incidents without reportedBy
    console.log('\n3. Checking for incidents without reportedBy field:');
    const incidentsWithoutReporter = await Incident.find({ reportedBy: { $exists: false } });
    console.log(`Incidents without reportedBy: ${incidentsWithoutReporter.length}`);
    
    if (incidentsWithoutReporter.length > 0) {
      incidentsWithoutReporter.forEach((incident, index) => {
        console.log(`${index + 1}. Title: ${incident.title}, ID: ${incident._id}`);
      });
    }

    // Check for users with specific roles
    console.log('\n4. Checking users by role:');
    const adminUsers = await User.find({ role: 'admin' }).select('email firstName lastName');
    const authorityUsers = await User.find({ role: 'authority' }).select('email firstName lastName');
    const regularUsers = await User.find({ role: 'user' }).select('email firstName lastName');
    
    console.log(`Admin users: ${adminUsers.length}`);
    adminUsers.forEach(user => console.log(`  - ${user.email} (${user.firstName} ${user.lastName})`));
    
    console.log(`Authority users: ${authorityUsers.length}`);
    authorityUsers.forEach(user => console.log(`  - ${user.email} (${user.firstName} ${user.lastName})`));
    
    console.log(`Regular users: ${regularUsers.length}`);
    regularUsers.forEach(user => console.log(`  - ${user.email} (${user.firstName} ${user.lastName})`));

    // Test getUserIncidents for a specific user
    if (regularUsers.length > 0) {
      console.log('\n5. Testing getUserIncidents for first regular user:');
      const testUser = regularUsers[0];
      const userIncidents = await Incident.find({ reportedBy: testUser._id });
      console.log(`User ${testUser.email} has ${userIncidents.length} incidents:`);
      userIncidents.forEach((incident, index) => {
        console.log(`  ${index + 1}. ${incident.title} - ${incident.status}`);
      });
    }

  } catch (error) {
    console.error('Error in debug script:', error);
  } finally {
    mongoose.connection.close();
  }
}

debugIssues();
