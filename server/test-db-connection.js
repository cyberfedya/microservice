const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testConnection() {
  try {
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('✓ Successfully connected to database');
    
    const userCount = await prisma.user.count();
    console.log(`✓ Found ${userCount} users in database`);
    
    await prisma.$disconnect();
    console.log('✓ Connection closed');
  } catch (error) {
    console.error('✗ Database connection failed:');
    console.error(error.message);
    process.exit(1);
  }
}

testConnection();
