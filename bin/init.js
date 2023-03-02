import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import resources from '../src/locales/index.js';
import render from './render.js';

const init = () => {
  const state = {
    form: {
      processState: 'filling',
      errors: '',
    },
    feeds: [],
    posts: [],
    readPostsId: [],
  };

  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  });

  yup.setLocale({
    string: {
      url: 'urlIsInvalid',
    },
    mixed: {
      notOneOf: 'sameFeed',
      required: 'inputRequired',
    },
  });

  const htmlElements = {
    form: document.querySelector('.rss-form'),
    input: document.querySelector('#url-input'),
    feedbackMessage: document.querySelector('.feedback'),
    feeds: document.querySelector('.feeds'),
  };

  const watchedState = onChange(state, render(state, htmlElements, i18nInstance));

  const validateInputUrl = (inputText) => {
    const validateSchema = yup
      .string()
      .url()
      .notOneOf(state.feeds)
      .required();
    validateSchema.validate(inputText)
      .then((newFeed) => {
        watchedState.form.errors = '';
        watchedState.feeds.push(newFeed);
      })
      .catch((error) => {
        watchedState.form.errors = i18nInstance.t(`errorMessages.${error.errors}`);
      });
  };

  htmlElements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputUrl = formData.get('url');
    validateInputUrl(inputUrl);
  });
};

export default init;
