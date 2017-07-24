const debug = require('debug')('prac-video-server:generateHtml');
const fs = require('fs');
const config = require('./server.config');
/**
 * Generate the static index.html with filenames from the storage dir
 */
module.exports = () => {
  const movieFiles = fs.readdirSync(config.storageDir).filter(file => {
    let isincluded = config.rxFileFilter.test(file);
    debug('(file/isincluded)===(%s/%s)', file, isincluded);
    return isincluded;
  }).map(file => {
    return `<p><a href="view/${file}">${file}</p>`;
  });

  const htmlcontent = (`<html>
    <body>
      <div id="movieFiles">
        ${movieFiles.join('\n      ')}
      </div>
    </body>
  </html>`
  );
  fs.writeFileSync('public/index-generated.html', htmlcontent, 'utf8');
  debug(`${htmlcontent}`);
  debug('Done generating index-generated.html');
}
