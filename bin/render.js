const renderErrors = (value, htmlElements) => {
  const { feedbackMessage, input } = htmlElements;
  const addError = (error) => {
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

const renderFeeds = (value, previousValue, htmlElements, i18nInstance) => {
  const { form, input, feeds } = htmlElements;
  if (!previousValue.length) {
    const feedCard = document.createElement('div');
    feedCard.classList.add('card', 'border-0');
    const cardBody = document.createElement('div');
    cardBody.classList.add('card-body');
    const cardTitle = document.createElement('h2');
    cardTitle.classList.add('card-title', 'h4');
    cardTitle.textContent = i18nInstance.t('feedsContainer.feeds');
    cardBody.append(cardTitle);
    feedCard.append(cardBody);
    const feedList = document.createElement('ul');
    feedList.classList.add('list-group', 'border-0', 'rounded-0');
    const feedItem = document.createElement('li');
    feedItem.classList.add('list-group-item', 'border-0', 'border-end-0');
    feedItem.textContent = value;
    feedList.append(feedItem);
    feedCard.append(feedList);
    feeds.append(feedCard);
  } else {
    const feedList = feeds.querySelector('.list-group');
    const feedItem = document.createElement('li');
    feedItem.classList.add('list-group-item', 'border-0', 'border-end-0');
    feedItem.textContent = value.at(-1);
    feedList.append(feedItem);
  }
  form.reset();
  input.focus();
};

const render = (state, htmlElements, i18nInstance) => (path, value, previousValue) => {
  switch (path) {
    case 'form.errors':
      renderErrors(value, htmlElements);
      break;
    case 'feeds':
      renderFeeds(value, previousValue, htmlElements, i18nInstance);
      break;
    default:
      break;
  }
};

export default render;
