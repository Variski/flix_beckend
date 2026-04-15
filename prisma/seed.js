require('dotenv').config();
const { Pool } = require('pg');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding genres...');
  await prisma.genre.createMany({
    data: [
      { name: 'Action' }, { name: 'Comedy' }, { name: 'Drama' },
      { name: 'Horror' }, { name: 'Romance' }, { name: 'Sci-Fi' },
      { name: 'Thriller' }, { name: 'Animation' }, { name: 'Documentary' },
      { name: 'Fantasy' },
    ],
    skipDuplicates: true,
  });

  console.log('🌱 Seeding moods...');
  await prisma.mood.createMany({
    data: [
      { name: 'Santai',     emoji: '😌', colorHex: '#74B9FF' },
      { name: 'Seru',       emoji: '🔥', colorHex: '#FD79A8' },
      { name: 'Sedih',      emoji: '😢', colorHex: '#A29BFE' },
      { name: 'Romantis',   emoji: '❤️',  colorHex: '#FF7675' },
      { name: 'Tegang',     emoji: '😱', colorHex: '#FDCB6E' },
      { name: 'Inspiratif', emoji: '✨', colorHex: '#55EFC4' },
      { name: 'Lucu',       emoji: '😂', colorHex: '#FFEAA7' },
    ],
    skipDuplicates: true,
  });

  console.log('🌱 Seeding admin user...');
  const bcrypt = require('bcryptjs');
  await prisma.user.upsert({
    where: { email: 'admin@flix.com' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@flix.com',
      passwordHash: await bcrypt.hash('admin123', 12),
      role: 'admin',
    },
  });

  console.log('✅ Seed selesai!');
  console.log('');
  console.log('📋 Admin Account:');
  console.log('   Email    : admin@flix.com');
  console.log('   Password : admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); await pool.end(); });
