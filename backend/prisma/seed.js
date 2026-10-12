// prisma/seed.js
// This script adds a batch of sample products to the database automatically.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = [
  { name: "Heavyweight Oversized Tee", description: "Premium heavyweight cotton tee, oversized fit.", price: 45, oldPrice: null, image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=700&auto=format&fit=crop", category: "tshirt", collection: "original", ageGroup: "adult", stock: 20 },
  { name: "Essential Zip Hoodie", description: "Brushed fleece zip hoodie, relaxed fit.", price: 85, oldPrice: 110, image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=700&auto=format&fit=crop", category: "hoodie", collection: "original", ageGroup: "adult", stock: 15 },
  { name: "Brushed Crewneck Sweatshirt", description: "Soft brushed cotton crewneck.", price: 68, oldPrice: null, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=700&auto=format&fit=crop", category: "sweatshirt", collection: "original", ageGroup: "adult", stock: 18 },
  { name: "Structured Wool Overcoat", description: "Tailored wool overcoat, limited run.", price: 240, oldPrice: null, image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=700&auto=format&fit=crop", category: "outerwear", collection: "original", ageGroup: "adult", stock: 5 },
  { name: "Relaxed Fit Denim", description: "Relaxed fit denim jeans.", price: 95, oldPrice: null, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=700&auto=format&fit=crop", category: "denim", collection: "original", ageGroup: "adult", stock: 12 },
];

async function main() {
  console.log('Seeding database...');

  for (const product of products) {
    await prisma.product.create({ data: product });
  }

  console.log(`Seeded ${products.length} products successfully!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });