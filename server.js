const debug = require('debug')('prac-video-server:server');
// const express = require('express');
const serveStatic = require('serve-static');
const server = require('video-server');
const config = require('./server.config');
const { generateHtmlRequest, generateHtmlSync } = require('./generateHtml/main');

/**
 * Set the port and storage directory from environment variables
 */
server.set('PORT', config.port);
server.set('STORAGE_DIR', config.storageDir);
debug(`PORT set to ${config.port}`);
debug(`STORAGE_DIR set to ${config.storageDir}`);

/**
 * Setup the static-server
 */
generateHtmlSync();
// server.use(generateHtmlRequest());
server.use(serveStatic('public', {'index': [config.indexfile]}));
// server.use(serveStatic(config.storageDir));

/**
 * Finally, start the video server
 */
server.listen(config.port, () => console.log(`Listening on port ${config.port}`));