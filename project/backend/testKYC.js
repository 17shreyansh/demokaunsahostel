const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

// Test configuration
const API_BASE = 'http://localhost:5000/api';
const TEST_EMAIL = 'test@example.com';
const TEST_PASSWORD = 'password123';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  warn: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`)
};

// Store cookies between requests
let cookies = '';

// Test 1: Check server health
async function testHealth() {
  try {
    log.info('Testing server health...');
    const response = await axios.get(`${API_BASE}/health`);
    log.success('Server is running');
    return true;
  } catch (error) {
    log.error(`Server health check failed: ${error.message}`);
    return false;
  }
}

// Test 2: Login as hostel manager
async function testLogin() {
  try {
    log.info(`Attempting login with ${TEST_EMAIL}...`);
    const response = await axios.post(
      `${API_BASE}/hostel-manager/auth/login`,
      { email: TEST_EMAIL, password: TEST_PASSWORD },
      { withCredentials: true }
    );
    
    // Extract cookies from response
    if (response.headers['set-cookie']) {
      cookies = response.headers['set-cookie'].map(cookie => cookie.split(';')[0]).join('; ');
      log.success('Login successful');
      log.info(`Manager ID: ${response.data.manager.id}`);
      log.info(`KYC Status: ${response.data.manager.kycStatus}`);
      return response.data.manager;
    } else {
      log.warn('No cookies received (check CORS settings)');
      return response.data.manager;
    }
  } catch (error) {
    if (error.response?.status === 401) {
      log.error('Login failed: Invalid credentials');
      log.warn(`Please ensure user ${TEST_EMAIL} exists or update credentials in script`);
    } else {
      log.error(`Login failed: ${error.response?.data?.message || error.message}`);
    }
    return null;
  }
}

// Test 3: Get current manager profile
async function testGetMe() {
  try {
    log.info('Testing /me endpoint...');
    const response = await axios.get(
      `${API_BASE}/hostel-manager/auth/me`,
      { 
        withCredentials: true,
        headers: { Cookie: cookies }
      }
    );
    log.success('Profile retrieved successfully');
    return response.data.manager;
  } catch (error) {
    log.error(`Get profile failed: ${error.response?.data?.message || error.message}`);
    if (error.response?.status === 401) {
      log.warn('Authentication failed - token may be missing or invalid');
    }
    return null;
  }
}

// Test 4: Test KYC endpoint (without actual file upload)
async function testKYCEndpoint() {
  try {
    log.info('Testing KYC endpoint accessibility...');
    
    const formData = new FormData();
    formData.append('companyName', 'Test Company');
    formData.append('companyType', 'private-limited');
    formData.append('gstNumber', '22AAAAA0000A1Z5');
    formData.append('accountNumber', '1234567890');
    formData.append('ifscCode', 'SBIN0001234');
    formData.append('bankName', 'Test Bank');
    formData.append('accountHolderName', 'Test User');
    
    const response = await axios.post(
      `${API_BASE}/hostel-manager/auth/kyc`,
      formData,
      {
        withCredentials: true,
        headers: {
          ...formData.getHeaders(),
          Cookie: cookies
        }
      }
    );
    
    log.success('KYC endpoint is accessible');
    return true;
  } catch (error) {
    if (error.response?.status === 404) {
      log.error('KYC endpoint not found (404)');
      log.warn('Check if route is properly mounted in server.js');
    } else if (error.response?.status === 401) {
      log.error('Authentication failed for KYC endpoint');
      log.warn('Token may be missing or invalid');
    } else {
      log.error(`KYC test failed: ${error.response?.data?.message || error.message}`);
    }
    return false;
  }
}

// Test 5: Check uploads folder
function testUploadsFolder() {
  const uploadsPath = './uploads';
  if (fs.existsSync(uploadsPath)) {
    log.success('Uploads folder exists');
    const stats = fs.statSync(uploadsPath);
    log.info(`Folder permissions: ${stats.mode.toString(8).slice(-3)}`);
    return true;
  } else {
    log.error('Uploads folder does not exist');
    log.warn('Create it with: mkdir uploads');
    return false;
  }
}

// Test 6: Check environment variables
function testEnvVars() {
  require('dotenv').config();
  
  const required = ['JWT_SECRET', 'MONGODB_URI'];
  let allPresent = true;
  
  required.forEach(key => {
    if (process.env[key]) {
      log.success(`${key} is set`);
    } else {
      log.error(`${key} is missing from .env`);
      allPresent = false;
    }
  });
  
  return allPresent;
}

// Main test runner
async function runTests() {
  console.log('\n========================================');
  console.log('  KYC Endpoint Test Suite');
  console.log('========================================\n');
  
  // Run tests
  log.info('Step 1: Environment Variables');
  testEnvVars();
  console.log('');
  
  log.info('Step 2: Uploads Folder');
  testUploadsFolder();
  console.log('');
  
  log.info('Step 3: Server Health');
  const healthOk = await testHealth();
  console.log('');
  
  if (!healthOk) {
    log.error('Server is not running. Start it with: npm start');
    return;
  }
  
  log.info('Step 4: Login Test');
  const manager = await testLogin();
  console.log('');
  
  if (!manager) {
    log.error('Cannot proceed without authentication');
    log.info('To create test user, run in MongoDB:');
    console.log(`
db.hostelmanagers.insertOne({
  name: "Test Manager",
  email: "${TEST_EMAIL}",
  password: "$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYIeWIvCu3m", // password123
  phone: "1234567890",
  kyc: { status: "pending" },
  hostels: [],
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date()
})
    `);
    return;
  }
  
  log.info('Step 5: Profile Retrieval');
  await testGetMe();
  console.log('');
  
  log.info('Step 6: KYC Endpoint Test');
  await testKYCEndpoint();
  console.log('');
  
  console.log('========================================');
  console.log('  Test Suite Complete');
  console.log('========================================\n');
}

// Run tests
runTests().catch(err => {
  log.error(`Test suite crashed: ${err.message}`);
  console.error(err);
});
