const debug = require('debug')('prac-video-server:generateHtml');
const fs = require('fs');
const path = require('path');
const config = require('./server.config');

const FOLDERS = ['1', '2', '3', '4', '5', '6', '7'];

/**
 * Generate the static index.html with filenames from the storage dir
 */
module.exports = () => {
  const movieFolders = fs.readdirSync(config.storageDir).filter(folder => {
    //Filter by the specified folders
    let isincludedFolder = (FOLDERS.indexOf(folder.toString()) >= 0);
    debug('(folder,isincludedFolder)===', folder, isincludedFolder);
    return isincludedFolder;
  }).map(folder => {
    //Filter each folder by only the specified file extensions
    let path2folder = path.join(config.storageDir, folder);
    let files = fs.readdirSync(path2folder).filter(file => {
      let isincluded = config.rxFileFilter.test(file);
      // debug('(file/isincluded)===(%s/%s)', file, isincluded);
      return isincluded;
    });
    //Create object containing the folderName and its specific video files
    let mappedFolders = { folder, files };
    debug('mappedFolders===%j', mappedFolders);
    return mappedFolders;
  }).map(item => {
    //Create html elements for each video file
    let files = item.files.map(file => {
      return `<li><a href="view/${item.folder}/${file}">${file}</li>`;
    });
    //Create each section contains video files html
    return `
    <div id=${item.folder}>
      <h2>${item.folder}</h2>
      <ol>
        ${files.join('\n        ')}
      </ol>
    </div>
    `;
  });
  
  const htmlcontent = (`<html>
    <body>
      <main>
        ${movieFolders.join('\n      ')}
      </main>
    </body>
  </html>`
  );
  fs.writeFileSync('public/index-generated.html', htmlcontent, 'utf8');
  debug(`${htmlcontent}`);
  debug('Done generating index-generated.html');
}
