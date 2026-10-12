// prisma/updateImages.js
// One-time script to fix image URLs on existing products

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const updates = [
  { name: "Heavyweight Oversized Tee", image: "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?q=80&w=700&auto=format&fit=crop" },
  { name: "Essential Zip Hoodie", image: "https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?q=80&w=700&auto=format&fit=crop" },
  { name: "Brushed Crewneck Sweatshirt", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=700&auto=format&fit=crop" },
  { name: "Structured Wool Overcoat", image: "https://images.unsplash.com/photo-1503341504253-dff4815485f1?q=80&w=700&auto=format&fit=crop" },
  { name: "Relaxed Fit Denim", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=700&auto=format&fit=crop" },
];

async function main() {
  for (const update of updates) {
    const result = await prisma.product.updateMany({
      where: { name: update.name },
      data: { image: update.image },
    });
    console.log(`Updated ${result.count} row(s) for "${update.name}"`);
  }
  console.log('Done!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });