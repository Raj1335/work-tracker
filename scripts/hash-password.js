// Run: node scripts/hash-password.js "your-strong-password"
// Prints the value to paste into the PASSWORD_HASH env var on Vercel.
const crypto = require("crypto");

const password = process.argv[2];
if (!password) {
  console.error('Usage: node scripts/hash-password.js "your-strong-password"');
  process.exit(1);
}
if (password.length < 12) {
  console.error("Use a password of at least 12 characters — this gates real data.");
  process.exit(1);
}

const salt = crypto.randomBytes(16);
const hash = crypto.pbkdf2Sync(password, salt, 210_000, 32, "sha256");

console.log("\nPASSWORD_HASH=" + salt.toString("hex") + ":" + hash.toString("hex"));
console.log("\nAlso generate a SESSION_SECRET (random, unrelated to your password):");
console.log("SESSION_SECRET=" + crypto.randomBytes(32).toString("hex") + "\n");
