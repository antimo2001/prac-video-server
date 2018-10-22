const fs = require('fs');
const path = require('path');
const util = require('util');
const readdirPromise = util.promisify(fs.readdir);
const writeFilePromise = util.promisify(fs.writeFile);
const debug = require('debug')('prac-video-server:generateHtml');
const config = require('./server.config');

/**
 * Module to generate the static index.html with filenames from the storage dir
 */
module.exports = (function() {
  const indexfilepath = `public/${config.indexfile}`;

  /**
   * this reads from config.storageDir and creates array of mappedFolders for
   * easier processing later
   */
  const getFoldersSync = () => {
    //Filter by the specified folders
    return fs.readdirSync(config.storageDir).filter(folder => {
      let isincludedFolder = config.rxFolders.test(folder);
      debug({ folder, isincludedFolder });
      return isincludedFolder;
    }).map(folder => {
      //Filter each folder by only the specified file extensions
      let path2folder = path.join(config.storageDir, folder);
      let files = fs.readdirSync(path2folder).filter(f => {
        return config.rxFileFilter.test(f)
      });
      //Create object containing the folderName and its specific video files
      let mappedFolder = { folder, files };
      debug({ mappedFolder });
      return mappedFolder;
    });
  };

  /**
   * Returns string of html for each folder of files
   * @param {object} item
   */
  const makeHtmlFolderSection = (item) => {
    let { folder, files } = item;
    files = files.map(f => `<li><a href="view/${folder}/${f}">${f}</a></li>`);
    //Create html for each section that contains video files
    return (
      `<section id=${folder}>
        <h2>${folder}</h2>
        <ol>
          ${files.join('\n        ')}
        </ol>
      </section>`
    );
  }

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

  return { generateHtmlRequest, generateHtmlSync };
})();
