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
  /**
   * this reads from config.storageDir and creates array of mappedFolders for
   * easier processing later
   */
  const getFoldersSync = () => {
    return fs.readdirSync(config.storageDir).filter(folder => {
      //Filter by the specified folders
      let isincludedFolder = config.rxFolders.test(folder);
      debug({ folder, isincludedFolder });
      return isincludedFolder;
    }).map(folder => {
      //Filter each folder by only the specified file extensions
      let path2folder = path.join(config.storageDir, folder);
      let files = fs.readdirSync(path2folder).filter(file => {
        let isincluded = config.rxFileFilter.test(file);
        return isincluded;
      });
      //Create object containing the folderName and its specific video files
      let mappedFolder = { folder, files };
      debug({ mappedFolder });
      return mappedFolder;
    });
  };

  const makeHtmlFolderSection = (item) => {
    let files = item.files.map(file => {
      return `<li><a href="view/${item.folder}/${file}">${file}</a></li>`;
    });
    //Create html for each section that contains video files
    return (`
      <div id=${item.folder}>
      <h2>${item.folder}</h2>
      <ol>
        ${files.join('\n        ')}
      </ol>
      </div>`
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
  const writeHtmlSync = () => {
    let movieFolders = getFoldersSync().map(makeHtmlFolderSection);
    movieFolders = sortFolders(movieFolders);
    movieFolders = movieFolders.join('\n      ');

    const htmlcontent = (`<html>
      <body>
        <main>
          ${movieFolders}
        </main>
      </body>
      </html>`
    );

    const indexfilepath = `public/${config.indexfile}`;
    debug({ indexfilepath });

    fs.writeFileSync(indexfilepath, htmlcontent, 'utf8');
    debug(`${htmlcontent}`);
  };

  /**
   * this wrapper function is the externally invoked function for this
   * module's writeHtmlSync function
   */
  const generateHtmlSync = () => {
    writeHtmlSync();
    debug('Done generating index-generated.html');
  }

  /**
   * this reads from config.storageDir and creates array of mappedFolders for
   * easier processing later. note that this is async
   */
  const getFoldersAsync = () => {
    return readdirPromise(config.storageDir).then(items => {
      //Filter by the specified folders
      let folderPromises = items.filter(folder => {
        let isincludedFolder = config.rxFolders.test(folder);
        debug({ folder, isincludedFolder });
        return isincludedFolder;
      }).map(folder => {
        let path2folder = path.join(config.storageDir, folder);
        return readdirPromise(path2folder).then(files => {
          return { folder, files };
        });
      });
      
      //Using array of promised folders, create the html for each folder
      return Promise.all(folderPromises).then(items => {
        //Filter each folder by only the specified file extensions
        const folders = items.map(item => {
          const {folder, files} = item;
          let filterFiles = files.filter(file => {
            let isIncluded = config.rxFileFilter.test(file);
            debug({ msg: 'include this file?', file, isIncluded });
            return isIncluded;
          });
          //Create object containing the folderName and its specific video files
          const mappedFolder = { folder, files: filterFiles };
          // debug({ mappedFolder });
          return mappedFolder;
        });

        debug({ folders });
        return folders;
      }).catch(err => {
        debug({ msg: '***Error during getFoldersAsync', err });
        throw err;
      });
    });
  };

  /**
   * this creates a middleware function for use in the video server's middlewares
   */
  const generateHtmlRequest = () => {
    const indexfilepath = `public/${config.indexfile}`;
    debug({ indexfilepath });

    //Return a middleware function
    return function (req, res, next) {
      getFoldersAsync().then(folders => {
        let movieFolders = folders.map(makeHtmlFolderSection);
        movieFolders = sortFolders(movieFolders);
        movieFolders = movieFolders.join('\n      ');

        let htmlcontent = (`<html> <body> <main>
            ${movieFolders}
          </main> </body> </html>`
        );
        debug(`${htmlcontent}`);
        return writeFilePromise(indexfilepath, htmlcontent, 'utf8');
      }).then(next).catch(next);
    }
  }

  return { generateHtmlRequest, generateHtmlSync };
})();
