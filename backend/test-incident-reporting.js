const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

const User = require('./models/user.model.js');
const Incident = require('./models/incident.model.js');

async function testIncidentReporting() {
  try {
    console.log('\n=== TESTING INCIDENT REPORTING ===\n');

    // Find a regular user to test with
    const testUser = await User.findOne({ role: 'user' });
    if (!testUser) {
      console.log('No regular user found. Creating one for testing...');
      
      // Create a test user
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('test123', 10);
      
      const newUser = new User({
        firstName: 'Test',
        lastName: 'User',
        email: 'testuser@example.com',
        mobile: '9876543210',
        address: 'Test Address',
        aadharCard: '987654321098',
        password: hashedPassword,
        role: 'user'
      });
      
      await newUser.save();
      console.log('Test user created:', newUser.email);
    }

    // Get the test user (either existing or newly created)
    const user = testUser || await User.findOne({ email: 'testuser@example.com' });
    console.log('Using test user:', user.email, 'ID:', user._id);

    // Create a test incident
    const testIncident = new Incident({
      title: 'Test Incident',
      description: 'This is a test incident for debugging',
      location: 'Test Location',
      reportedBy: user._id,
      image: 'test-image-path.jpg',
      severity: 'medium',
      status: 'reported'
    });

    await testIncident.save();
    console.log('Test incident created:', testIncident.title);
    console.log('Reported by:', testIncident.reportedBy);

    // Now test the getUserIncidents query
    console.log('\n=== TESTING getUserIncidents QUERY ===\n');
    
    const userIncidents = await Incident.find({ reportedBy: user._id })
      .sort({ createdAt: -1 });
    
    console.log(`Found ${userIncidents.length} incidents for user ${user.email}:`);
    userIncidents.forEach((incident, index) => {
      console.log(`${index + 1}. ${incident.title} - Status: ${incident.status} - ReportedBy: ${incident.reportedBy}`);
    });

    // Test with populated data
    console.log('\n=== TESTING WITH POPULATED DATA ===\n');
    
    const populatedIncidents = await Incident.find({ reportedBy: user._id })
      .populate('reportedBy', 'email firstName lastName role')
      .sort({ createdAt: -1 });
    
    console.log(`Found ${populatedIncidents.length} incidents with populated reporter data:`);
    populatedIncidents.forEach((incident, index) => {
      const reporter = incident.reportedBy;
      console.log(`${index + 1}. ${incident.title} - Reporter: ${reporter ? `${reporter.email} (${reporter.role})` : 'NO REPORTER'}`);
    });

  } catch (error) {
    console.error('Error in test script:', error);
  } finally {
    mongoose.connection.close();
  }
}

testIncidentReporting();
