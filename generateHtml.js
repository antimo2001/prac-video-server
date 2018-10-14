const debug = require('debug')('prac-video-server:generateHtml');
const fs = require('fs');
const path = require('path');
const config = require('./server.config');

/**
 * Generate the static index.html with filenames from the storage dir
 */
module.exports = () => {

  /**
   * this reads from config.storageDir and creates array of mappedFolders for
   * easier processing in the writeHtml function
   */
  const getFoldersSync = () => {
    return fs.readdirSync(config.storageDir).filter(folder => {
      //Filter by the specified folders
      let isincludedFolder = config.rxFolders.test(folder);
      debug('(folder,isincludedFolder)===', folder, isincludedFolder);
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
      debug('mappedFolder===%j', mappedFolder);
      return mappedFolder;
    });
  };
  
  /**
   * this sorts the movie folders based on config.sortFolders flag
   */
  const sortFolders = (movieFolders) => {
    if (config.sortFolders.startsWith('desc')) {
      debug(`sort folders in descending order`);
      return movieFolders.reverse();
    } else {
      return movieFolders;
    }
  }

  /**
   * this writes the HTML content for each folder of video files
   */
  const writeHtmlSync = () => {
    let movieFolders = getFoldersSync().map(item => {
      //Create html elements for each video file
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
    });

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
    fs.writeFileSync('public/index-generated.html', htmlcontent, 'utf8');
    debug(`${htmlcontent}`);
  };
  
  //----------------------------MAIN----------------------------
  {
    writeHtmlSync();
    debug('Done generating index-generated.html');
  }
}
