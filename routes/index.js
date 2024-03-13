const express = require('express');
const AppController = require('../controllers/AppController');
const UsersController = require('../controllers/UsersController');
const AuthController = require('../controllers/AuthController');
const FilesController = require('../controllers/FilesController');

const router = express.Router();
const fileQueue = new Queue('fileQueue', 'redis://127.0.0.1:6379');

app.post('/files', (req, res) => {
	fileQueue.add({ userId: user._id, fileId: file._id });
	});

app.get('/files/:id/data', async (req, res) => {
  const { size } = req.query;
  const file = await getFileById(req.params.id);

  if (!file) return res.status(404).send('Not found');

  const filePath = size ? `${file.path}_${size}` : file.path;
  if (!fs.existsSync(filePath)) return res.status(404).send('Not found');

  // Return the file with the correct MIME-type
  const mimeType = mime.lookup(filePath);
  res.type(mimeType).sendFile(filePath);
});

router.get('/status', AppController.getStatus);
router.get('/stats', AppController.getStats);
router.post('/users', UsersController.postNew);
router.get('/connect', AuthController.getConnect);
router.get('/disconnect', AuthController.getDisconnect);
router.get('/users/me', UsersController.getMe);
router.post('/files', FilesController.postUpload);
router.get('/files/:id', FilesController.getShow);
router.get('/files', FilesController.getIndex);
router.put('/files/:id/publish', FilesController.putPublish);
router.put('/files/:id/unpublish', FilesController.putUnpublish);
router.get('/files/:id/data', FilesController.getFile);

module.exports = router;
