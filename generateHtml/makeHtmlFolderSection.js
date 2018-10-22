const debug = require('debug')('prac-video-server:generateHtml:makeHtmlFolderSection');

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

module.exports = makeHtmlFolderSection;