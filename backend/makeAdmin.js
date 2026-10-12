// makeAdmin.js: creates (or upgrades) an admin account
// Usage: node makeAdmin.js your@email.com YourPassword
require('dotenv').config();
const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const [email, password] = process.argv.slice(2);
  if (!email || !password) {
    console.log('Usage: node makeAdmin.js email password');
    return;
  }

  // hash the password the same way the register route does
  const hashed = await bcrypt.hash(password, 10);

  // if the email already exists, reset its password and make it admin;
  // otherwise create a new admin user
  const user = await prisma.user.upsert({
    where: { email },
    update: { password: hashed, isAdmin: true },
    create: { name: 'MONTRA Admin', email, password: hashed, isAdmin: true },
  });

  console.log('Admin ready:', user.email);
}

main().finally(() => prisma.$disconnect());