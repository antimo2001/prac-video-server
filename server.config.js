const path = require('path');
const util = require('util');
const debug = require('debug')('prac-video-server:server.config');
const DEFAULT_VIDEO_PATH = path.join(__dirname, 'testdata');
const { PORT, HOMEPATH, VIDEO_STORAGE_DIR } = process.env;
const isBranch = (/branch/).test(HOMEPATH);

const defaultConfig = {
  port: PORT || 4242,
  sortFolders: 'asc',
  storageDir: DEFAULT_VIDEO_PATH,
  indexfile: 'index-generated.html',
  rxFileFilter: (/\.(mp4|MTS|mpg)/i),
  rxFolders: (/\d+/),
};

const branchConfig = {
  port: 6996,
  sortFolders: 'desc',
  storageDir: VIDEO_STORAGE_DIR,
  rxFolders: (/\b[2-9]|(B[LR]\d*)\b/i),
};

debug({ isBranch });

let config = isBranch ? branchConfig : defaultConfig;
config = Object.assign(defaultConfig, config);

debug(`SERVERCONFIG==${util.inspect(config)}`);

module.exports = config;
