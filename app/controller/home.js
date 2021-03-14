'use strict';

const Controller = require('egg').Controller;
const config = require('../../config/config');
const events = require('../core/events/index');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }
  // gitlab webhook && 企业微信机器人
  async webhook() {
    const { ctx } = this;
    const body = ctx.request.body;
    const key = ctx.params.key;
    if (!key) return;
    // ctx.logger.info('****** gitlab-start *******');
    // ctx.logger.info('gitlab信息：%j', ctx.request.body);
    // ctx.logger.info('****** gitlab-end *******');

    // 拼接 webhook 链接地址
    const webhook = config.baseWebhook + key;

    try {
      const eventType = body.object_kind;
      // push 推送事件
      if (eventType === 'push') {
        await events.pushEvent(ctx, webhook, body);
      } else if (eventType === 'merge_request') {
        await events.mergeEvent(ctx, webhook, body);
      }
    } catch (ex) {
      console.log(ex);
      this.ctx.body = '请求参数不合法';
    }
  }
  async test() {
    const { ctx } = this;
    const key = ctx.params.key;
    const body = ctx.request.body;
    ctx.logger.info('****** gitlab-start *******', key);
    ctx.logger.info('gitlab信息：%j', ctx.request.body);
    ctx.logger.info('****** gitlab-end *******');
    this.ctx.body = body;
  }
}

module.exports = HomeController;
