const fs = require('fs');
const path = require('path');
const util = require('util');
const readdirPromise = util.promisify(fs.readdir);
const writeFilePromise = util.promisify(fs.writeFile);
const debug = require('debug')('prac-video-server:generateHtml:generateHtmlRequest');
const config = require('../server.config');
const makeHtmlFolderSection = require('../generateHtml/makeHtmlFolderSection');
const sortFolders = require('../generateHtml/sortFolders');
const indexfilepath = `public/${config.indexfile}`;

/**
 * Module to generate the static index.html with filenames from the storage dir
 * This is async and is meant to be used as middleware
 */

/**
 * Setup each folder's files to easily create html later
 * @param {Array} items 
 */
const readEachFoldersFiles = (items) => {
  //Create the promises to read the files in each folder
  const folderPromises = items.map(folder => {
    const path2folder = path.join(config.storageDir, folder);
    return readdirPromise(path2folder).then(files => {
      return { folder, files };
    });
  });
  //Using array of promised folders, setup the folders with files
  return Promise.all(folderPromises).then(data => {
    //Filter each folder by only the specified file extensions
    const folders = data.map(item => {
      const { folder, files } = item;
      const vfiles = files.filter(f => config.rxFileFilter.test(f));
      //Create object containing the folderName and its specific video files
      let mappedFolder = { folder, files: vfiles };
      debug({ mappedFolder });
      return mappedFolder;
    });
    // debug({ folders });
    return folders;
  }).catch(err => {
    debug({ msg: '***Error during makeHtmlFolderWithFiles', err });
    throw err;
  });
}

/**
 * this reads from config.storageDir and creates array of mappedFolders for
 * easier processing later. note that this is async
 */
const getFoldersAsync = () => {
  return readdirPromise(config.storageDir).then(items => {
    //Filter by the specified folders
    let folders = items.filter(f => config.rxFolders.test(f));
    //Read the files in each folder
    return readEachFoldersFiles(folders);
  }).catch(err => {
    debug({ msg: '***Error during getFoldersAsync', err });
    throw err;
  });
};

/**
 * this creates a middleware function for use in a video server's middlewares
 */
const generateHtmlRequest = () => {
  return function (req, res, next) {
    getFoldersAsync().then(folders => {
      let movieFolders = folders.map(makeHtmlFolderSection);
      movieFolders = sortFolders(movieFolders);
      movieFolders = movieFolders.join('\n      ');

      let htmlcontent = (`<html> <body> <main>
          ${movieFolders}\n</main> </body> </html>`
      );
      debug(`${htmlcontent}`);
      debug({ indexfilepath });
      return writeFilePromise(indexfilepath, htmlcontent, 'utf8');
    }).then(() => {
      console.log('Done generating %s', indexfilepath);
      next();
    }).catch(next);
  }
}

module.exports = generateHtmlRequest;
