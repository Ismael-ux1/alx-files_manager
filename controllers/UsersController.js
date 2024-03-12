const sha1 = require('sha1');
const dbClient = require('../utils/db');
const redisClient = require('../redisClient');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email and password are provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Check if the email already exists
      const userExists = await dbClient.db.collection('users').findOne({ email });
      if (userExists) {
        return res.status(400).json({ error: 'Already exists' });
      }

      // Hash the password
      const hashedPassword = sha1(password);

      // Insert the new user into the database
      const result = await dbClient.db.collection('users').insertOne({ email, password: hashedPassword });

      // Return the newly created user
      const newUser = { id: result.insertedId, email };
      return res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
  static async getMe(req, res) {
    const token = req.headers['x-token'];
    const userId = await redisClient.get(`auth_${token}`);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await dbClient.db.collection('users').findOne({ _id: userId });
    if (!user) {
      return res.status(404).json({ error: 'Not found' });
    }

    return res.status(200).json({ email: user.email, id: user._id });
  }
}

module.exports = UsersController;
