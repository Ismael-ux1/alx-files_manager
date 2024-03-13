const sha1 = require('sha1');
const uuidv4 = require('uuid').v4;
const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class AuthController {
  static async getConnect(req, res) {
    const auth = req.headers.authorization;
    if (!auth) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const credentials = Buffer.from(auth.split(' ')[1], 'base64').toString('ascii').split(':');
    const email = credentials[0];
    const password = sha1(credentials[1]);

    const user = await dbClient.db.collection('users').findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    await redisClient.set(`auth_${token}`, user._id.toString(), 86400);

    return res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token || !(await redisClient.get(`auth_${token}`))) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    await redisClient.del(`auth_${token}`);
    return res.status(204).end();
  }
}

module.exports = AuthController;
