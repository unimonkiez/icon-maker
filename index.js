const path = require('path');
const Fontmin = require('fontmin');
const replaceCssContents = require('./replace-css-contents');

module.exports = class IconMaker {
  constructor({
    files = ['ttf', 'woff', 'eot', 'svg']
  } = {}) {
    if (files === undefined || !Array.isArray(files)) {
      throw new Error(`\`files\` must be an array, got ${typeof files}.`);
    }
    if (files.some(file => ['ttf', 'eot', 'woff', 'svg'].indexOf(file) === -1)) {
      throw new Error('`files` must contain only `ttf`, `eot`, `woff` and `svg`.');
    }
    if (files.indexOf('ttf') === -1) {
      throw new Error('`files` must contain `ttf`.');
    }
    this._files = files;
    this._fonts = {};
  }
  addSvg(svgPath, fontFamily = 'default') {
    const fonts = this._fonts;
    if (fonts[fontFamily] === undefined) {
      fonts[fontFamily] = [];
    }
    fonts[fontFamily].push(svgPath);
  }
  run(cb) {
    if (typeof cb !== 'function') {
      throw new Error(`\`run\` must get first param which is a function, git ${typeof cb}.`);
    }

    const files = this._files;
    const fontsPromises = Object.keys(this._fonts).map(fontFamily => new Promise((resolve, reject) => {
      const svgPaths = this._fonts[fontFamily];

      let fontmin = new Fontmin().src(svgPaths).use(Fontmin.svgs2ttf(fontFamily));
      if (files.indexOf('eot') !== -1) {
        fontmin = fontmin.use(Fontmin.ttf2eot({ fontFamily }));
      }
      if (files.indexOf('woff') !== -1) {
        fontmin = fontmin.use(Fontmin.ttf2woff({ fontFamily }));
      }
      if (files.indexOf('svg') !== -1) {
        fontmin = fontmin.use(Fontmin.ttf2svg({ fontFamily }));
      }
      fontmin.use(Fontmin.css({
        fontFamily,
        iconPrefix: fontFamily,
        glyph: true
      }));

      fontmin.run((err, fontFiles) => {
        if (err) {
          reject(err);
        }
        resolve(
          fontFiles.reduce((obj, fontFile) => {
            if (path.extname(fontFile.path) === '.css') {
              const cssContents = replaceCssContents(fontFile.contents.toString(), files);

              return Object.assign(obj, {
                css: cssContents
              });
            } else {
              return Object.assign(obj, {
                fontFiles: (obj.fontFiles || [])
                .concat(fontFile)
              });
            }
          }, { fontFamily })
        );
      });
    }));

    Promise.all(fontsPromises).then(fonts => {
      cb(undefined, fonts);
    }, err => {
      cb(err);
    });
  }
};
