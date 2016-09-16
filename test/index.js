const path = require('path');

const IconMaker = require(path.join(__dirname, '..', 'index.js'));

const iconMaker = new IconMaker({ files: ['ttf', 'woff'] });
iconMaker.addSvg(path.join(__dirname, 'svg', 'yin-yan.svg'));
iconMaker.addSvg(path.join(__dirname, 'svg', 'yin-yan.svg'), 'blaEE');
iconMaker.run((err, fonts) => {
  console.log(fonts[0].fontFiles[0].path);
});