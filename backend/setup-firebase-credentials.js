/**
 * Firebase Credentials Setup Helper
 * 
 * This script helps you format Firebase service account credentials for your .env file
 * 
 * Instructions:
 * 1. Go to Firebase Console: https://console.firebase.google.com/
 * 2. Select your project: oheee-f0367
 * 3. Go to Project Settings → Service Accounts
 * 4. Click "Generate new private key"
 * 5. Download the JSON file
 * 6. Replace the serviceAccountJson variable below with your downloaded JSON content
 * 7. Run this script: node setup-firebase-credentials.js
 * 8. Copy the output to your .env file
 */

// REPLACE THIS WITH YOUR DOWNLOADED SERVICE ACCOUNT JSON
const serviceAccountJson = {
  // Paste your Firebase service account JSON here
  // Example structure:
  // {
  //   "type": "service_account",
  //   "project_id": "oheee-f0367",
  //   "private_key_id": "your_key_id",
  //   "private_key": "-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n",
  //   "client_email": "firebase-adminsdk-xxxxx@oheee-f0367.iam.gserviceaccount.com",
  //   "client_id": "your_client_id",
  //   "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  //   "token_uri": "https://oauth2.googleapis.com/token",
  //   "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
  //   "client_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs/firebase-adminsdk-xxxxx%40oheee-f0367.iam.gserviceaccount.com"
  // }
};

function generateEnvVariables(serviceAccount) {
  if (!serviceAccount.project_id) {
    console.log('❌ Please replace the serviceAccountJson variable with your actual Firebase service account JSON');
    console.log('📝 Instructions:');
    console.log('   1. Go to Firebase Console → Project Settings → Service Accounts');
    console.log('   2. Click "Generate new private key"');
    console.log('   3. Download the JSON file');
    console.log('   4. Replace the serviceAccountJson variable in this file');
    console.log('   5. Run this script again');
    return;
  }

  console.log('🔥 Firebase Environment Variables for .env file:');
  console.log('================================================');
  console.log('');
  console.log(`FIREBASE_PROJECT_ID=${serviceAccount.project_id}`);
  console.log(`FIREBASE_PRIVATE_KEY_ID=${serviceAccount.private_key_id}`);
  console.log(`FIREBASE_PRIVATE_KEY="${serviceAccount.private_key.replace(/\n/g, '\\n')}"`);
  console.log(`FIREBASE_CLIENT_EMAIL=${serviceAccount.client_email}`);
  console.log(`FIREBASE_CLIENT_ID=${serviceAccount.client_id}`);
  console.log(`FIREBASE_CLIENT_X509_CERT_URL=${serviceAccount.client_x509_cert_url}`);
  console.log('');
  console.log('================================================');
  console.log('✅ Copy the above variables to your backend/.env file');
  console.log('⚠️  Make sure to keep the quotes around FIREBASE_PRIVATE_KEY');
}

// Run the generator
generateEnvVariables(serviceAccountJson);

// Alternative: If you have the JSON file saved, you can read it directly
// const fs = require('fs');
// const path = require('path');
// 
// try {
//   const serviceAccountPath = path.join(__dirname, 'service-account-key.json');
//   if (fs.existsSync(serviceAccountPath)) {
//     const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));
//     generateEnvVariables(serviceAccount);
//   }
// } catch (error) {
//   console.log('Could not read service-account-key.json file');
// }
