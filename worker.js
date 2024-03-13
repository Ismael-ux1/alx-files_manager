const Queue = require('bull');
const imageThumbnail = require('image-thumbnail');
const { getFileById } = require('./utils/db');

const fileQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379');

fileQueue.process(async (job, done) => {
  const { userId, fileId } = job.data;

  if (!fileId) throw new Error('Missing fileId');
  if (!userId) throw new Error('Missing userId');

  const file = await getFileById(fileId, userId);
  if (!file) throw new Error('File not found');

  const sizes = [500, 250, 100];
  await Promise.all(sizes.map(async (size) => {
    const thumbnail = await imageThumbnail(file.path, { width: size });
    const thumbnailPath = `${file.path}_${size}`;
  }));

  done();
});
