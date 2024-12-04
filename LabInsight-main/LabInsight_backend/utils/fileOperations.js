const fs = require('fs/promises');

exports.readTextFile = function(filePath) {
  return fs.readFile(filePath, 'utf8');
};

exports.deleteFile = async function(filePath) {
  await fs.unlink(filePath);
};
