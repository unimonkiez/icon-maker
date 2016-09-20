module.exports = (cssContents, fileExtensions, isLocalCss) => {
  const fileExtensionsRegexp = new RegExp('(' + fileExtensions.map(file => `(\\.${file})`).join('|') + ')', 'g');

  return cssContents
  .replace(/\/\*.+?\*\/|\/\/.*(?=[\n\r])/g, '') // Remove comments
  .replace(/src: (.|\n)*?;/g, r => {
    const urls = r
    .replace(/(src: |;|\n)/g, '')
    .split(',')
    .filter(url => url.match(fileExtensionsRegexp));

    if (urls.length > 0) {
      // If there is urls, restore src for them
      return `src: ${urls.join(',\n')};`;
    } else {
      // If there are no urls, remove whole src
      return '';
    }
  }) // Filter out urls from fontFamily's src
  .replace(/\[class\^="(.*)-"\],\n\[class\*=" (.*)-"\]:after/g, (_, w) => `.${w}`)
  .replace(isLocalCss ? /(\..*?){/g : '', isLocalCss ? ((_, w) => `:local(${w.trim()}) {`) : ''); // Change class finder to another base class
};
