const debug = require('debug')('prac-video-server:server.js');
// const express = require('express');
const path = require('path');
const fs = require('fs');
const serveStatic = require('serve-static');
const server = require('video-server');
const config = require('./server.config');

/**
 * Set the port and storage directory from environment variables
 */
const storageDir = config.storageDir || path.join(__dirname, 'testdata');
server.set('STORAGE_DIR', storageDir);

/**
 * Generate the static index.html with filenames from the storage dir
 */
let files = fs.readdirSync(storageDir).filter(file => {
    let isincluded = config.rxFileFilter.test(file)
    debug('(file/isincluded)===(%s/%s)', file, isincluded);
    return isincluded;
});
debug(`filtered video-files to these: ${JSON.stringify(files)}`);

let movieFiles = files.map(file => `<p><a href="view/${file}">${file}</p>`);
let htmlcontent = (`<html>
  <body>
    <div id="movieFiles">
      ${movieFiles.join('\n      ')}
    </div>
  </body>
</html>`
);
fs.writeFileSync('public/index-generated.html', htmlcontent, 'utf8');
debug('Done generating index-generated.html');
debug(`${htmlcontent}`);

/**
 * Setup the static-server
 */
server.use(serveStatic('public', {'index': ['index-generated.html']}));

/**
 * Finally, start the video server
 */
server.on('open', () => debug(`Listening on port ${config.port}`));
server.listen(config.port);