import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // Create demo users
  const hashedPassword = await bcrypt.hash('password123', 12);

  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      name: 'Alice Johnson',
      email: 'alice@example.com',
      password: hashedPassword,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alice',
      lastSeen: new Date()
    }
  });

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      name: 'Bob Smith',
      email: 'bob@example.com',
      password: hashedPassword,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=bob',
      lastSeen: new Date()
    }
  });

  const charlie = await prisma.user.upsert({
    where: { email: 'charlie@example.com' },
    update: {},
    create: {
      name: 'Charlie Brown',
      email: 'charlie@example.com',
      password: hashedPassword,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=charlie',
      lastSeen: new Date()
    }
  });

  // Create contacts
  await prisma.contact.upsert({
    where: { ownerId_contactId: { ownerId: alice.id, contactId: bob.id } },
    update: {},
    create: {
      ownerId: alice.id,
      contactId: bob.id
    }
  });

  await prisma.contact.upsert({
    where: { ownerId_contactId: { ownerId: alice.id, contactId: charlie.id } },
    update: {},
    create: {
      ownerId: alice.id,
      contactId: charlie.id
    }
  });

  await prisma.contact.upsert({
    where: { ownerId_contactId: { ownerId: bob.id, contactId: alice.id } },
    update: {},
    create: {
      ownerId: bob.id,
      contactId: alice.id
    }
  });

  // Create threads
  const thread1 = await prisma.thread.upsert({
    where: { userAId_userBId: { userAId: alice.id, userBId: bob.id } },
    update: {},
    create: {
      userAId: alice.id,
      userBId: bob.id
    }
  });

  const thread2 = await prisma.thread.upsert({
    where: { userAId_userBId: { userAId: alice.id, userBId: charlie.id } },
    update: {},
    create: {
      userAId: alice.id,
      userBId: charlie.id
    }
  });

  // Create sample messages
  const messages = [
    {
      threadId: thread1.id,
      senderId: alice.id,
      content: 'Hey Bob! How are you doing?',
      status: 'read'
    },
    {
      threadId: thread1.id,
      senderId: bob.id,
      content: 'Hi Alice! I\'m doing great, thanks for asking. How about you?',
      status: 'read'
    },
    {
      threadId: thread1.id,
      senderId: alice.id,
      content: 'I\'m good too! Just working on this new chat app project.',
      status: 'read'
    },
    {
      threadId: thread1.id,
      senderId: bob.id,
      content: 'That sounds exciting! What tech stack are you using?',
      status: 'delivered'
    },
    {
      threadId: thread2.id,
      senderId: alice.id,
      content: 'Hey Charlie! Are you free for a coffee later?',
      status: 'sent'
    }
  ];

  for (const messageData of messages) {
    const message = await prisma.message.create({
      data: messageData
    });

    // Update thread's last message
    await prisma.thread.update({
      where: { id: messageData.threadId },
      data: { lastMessageId: message.id }
    });
  }

  console.log('✅ Seed completed successfully!');
  console.log('📧 Demo users created:');
  console.log('  - alice@example.com (password: password123)');
  console.log('  - bob@example.com (password: password123)');
  console.log('  - charlie@example.com (password: password123)');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
