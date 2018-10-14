const path = require('path');
const util = require('util');
const debug = require('debug')('prac-video-server:server.config');
const DEFAULT_VIDEO_PATH = path.join(__dirname, 'testdata');
const { PORT, HOMEPATH, VIDEO_STORAGE_DIR } = process.env;
const IS_BRANCH = (/branch/).test(HOMEPATH);

const defaults = {
  port: 4242,
  sortFolders: 'asc',
  storageDir: DEFAULT_VIDEO_PATH,
  rxFileFilter: (/\.(mp4|MTS|mpg)/i),
  rxFolders: (/\b[2-9]|(B[LR]\d*)\b/i),
};

const branchConf = {
  port: 6996,
  sortFolders: 'desc',
  storageDir: VIDEO_STORAGE_DIR
};

let config = IS_BRANCH ? branchConf : defaults;
config = Object.assign(defaults, config);

debug(`SERVERCONFIG==${util.inspect(config)}`);

module.exports = config;
