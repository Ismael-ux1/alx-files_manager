const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      // Find user by email and hashed password
      const user = await dbClient.db.collection('users').findOne({ email, password: sha1(password) });
      if (!user) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Generate token
      const token = uuidv4();

      // Store user ID in Redis with token key for 24 hours
      await redisClient.set(`auth_${token}`, user._id.toString(), 'EX', 86400);

      // Return token
      res.status(200).json({ token });
    } catch (error) {
      console.error('Error signing in user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];

    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const userId = await redisClient.get(`auth_${token}`);
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      // Delete token from Redis
      await redisClient.del(`auth_${token}`);

      res.status(204).send();
    } catch (error) {
      console.error('Error signing out user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = AuthController;
