const renderErrors = (value, htmlElements) => {
  const { feedbackMessage } = htmlElements;
  feedbackMessage.textContent = value;
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

const renderFeeds = (value, previousValue, htmlElements, i18nInstance) => {
  const { feeds } = htmlElements;

  if (!previousValue.length) {
    renderCards(htmlElements, i18nInstance);
  }
  const feedData = value.at(0);
  const feedsList = feeds.querySelector('.list-group');
  const feedsItem = document.createElement('li');
  feedsItem.classList.add('list-group-item', 'border-0', 'border-end-0');
  const feedTitle = document.createElement('h3');
  feedTitle.classList.add('h6', 'm-0');
  feedTitle.textContent = feedData.title;
  const feedDescription = document.createElement('p');
  feedDescription.classList.add('m-0', 'small', 'text-black-50');
  feedDescription.textContent = feedData.description;
  feedsItem.append(feedTitle, feedDescription);
  feedsList.prepend(feedsItem);
};

const renderPosts = (postsData, htmlElements, state, i18nInstance) => {
  const { posts } = htmlElements;
  const postsList = posts.querySelector('.list-group');
  postsList.textContent = '';
  postsData.forEach((postData) => {
    const postsListItem = document.createElement('li');
    postsListItem.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    const postLink = document.createElement('a');
    const linkClass = state.readPostIds.includes(postData.id)
      ? 'fw-normal'
      : 'fw-bold';
    postLink.classList.add(linkClass);
    postLink.setAttribute('href', postData.link);
    postLink.setAttribute('target', '_blank');
    postLink.setAttribute('rel', 'noopener noreferrer');
    postLink.dataset.id = '2';
    postLink.textContent = postData.title;
    const viewButton = document.createElement('button');
    viewButton.type = 'button';
    viewButton.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    viewButton.dataset.id = postData.id;
    viewButton.dataset.bsToggle = 'modal';
    viewButton.dataset.bsTarget = '#modal';
    viewButton.textContent = i18nInstance.t('postsContainer.viewButton');
    postsListItem.append(postLink, viewButton);
    postsList.append(postsListItem);
  });
};

const renderModal = (state, value, htmlElements) => {
  const {
    posts,
    modalTitle,
    modalBody,
    modalReadButton,
  } = htmlElements;
  const postId = value.at(0);
  const postData = state.posts.filter((post) => post.id === postId).at(0);
  modalTitle.textContent = postData.title;
  modalBody.textContent = postData.description;
  modalReadButton.href = postData.link;
  const post = posts.querySelector(`a[href="${postData.link}"]`);
  post.classList.add('fw-normal');
  post.classList.remove('fw-bold');
};

const renderFormElements = (value, htmlElements, i18nInstance) => {
  const {
    button,
    form,
    input,
    feedbackMessage,
  } = htmlElements;

  switch (value) {
    case 'filling':
      button.disabled = false;
      break;
    case 'waiting':
      button.disabled = true;
      input.classList.remove('is-invalid');
      break;
    case 'error':
      button.disabled = false;
      feedbackMessage.classList.remove('text-success');
      feedbackMessage.classList.add('text-danger');
      input.classList.add('is-invalid');
      break;
    case 'added':
      button.disabled = false;
      feedbackMessage.classList.remove('text-danger');
      feedbackMessage.classList.add('text-success');
      feedbackMessage.textContent = i18nInstance.t('feedbackMessage.rssLoadOk');
      input.classList.remove('is-invalid');
      form.reset();
      input.focus();
      break;
    default:
      break;
  }
};

const render = (state, htmlElements, i18nInstance) => (path, value, previousValue) => {
  switch (path) {
    case 'errors':
      renderErrors(value, htmlElements);
      break;
    case 'feeds':
      renderFeeds(value, previousValue, htmlElements, i18nInstance);
      break;
    case 'posts':
      renderPosts(value, htmlElements, state, i18nInstance);
      break;
    case 'readPostIds':
      renderModal(state, value, htmlElements);
      break;
    case 'form.process':
      renderFormElements(value, htmlElements, i18nInstance);
      break;
    default:
      break;
  }
};

export default render;
