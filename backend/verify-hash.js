const bcrypt = require('bcryptjs');

// This is a real bcrypt hash
const hash = '$2b$10$MOJMKSvZfuTPMi3pEnCq7.RX5albjj5mct.uo8xoUuGOTdLimdadG';

// Test passwords
const testPasswords = [
    'password',
    '123456',
    'admin',
    'food123',
    'test',
    'user'
];

console.log('Verifying bcrypt hash:', hash);
console.log('\nTesting passwords:');

testPasswords.forEach(password => {
    const isValid = bcrypt.compareSync(password, hash);
    console.log(`"${password}": ${isValid ? '✓ MATCH' : '✗ No match'}`);
});

// Generate a new hash for comparison
const newPassword = 'test123';
const newHash = bcrypt.hashSync(newPassword, 10);
console.log('\nNew hash for "test123":', newHash);

// Verify the new hash
const isNewValid = bcrypt.compareSync(newPassword, newHash);
console.log('New hash verification:', isNewValid ? '✓ Valid' : '✗ Invalid');
