const getAllOriginsUrl = (url) => {
  const allOriginsUrl = new URL('https://allorigins.hexlet.app/get');
  allOriginsUrl.searchParams.set('disableCache', 'true');
  allOriginsUrl.searchParams.set('url', url);
  return allOriginsUrl;
};

export default getAllOriginsUrl;
