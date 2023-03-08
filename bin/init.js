import axios from 'axios';
import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';
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
    feeds: [],
    posts: [],
    readPostIds: [],
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
    modalTitle: document.querySelector('.modal-title'),
    modalBody: document.querySelector('.modal-body'),
    modalReadButton: document.querySelector('.btn-primary'),
  };

  const timeoutInterval = 5000;

  const watchedState = onChange(state, render(state, htmlElements, i18nInstance));

  const validateInputUrl = (inputText) => {
    const validateSchema = yup
      .string()
      .url()
      .notOneOf(state.feeds.map((feed) => feed.url))
      .required();
    validateSchema.validate(inputText)
      .then((inputUrl) => {
        const url = getAllOriginsUrl(inputUrl);
        axios.get(url)
          .then((response) => {
            if (response.status === 200) {
              if (rssValidate(response.data.contents)) {
                const rssData = rssParser(response.data.contents);
                const feed = {
                  title: rssData.feed.title,
                  description: rssData.feed.description,
                  url: inputText,
                };
                const posts = rssData.posts.map((post) => ({
                  title: post.title,
                  link: post.link,
                  description: post.description,
                  id: _.uniqueId('postID_'),
                }));
                watchedState.form.errors = '';
                watchedState.feeds.unshift(feed);
                watchedState.posts = posts.concat(state.posts);
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

  const rssUpdate = () => {
    state.feeds.forEach((feed) => {
      const url = getAllOriginsUrl(feed.url);
      axios.get(url)
        .then((response) => {
          watchedState.form.errors = '';
          const newData = rssParser(response.data.contents);
          const postsTitle = state.posts.map((post) => post.title);
          const newPosts = newData.posts
            .filter((newPost) => !postsTitle.includes(newPost.title))
            .map((newPost) => ({ ...newPost, id: _.uniqueId('postID_') }));
          if (newPosts.length) {
            watchedState.posts = newPosts.concat(state.posts);
          }
        })
        .catch((error) => {
          watchedState.form.errors = i18nInstance.t(`errorMessages.${error.code}`);
        });
    });
    setTimeout(rssUpdate, timeoutInterval);
  };

  rssUpdate();

  htmlElements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputUrl = formData.get('url');
    validateInputUrl(inputUrl);
  });

  htmlElements.posts.addEventListener('click', ({ target }) => {
    const postId = target.dataset.id;
    if (postId !== undefined) {
      watchedState.readPostIds = _.union([postId], state.readPostIds);
    }
  });
};

export default init;
