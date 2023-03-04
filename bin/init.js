import axios from 'axios';
import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import resources from '../src/locales/index.js';
import render from './render.js';
import rssValidate from './rssValidate.js';
import rssParser from './rssParser.js';
import getAllOriginsUrl from './getAllOriginsUrl.js';

const init = () => {
  const state = {
    form: {
      processState: 'filling',
      errors: '',
    },
    rss: [],
    feedsUrl: [],
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
    posts: document.querySelector('.posts'),
  };

  const watchedState = onChange(state, render(state, htmlElements, i18nInstance));

  const validateInputUrl = (inputText) => {
    const validateSchema = yup
      .string()
      .url()
      .notOneOf(state.feedsUrl)
      .required();
    validateSchema.validate(inputText)
      .then((inputUrl) => {
        const url = getAllOriginsUrl(inputUrl);
        axios.get(url)
          .then((response) => {
            if (response.status === 200) {
              if (rssValidate(response.data.contents)) {
                state.feedsUrl.push(inputText);
                const rssData = rssParser(response.data.contents);
                watchedState.form.errors = '';
                watchedState.rss.push(rssData);
              } else {
                watchedState.form.errors = i18nInstance.t('errorMessages.noRssData');
              }
            }
          })
          .catch((error) => {
            watchedState.form.errors = i18nInstance.t(`errorMessages.${error.code}`);
          });
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
