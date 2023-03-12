const rssValidate = (xmlString) => {
  let result;
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
  if (!xmlDoc.querySelector('parsererror')) {
    result = xmlDoc.firstElementChild.tagName === 'rss';
  } else {
    result = false;
  }
  return result;
};

export default rssValidate;
