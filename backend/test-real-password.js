const bcrypt = require('bcryptjs');

// The hash you saw in the database
const realHash = '$2b$10$MOJMKSvZfuTPMi3pEnCq7.RX5albjj5mct.uo8xoUuGOTdLimdadG';

// Let's try some common passwords and also create a test
const testPasswords = [
    'password',
    '123456',
    'admin',
    'food123',
    'test',
    'user',
    'qwerty',
    'letmein',
    'welcome',
    'monkey'
];

console.log('🔍 TESTING REAL BCRYPT HASH');
console.log('Hash:', realHash);
console.log('This is a REAL bcrypt hash - it starts with $2b$10$\n');

console.log('🧪 Testing common passwords:');
let found = false;
testPasswords.forEach(password => {
    const isValid = bcrypt.compareSync(password, realHash);
    if (isValid) {
        console.log(`✅ FOUND MATCH: "${password}"`);
        found = true;
    } else {
        console.log(`❌ "${password}" - No match`);
    }
});

if (!found) {
    console.log('\n🤔 None of the common passwords matched.');
    console.log('This means the original password was something unique.');
    console.log('The hash is REAL and VALID, but we need the original password to verify it.');
}

// Show how bcrypt works
console.log('\n📚 How bcrypt works:');
console.log('1. Original password gets hashed with salt');
console.log('2. Each hash is unique (even for same password)');
console.log('3. You can only verify by comparing with original password');
console.log('4. You cannot "decrypt" a bcrypt hash');

// Create example
const examplePassword = 'example123';
const exampleHash = bcrypt.hashSync(examplePassword, 10);
console.log('\n📝 Example:');
console.log(`Password: "${examplePassword}"`);
console.log(`Hash: ${exampleHash}`);
console.log(`Verification: ${bcrypt.compareSync(examplePassword, exampleHash) ? '✅ Valid' : '❌ Invalid'}`);
