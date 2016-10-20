module.exports = (cssContents, isLocalCss) => cssContents
  .replace(isLocalCss ? /(\..*?){/g : '', isLocalCss ? ((_, w) => `:local(${w.trim()}) {`) : ''); // Change class to locale class
