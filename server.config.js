module.exports = {
  port: process.env.PORT || 4242,
  storageDir: process.env.VIDEO_STORAGE_DIR,
  rxFileFilter: (/\.(mp4|MTS)/i),
}