const path = require('path');

module.exports = {
  app: path.join(__dirname, 'src'),
  build: path.join(__dirname, '../dist'), // 被clean的路径
};
