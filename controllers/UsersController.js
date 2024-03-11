const crypto = require('crypto');
const dbClient = require('../utils/db');

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
      const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');

      // Insert the new user into the database
      const result = await dbClient.users.insertOne({ email, password: hashedPassword });

      // Return the newly created user
      const newUser = { _id: result.insertedId, email, password: hashedPassword };
      return res.status(201).json(newUser);
    } catch (error) {
      console.error('Error creating user:', error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

module.exports = UsersController;
