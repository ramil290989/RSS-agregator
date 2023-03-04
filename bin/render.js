const renderErrors = (value, htmlElements) => {
  const { feedbackMessage, input } = htmlElements;
  const addError = (error) => {
    feedbackMessage.classList.remove('text-success');
    feedbackMessage.classList.add('text-danger');
    feedbackMessage.textContent = error;
    input.classList.add('is-invalid');
  };
  const removeError = () => {
    feedbackMessage.textContent = '';
    input.classList.remove('is-invalid');
  };
  if (value !== '') {
    addError(value);
  } else {
    removeError();
  }
};

const renderCards = (htmlElements, i18nInstance) => {
  const { feeds, posts } = htmlElements;
  const feedsCard = document.createElement('div');
  feedsCard.classList.add('card', 'border-0');
  const feedsCardBody = document.createElement('div');
  feedsCardBody.classList.add('card-body');
  const feedsCardTitle = document.createElement('h2');
  feedsCardTitle.classList.add('card-title', 'h4');
  feedsCardTitle.textContent = i18nInstance.t('feedsContainer.feeds');
  feedsCardBody.append(feedsCardTitle);
  feedsCard.append(feedsCardBody);
  const feedsList = document.createElement('ul');
  feedsList.classList.add('list-group', 'border-0', 'rounded-0');
  feedsCard.append(feedsList);
  feeds.append(feedsCard);
  const postsCard = document.createElement('div');
  postsCard.classList.add('card', 'border-0');
  const postsCardBody = document.createElement('div');
  postsCardBody.classList.add('card-body');
  const postsCardTitle = document.createElement('h2');
  postsCardTitle.classList.add('card-title', 'h4');
  postsCardTitle.textContent = i18nInstance.t('postsContainer.posts');
  postsCardBody.append(postsCardTitle);
  postsCard.append(postsCardBody);
  const postsList = document.createElement('ul');
  postsList.classList.add('list-group', 'border-0', 'rounded-0');
  postsCard.append(postsList);
  posts.append(postsCard);
};

const renderRss = (value, previousValue, htmlElements, i18nInstance) => {
  const {
    feeds,
    posts,
    feedbackMessage,
    form,
    input,
  } = htmlElements;

  if (!previousValue.length) {
    renderCards(htmlElements, i18nInstance);
  }
  const rssData = value.at(-1);
  const feedsList = feeds.querySelector('.list-group');
  const feedsItem = document.createElement('li');
  feedsItem.classList.add('list-group-item', 'border-0', 'border-end-0');
  const feedTitle = document.createElement('h3');
  feedTitle.classList.add('h6', 'm-0');
  feedTitle.textContent = rssData.feed.title;
  const feedDescription = document.createElement('p');
  feedDescription.classList.add('m-0', 'small', 'text-black-50');
  feedDescription.textContent = rssData.feed.description;
  feedsItem.append(feedTitle, feedDescription);
  feedsList.append(feedsItem);
  const postsList = posts.querySelector('.list-group');
  const rssPosts = rssData.posts;
  rssPosts.forEach((post) => {
    const postsListItem = document.createElement('li');
    postsListItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const postLink = document.createElement('a');
    postLink.classList.add('fw-bold');
    postLink.setAttribute('href', post.link);
    postLink.setAttribute('target', '_blank');
    postLink.setAttribute('rel', 'noopener noreferrer');
    postLink.dataset.id = '2';
    postLink.textContent = post.title;
    const viewButton = document.createElement('button');
    viewButton.type = 'button';
    viewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    viewButton.dataset.id = post.id;
    viewButton.dataset.bsToggle = 'modal';
    viewButton.dataset.bsTarget = '#modal';
    viewButton.textContent = i18nInstance.t('postsContainer.viewButton');
    postsListItem.append(postLink, viewButton);
    postsList.append(postsListItem);
  });
  feedbackMessage.classList.remove('text-danger');
  feedbackMessage.classList.add('text-success');
  feedbackMessage.textContent = i18nInstance.t('feedbackMessage.rssLoadOk');
  form.reset();
  input.focus();
};

const render = (state, htmlElements, i18nInstance) => (path, value, previousValue) => {
  switch (path) {
    case 'form.errors':
      renderErrors(value, htmlElements);
      break;
    case 'rss':
      renderRss(value, previousValue, htmlElements, i18nInstance);
      break;
    default:
      break;
  }
};

export default render;
