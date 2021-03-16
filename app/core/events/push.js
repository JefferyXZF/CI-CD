'use strict';

const config = require('../../../config/config');
const utils = require('../utils/index');

async function pushEvent(ctx, webhook, body) {
  try {
    const { project, commits, ref } = body;
    // 提交人
    const commitPerson = config.commitPeople[body.user_username] || config.commitPeople[body.user_name];
    const username = commitPerson && commitPerson.name || body.user_name;

    // 提交记录
    const commit = Array.isArray(commits) && commits[commits.length - 1];
    const dateFormat = utils.getDateFormat(commit.timestamp);
    const lastCommit = commit.message;
    const pushUrl = commit.url;
    const projectName = project.name;

    const receivers = config.receivers;
    // 验证接收者
    if (!(commitPerson || receivers.includes(username))) {
      return;
    }

    let sourceBranch = '';
    if (ref) {
      const branch = ref.split('/');
      sourceBranch = branch[branch.length - 1];
    }

    const msg = `\*\*push 提交成功，请及时查看\*\*
      \>提交人：${username}
      \>时间：<font color=\"info\">${dateFormat}</font>
      \>项目：<font color=\"info\">${projectName}</font>
      \>提交分支：<font color=\"info\">${sourceBranch || '未知'}</font>
      \>最后提交信息：<font color=\"info\"> ${lastCommit} </font>
      \>请求链接：[${pushUrl}](${pushUrl})`;

    await ctx.curl(webhook, {
      method: 'POST',
      contentType: 'json',
      data: {
        msgtype: 'markdown',
        markdown: {
          content: msg,
        },
      },
      dataType: 'json',
    });

    await ctx.curl(webhook, {
      method: 'POST',
      contentType: 'json',
      data: {
        msgtype: 'text',
        text: {
          content: `@${username}`,
        },
      },
      dataType: 'json',
    });

    ctx.body = '消息推送成功！';
  } catch (error) {
    console.log(error);
    ctx.body = '请求参数不合法';
  }

}

module.exports = {
  pushEvent,
};
