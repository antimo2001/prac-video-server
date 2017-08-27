const path = require('path');
const testdataDir = path.join(__dirname, 'testdata');

module.exports = {
  port: process.env.PORT || 4242,
  storageDir: process.env.VIDEO_STORAGE_DIR || testdataDir,
  rxFileFilter: (/\.(mp4|MTS)/i),
  rxFolders: (/\b(3|4|5|6|7)\b/i),
}