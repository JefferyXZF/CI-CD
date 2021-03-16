'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  // router.get('/', controller.home.index);
  router.post('/webhook/:key', controller.home.webhook);
  router.get('/message', controller.message.messageSwitch);
  router.post('/test/:key', controller.home.test);
  router.get('/test/:key', controller.home.test);
};
