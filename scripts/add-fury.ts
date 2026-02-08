import 'dotenv/config';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

const agents = [
  {
    name: 'clawdbot',
    displayName: 'Clawdbot',
    role: 'Coordinator',
    sessionKey: 'agent:main:main',
    status: 'idle',
  },
  {
    name: 'friday',
    displayName: 'Friday',
    role: 'Backend Developer',
    sessionKey: 'agent:backend:main',
    status: 'idle',
  },
  {
    name: 'pixel',
    displayName: 'Pixel',
    role: 'Frontend Developer',
    sessionKey: 'agent:frontend:main',
    status: 'idle',
  },
  {
    name: 'fury',
    displayName: 'Fury',
    role: 'Researcher',
    sessionKey: 'agent:research:main',
    status: 'idle',
  },
];

async function main() {
  console.log('🌱 Adding Fury (Research Agent)...');

  for (const agent of agents) {
    const created = await prisma.agent.upsert({
      where: { name: agent.name },
      update: agent,
      create: agent,
    });
    console.log(`✅ Agent: ${created.displayName} (${created.role})`);
  }

  console.log('🎉 Done!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
