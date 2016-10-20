const path = require('path');
const webfontsGenerator = require('webfonts-generator');
const Vinyl = require('vinyl');
const replaceCssContents = require('./replace-css-contents');

module.exports = class IconMaker {
  constructor({
    files = ['ttf', 'woff', 'eot', 'svg'],
    fontFamily = 'icon-maker',
    isLocalCss = false
  } = {}) {
    if (files === undefined || !Array.isArray(files)) {
      throw new Error(`\`files\` must be an array, got ${typeof files}.`);
    }
    if (files.some(file => ['ttf', 'eot', 'woff', 'svg'].indexOf(file) === -1)) {
      throw new Error('`files` must contain only `ttf`, `eot`, `woff` and `svg`.');
    }
    this._fontFamily = fontFamily;
    this._files = files;
    this._isLocalCss = isLocalCss;
    this._svgs = [];
  }
  addSvg(svgPath) {
    this._svgs.push(svgPath);
  }
  run(cb) {
    if (typeof cb !== 'function') {
      throw new Error(`\`run\` must get first param which is a function, git ${typeof cb}.`);
    }

    const files = this._files;
    const isLocalCss = this._isLocalCss;
    const svgPaths = this._svgs;
    const fontFamily = this._fontFamily;

    webfontsGenerator({
      files: svgPaths,
      types: files,
      fontName: fontFamily,
      writeFiles: false,
      dest: 'build', // Required but doesn't get used
      fontHeight: 1000,
      templateOptions: {
        classPrefix: `${fontFamily}-`,
        baseClass: fontFamily
      }
    }, (err, result) => {
      if (err) {
        cb(err);
      }
      let css = result.generateCss(files.reduce((obj, file) => Object.assign(obj, {
        [file]: `./${fontFamily}.${file}`
      }),{}));
      css = replaceCssContents(css, isLocalCss);

      cb(undefined, {
        fontFamily,
        fontFiles: files.map(file => new Vinyl({
          cwd: '/',
          base: '/',
          path: `/${fontFamily}.${file}`,
          contents: new Buffer(result[file])
        })),
        css
      });
    });
  }
};
