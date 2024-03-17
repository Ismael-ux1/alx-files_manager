const Queue = require('bull');
const fs = require('fs').promises;
const path = require('path');
const { getFileById } = require('./utils/db');


const userQueue = new Queue('userQueue', 'redis://127.0.0.1:6379');

userQueue.process(async (job) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const user = await getUserById(ObjectId(userId));

  if (!user) {
    throw new Error('User not found');
  }

  // Send welcome email
  sendWelcomeEmail(user.email);

  // Log welcome message to console
  console.log(`Welcome ${user.email}!`);
});


