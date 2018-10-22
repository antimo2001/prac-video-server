const fs = require('fs');
const path = require('path');
const util = require('util');
const debug = require('debug')('prac-video-server:generateHtml:generateHtmlSync');
const config = require('../server.config');
const makeHtmlFolderSection = require('../generateHtml/makeHtmlFolderSection');
const sortFolders = require('../generateHtml/sortFolders');

/**
 * Module to generate the static index.html with filenames from the storage dir
 */

const indexfilepath = `public/${config.indexfile}`;

/**
 * this reads from config.storageDir and creates array of mappedFolders for
 * easier processing later
 */
const getFoldersSync = () => {
  let folders = fs.readdirSync(config.storageDir);
  //Filter by the specified folders
  folders = folders.filter(folder => {
    let isincludedFolder = config.rxFolders.test(folder);
    debug({ folder, isincludedFolder });
    return isincludedFolder;
  });
  folders = folders.map(folder => {
    //Filter each folder by only the specified file extensions
    let path2folder = path.join(config.storageDir, folder);
    let files = fs.readdirSync(path2folder).filter(f => {
      return config.rxFileFilter.test(f);
    });
    //Create object containing the folderName and its specific video files
    let mappedFolder = { folder, files };
    debug({ mappedFolder });
    return mappedFolder;
  });
  return folders;
};

/**
 * this writes the HTML content for each folder of video files
 */
const generateHtmlSync = () => {
  let movieFolders = getFoldersSync().map(makeHtmlFolderSection);
  movieFolders = sortFolders(movieFolders);
  movieFolders = movieFolders.join('\n      ');
  const htmlcontent = (`<html> <body> <main>
      ${movieFolders}\n</main> </body> </html>`
  );
  debug(`${htmlcontent}`);
  debug({ indexfilepath });
  fs.writeFileSync(indexfilepath, htmlcontent, 'utf8');
  debug('Done generating %s', indexfilepath);
};

module.exports = generateHtmlSync;