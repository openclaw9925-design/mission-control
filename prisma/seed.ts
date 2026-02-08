import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const initialAgents = [
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
];

async function main() {
  console.log('🌱 Seeding database...');

  // Create agents
  for (const agent of initialAgents) {
    const created = await prisma.agent.upsert({
      where: { name: agent.name },
      update: agent,
      create: agent,
    });
    console.log(`✅ Created/Updated agent: ${created.displayName} (${created.role})`);
  }

  // Create a sample task
  const clawdbot = await prisma.agent.findUnique({
    where: { name: 'clawdbot' },
  });

  if (clawdbot) {
    const task = await prisma.task.upsert({
      where: { id: 'sample-task-1' },
      update: {},
      create: {
        id: 'sample-task-1',
        title: 'Welcome to Mission Control',
        description: 'This is a sample task to get you started. Assign it to an agent and track progress!',
        status: 'inbox',
        priority: 'medium',
        createdById: clawdbot.id,
      },
    });
    console.log(`✅ Created sample task: ${task.title}`);

    // Create an activity for the task
    await prisma.activity.upsert({
      where: { id: 'sample-activity-1' },
      update: {},
      create: {
        id: 'sample-activity-1',
        type: 'task_created',
        agentId: clawdbot.id,
        taskId: task.id,
        message: 'Created welcome task',
      },
    });
    console.log(`✅ Created sample activity`);
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
