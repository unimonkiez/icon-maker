module.exports = (cssContents, isLocalCss) => cssContents
  .replace(/vertical\-align: top;\n/g, '')
  .replace(isLocalCss ? /(\..*?){/g : '', isLocalCss ? ((_, w) => `:local(${w.trim()}) {`) : ''); // Change class to locale class
