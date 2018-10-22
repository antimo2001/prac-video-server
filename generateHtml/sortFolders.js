const debug = require('debug')('prac-video-server:generateHtml:sortFolders');
const config = require('../server.config');

/**
  * this sorts the movie folders based on config.sortFolders flag
  */
const sortFolders = (movieFolders) => {
  if (config.sortFolders.startsWith('desc')) {
    debug('sort folders in descending order: %s', config.sortFolders);
    return movieFolders.reverse();
  } else {
    return movieFolders;
  }
}

module.exports = sortFolders;