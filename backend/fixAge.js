// fixAge.js: changes every "18+" age group to "adult"
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

prisma.product
  .updateMany({ where: { ageGroup: '18+' }, data: { ageGroup: 'adult' } })
  .then(r => console.log('Updated ' + r.count + ' products'))
  .finally(() => prisma.$disconnect());