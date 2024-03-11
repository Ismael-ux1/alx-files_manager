const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');
const crypto = require('crypto');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const user = await dbClient.db.collection('users').findOne({ email });
    if (user) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
    const newUser = await dbClient.users.insertOne({ email, password: hashedPassword });

    return res.status(201).json({ email, id: newUser.insertedId });
  }
}

module.exports = UsersController;
