'use strict';

const Controller = require('egg').Controller;
const config = require('../../config/config');

class MessageController extends Controller {
  async messageSwitch() {
    const { ctx, app } = this;
    const status = ctx.query.status;
    const key = ctx.query.key;
    if (!key) return;
    const webhook = config.baseWebhook + key;

    try {
      await app.redis.set('gitlabHookSend', status === 'close' ? 'close' : '');
      if (status === 'close') {
        await app.redis.expire('gitlabHookSend', 1800);
      }
    } catch (error) {
      ctx.body = `执行失败，请重新执行！失败原因:${error}`;
    }
    try {
      await ctx.curl(webhook, {
        method: 'POST',
        contentType: 'json',
        data: {
          msgtype: 'markdown',
          markdown: {
            content: `当前消息推送状态已设置为${status === 'close' ? '关闭' : '开启'}`,
          },
        },
        dataType: 'json',
      });
    } catch (error) {
      ctx.body = '执行小助手失败！';
    }
    ctx.body = `执行成功！当前消息推送状态已${status === 'close' ? '关闭' : '开启'}`;
  }
}

module.exports = MessageController;
