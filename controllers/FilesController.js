const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const dbClient = require('../utils/db');

class FilesController {
  static async postUpload(req, res) {
    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    // Validate request body
    if (!name) {
      return res.status(400).json({ error: 'Missing name' });
    }
    if (!type || !['folder', 'file', 'image'].includes(type)) {
      return res.status(400).json({ error: 'Missing type or invalid type' });
    }
    if (type !== 'folder' && !data) {
      return res.status(400).json({ error: 'Missing data' });
    }

    // Retrieve user based on token
    const { user } = req;
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Check if parentId exists and is a folder
      if (parentId !== 0) {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: parentId });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      let localPath = null;
      // If type is not folder, save file locally
      if (type !== 'folder') {
        const storingFolder = process.env.FOLDER_PATH || '/tmp/files_manager';
        if (!fs.existsSync(storingFolder)) {
          fs.mkdirSync(storingFolder, { recursive: true });
        }
        localPath = `${storingFolder}/${uuidv4()}`;
        const buffer = Buffer.from(data, 'base64');
        fs.writeFileSync(localPath, buffer);
      }

      // Create new file document in the database
      const newFile = {
        userId: user._id,
        name,
        type,
        parentId,
        isPublic,
        localPath,
      };
      const result = await dbClient.db.collection('files').insertOne(newFile);

      // Return the new file with status code 201
      return res.status(201).json({ ...newFile, _id: result.insertedId });
    } catch (error) {
      console.error('Error creating file:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = FilesController;
