// seedDemo.js: adds sample products for the client demo
// Run once with: node seedDemo.js
require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Placeholder photos (the real product photos replace these later)
const TEE = 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=900&auto=format&fit=crop';
const HOODIE = 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=900&auto=format&fit=crop';
const SWEAT = 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=900&auto=format&fit=crop';
const TEE2 = 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=900&auto=format&fit=crop';
const TEE3 = 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=900&auto=format&fit=crop';
const HOODIE2 = 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=900&auto=format&fit=crop';

const ADULT = 'S,M,L,XL,XXL';
const KIDS = '3-4Y,5-6Y,7-8Y,9-10Y,11-13Y';

const products = [
  // name, description, price, oldPrice, image, category, collection, ageGroup, stock, best, new, event, sizes, colors
  ['Essential Heavyweight Tee', 'A 240gsm cotton tee with a relaxed fit. Built to last season after season.', 25, 32, TEE, 'tshirts', 'original', 'adult', 40, true, false, null, ADULT, 'Black,White,Olive'],
  ['Archive Graphic Tee', 'Vintage-inspired graphic print on soft washed cotton.', 28, null, TEE2, 'tshirts', 'original', 'adult', 25, true, false, null, ADULT, 'Black,Sand'],
  ['Minimal Logo Hoodie', 'Heavyweight brushed fleece hoodie with a clean embroidered logo.', 55, 68, HOODIE, 'hoodies', 'original', 'adult', 30, true, false, null, ADULT, 'Black,Grey,Navy'],
  ['Oversized Crew Sweatshirt', 'Drop-shoulder crew neck in a soft, structured loopback cotton.', 48, null, SWEAT, 'sweatshirts', 'original', 'adult', 20, true, true, null, ADULT, 'Cream,Black'],
  ['Typography Statement Tee', 'Bold typography print on a boxy, premium cotton tee.', 26, null, TEE3, 'tshirts', 'original', 'adult', 35, false, true, null, ADULT, 'White,Black'],
  ['Christmas Knit-Look Sweatshirt', 'Festive sweatshirt with a cosy knit-look pattern.', 45, 55, SWEAT, 'sweatshirts', 'trending', 'adult', 18, false, true, 'Christmas', ADULT, 'Red,Green'],
  ['Halloween Skull Hoodie', 'Limited-run hoodie with a glow-in-the-dark skull print.', 52, null, HOODIE2, 'hoodies', 'trending', 'adult', 15, false, true, 'Halloween', ADULT, 'Black,Orange'],
  ['Valentine Heart Tee', 'Soft cotton tee with a subtle heart graphic.', 24, null, TEE, 'tshirts', 'trending', 'adult', 22, false, false, "Valentine's", ADULT, 'White,Pink'],
  ["Father's Day Classic Tee", 'A simple, well-cut tee made for dads who dress with intention.', 27, null, TEE2, 'tshirts', 'trending', 'adult', 28, false, false, "Father's Day", ADULT, 'Navy,Grey'],
  ['Matchday Football Tee', 'Performance-feel tee for game day.', 30, null, TEE3, 'tshirts', 'trending', 'adult', 26, false, true, 'Football', ADULT, 'Black,White'],
  ['Kids Everyday Hoodie', 'Soft fleece hoodie sized for kids, built for playtime.', 35, 42, HOODIE, 'hoodies', 'original', 'children', 24, false, true, null, KIDS, 'Grey,Navy,Green'],
  ['Kids Graphic Tee', 'Fun graphic tee in easy-wash cotton.', 18, null, TEE, 'tshirts', 'original', 'children', 32, false, false, null, KIDS, 'White,Yellow'],
];

async function main() {
  // skip if the database already has products
  if (await prisma.product.count() > 0) { console.log('Already seeded'); return; }  
  for (const p of products) {
    await prisma.product.create({
      data: {
        name: p[0], description: p[1], price: p[2], oldPrice: p[3], image: p[4],
        category: p[5], collection: p[6], ageGroup: p[7], stock: p[8],
        isBestSeller: p[9], isNewArrival: p[10], eventTag: p[11],
        sizes: p[12], colors: p[13],
      },
    });
  }
  console.log('Added ' + products.length + ' demo products');
}

main().finally(() => prisma.$disconnect());