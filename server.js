const debug = require('debug')('prac-video-server:server');
// const express = require('express');
const serveStatic = require('serve-static');
const server = require('video-server');
const config = require('./server.config');
const generateHtml = require('./generateHtml');

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
generateHtml();
server.use(serveStatic('public', {'index': ['index-generated.html']}));
// server.use(serveStatic(config.storageDir));

/**
 * Finally, start the video server
 */
server.listen(config.port, () => console.log(`Listening on port ${config.port}`));