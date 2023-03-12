import axios from 'axios';
import i18n from 'i18next';
import onChange from 'on-change';
import * as yup from 'yup';
import _ from 'lodash';
import resources from './locales/index.js';
import render from './render.js';
import rssValidate from './rssValidate.js';
import rssParser from './rssParser.js';
import getAllOriginsUrl from './getAllOriginsUrl.js';

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

const validateInputUrl = (inputText, state) => {
  const validateSchema = yup
    .string()
    .url()
    .notOneOf(state.feeds.map((feed) => feed.url))
    .required();
  return validateSchema.validate(inputText);
};

const getRssData = (getResponse) => {
  if (!rssValidate(getResponse.data.contents)) {
    const error = new Error();
    error.name = 'rssIsInvalid';
    throw error;
  }
  return rssParser(getResponse.data.contents);
};

const preparation = (i18nInstance) => {
  const state = {
    form: {
      errors: '',
    },
    feeds: [],
    posts: [],
    readPostIds: [],
  };

  yup.setLocale({
    string: {
      url: 'urlIsInvalid',
    },
    mixed: {
      notOneOf: 'sameFeed',
      required: 'inputRequired',
    },
  });

  const watchedState = onChange(state, render(state, htmlElements, i18nInstance));

  const loadRssData = (inputText) => {
    validateInputUrl(inputText, state)
      .then((url) => axios.get(getAllOriginsUrl(url)))
      .then((response) => getRssData(response))
      .then((rssData) => {
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
      })
      .catch((error) => {
        switch (error.name) {
          case 'ValidationError':
            watchedState.form.errors = i18nInstance.t(`errorMessages.${error.errors}`);
            break;
          case 'rssIsInvalid':
            watchedState.form.errors = i18nInstance.t('errorMessages.noRssData');
            break;
          case 'AxiosError':
            watchedState.form.errors = i18nInstance.t(`errorMessages.${error.code}`);
            break;
          default:
            watchedState.form.errors = i18nInstance.t('errorMessages.undefined');
        }
      });
  };

  const rssUpdate = () => {
    watchedState.form.errors = '';
    const postsTitle = state.posts.map((post) => post.title);
    const newPostsRequests = state.feeds.map((feed) => axios.get(getAllOriginsUrl(feed.url))
      .then((response) => rssParser(response.data.contents))
      .then((newRssData) => {
        const newPosts = newRssData.posts
          .filter((newPost) => !postsTitle.includes(newPost.title))
          .map((newPost) => ({ ...newPost, id: _.uniqueId('postID_') }));
        return newPosts;
      }));

    Promise.all(newPostsRequests)
      .then((allNewPosts) => {
        const newPosts = allNewPosts.flat();
        if (newPosts.length) {
          watchedState.posts = newPosts.concat(state.posts);
        }
      })
      .then(() => {
        console.log('update');
        setTimeout(rssUpdate, timeoutInterval);
      })
      .catch((error) => {
        console.log(error);
        watchedState.form.errors = i18nInstance.t(`errorMessages.${error.code}`);
      });
  };

  rssUpdate();

  htmlElements.form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const inputUrl = formData.get('url');
    loadRssData(inputUrl);
  });

  htmlElements.posts.addEventListener('click', ({ target }) => {
    const postId = target.dataset.id;
    if (postId !== undefined) {
      watchedState.readPostIds = _.union([postId], state.readPostIds);
    }
  });
};

const init = () => {
  const i18nInstance = i18n.createInstance();
  i18nInstance.init({
    lng: 'ru',
    debug: false,
    resources,
  }).then(() => preparation(i18nInstance));
};

export default init;
