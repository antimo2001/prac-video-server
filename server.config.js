const path = require('path');
const DEFAULT_VIDEO_PATH = path.join(__dirname, 'testdata');

/**
 * Return the path to the directory of files
 */
const setStoragePath = () => {
  const { HOMEPATH, VIDEO_STORAGE_DIR } = process.env;
  //If HOMEPATH contains branch, then use VIDEO_STORAGE_DIR, else use default
  return (/branch/).test(HOMEPATH) ? VIDEO_STORAGE_DIR : DEFAULT_VIDEO_PATH;
}

module.exports = {
  port: process.env.PORT || 4242,
  sortFolders: 'desc',
  storageDir: setStoragePath(),
  rxFileFilter: (/\.(mp4|MTS|mpg)/i),
  rxFolders: (/\b[2-9]|(B[LR]\d*)\b/i),
}