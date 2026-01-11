import { prisma } from '../lib/prisma';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';

async function createAdminUser() {
  const adminEmail = 'harrymailbox11@gmail.com';
  const adminPassword = 'harish123';
  const adminName = 'Admin User';

  try {
    // Check if admin already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: adminEmail },
    });

    const hashedPassword = await bcrypt.hash(adminPassword, 12);

    if (existingUser) {
      if (!existingUser.password) {
        const updated = await prisma.user.update({
          where: { id: existingUser.id },
          data: { 
            password: hashedPassword, 
            name: existingUser.name ?? adminName, 
            emailVerified: existingUser.emailVerified ?? new Date(),
            updatedAt: new Date()
          },
        });
        console.log('Existing user found without password. Password set successfully:');
        console.log(`Email: ${updated.email}`);
        console.log(`ID: ${updated.id}`);
      } else {
        console.log('Admin user already exists with a password:');
        console.log(`Email: ${existingUser.email}`);
        console.log(`ID: ${existingUser.id}`);
      }
      return;
    }

    // Create the admin user
    const adminUser = await prisma.user.create({
      data: {
        id: randomUUID().replace(/-/g, ''),
        name: adminName,
        email: adminEmail,
        password: hashedPassword,
        emailVerified: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    console.log('Admin user created successfully:');
    console.log(`Email: ${adminUser.email}`);
    console.log(`ID: ${adminUser.id}`);
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdminUser();
