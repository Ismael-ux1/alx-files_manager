const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class FilesController {
  static async postUpload(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const {
      name, type, parentId = '0', isPublic = false, data,
    } = req.body;
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type' });
    }

    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    if (parentId !== '0') {
      const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
      if (!parentFile) {
        return res.status(400).json({ error: 'Parent not found' });
      }

      if (parentFile.type !== 'folder') {
        return res.status(400).json({ error: 'Parent is not a folder' });
      }
    }

    if (type === 'folder') {
      const newFolder = await dbClient.db.collection('files').insertOne({
        userId, name, type, isPublic, parentId,
      });
      return res.status(201).json({
        id: newFolder.insertedId, userId, name, type, isPublic, parentId,
      });
    }

    const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const fileUuid = uuidv4();
    const localPath = path.join(folderPath, fileUuid);
    fs.writeFileSync(localPath, Buffer.from(data, 'base64'));

    const newFile = await dbClient.db.collection('files').insertOne({
      userId, name, type, isPublic, parentId, localPath,
    });
    return res.status(201).json({
      id: newFile.insertedId, userId, name, type, isPublic, parentId, localPath,
    });
  }

  static async getShow(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const fileId = req.params.id;
    const file = await dbClient.db.collection('files').findOne({ _id: ObjectId(fileId), userId: ObjectId(userId) });
    if (!file) {
      return res.status(404).json({ error: 'Not found' });
    }
    return res.status(200).json(file);
  }

  static async getIndex(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const parentId = req.query.parentId || '0';
    const page = parseInt(req.query.page, 10) || 0;
    const limit = 20;
    const skip = page * limit;

    const files = await dbClient.db.collection('files').find({
      parentId: ObjectId(parentId),
      userId: ObjectId(userId),
    }).skip(skip).limit(limit)
      .toArray();

    return res.status(200).json(files);
  }

  static async putPublish(req, res) {
    try {
      const file = await File.findById(req.params.id);
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }
      file.isPublic = true;
      await file.save();
      return res.status(200).json(file);
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  static async putUnpublish(req, res) {
    try {
      const file = await File.findById(req.params.id);
      if (!file) {
        return res.status(404).json({ error: 'Not found' });
      }
      file.isPublic = false;
      await file.save();
      return res.status(200).json(file);
    } catch (error) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }
  static async getFile(req, res) {
    try {
      const file = await File.findById(req.params.id);
      if (!file) {
        return res.status(404).send({ error: 'Not found' });
      }
      if (!file.isPublic && (!req.user || req.user.id !== file.userId)) {
        return res.status(404).send({ error: 'Not found' });
      }
      if (file.type === 'folder') {
        return res.status(400).send({ error: "A folder doesn't have content" });
      }
      if (!fs.existsSync(file.localPath)) {
        return res.status(404).send({ error: 'Not found' });
      }
      const mimeType = mime.lookup(file.name) || 'application/octet-stream';
      res.type(mimeType).sendFile(file.localPath);
    } catch (error) {
      res.status(500).send({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
