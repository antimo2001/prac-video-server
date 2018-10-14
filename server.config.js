const path = require('path');
const testdataDir = path.join(__dirname, 'testdata');

module.exports = {
  port: process.env.PORT || 4242,
  sortFolders: 'desc',
  // storageDir: process.env.VIDEO_STORAGE_DIR || testdataDir,
  storageDir: testdataDir,
  rxFileFilter: (/\.(mp4|MTS|mpg)/i),
  rxFolders: (/\b[3-9]|(B[LR]\d*)\b/i),
}