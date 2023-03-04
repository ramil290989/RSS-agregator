const rssValidate = (xmlString) => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlString, 'application/xml');
  return xmlDoc.firstElementChild.tagName === 'rss';
};

export default rssValidate;
