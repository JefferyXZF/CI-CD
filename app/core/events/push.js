'use strict';

const config = require('../../../config/config');
const utils = require('../utils/index');

async function pushEvent(ctx, webhook, body) {
  try {
    const { project, commits, ref } = body;
    let commitPerson = null;
    let findCommit = null;

    // 提交人
    if (commits && commits.length) {
      findCommit = commits.find(item => {
        return item.message.indexOf('--user') > -1;
      });

      if (findCommit) {
        const lastCommitUserArr = findCommit.message.match(
          /--user=[a-zA-Z\d\u4e00-\u9fa5]+\s{0,1}/g
        );
        commitPerson =
          lastCommitUserArr && lastCommitUserArr[0]
            ? lastCommitUserArr[0].replace(/--user=/g, '').replace(/\s+/g, '')
            : null;
      } else {
        findCommit = commits[0];
      }
    }

    const dateFormat = utils.getDateFormat(findCommit.timestamp);
    const projectName = project.name;
    const lastCommit = findCommit.message;
    const pushUrl = findCommit.url;
    let sourceBranch = '';
    const username = commitPerson ? commitPerson : (findCommit.author && findCommit.author.name || '');

    const receivers = config.receivers;
    // 如果设置接收者，验证
    if (receivers && receivers.length) {
      if (!(receivers.includes(username) || receivers.includes(findCommit.author))) {
        return;
      }
    }

    if (ref) {
      const branch = ref.split('/');
      sourceBranch = branch[branch.length - 1];
    }

    const msg = `\*\*push 提交成功，请及时查看\*\*
      \>提交人：${username}
      \>时间：<font color=\"info\">${dateFormat}</font>
      \>项目：<font color=\"info\">${projectName}</font>
      \>提交分支：<font color=\"info\">${sourceBranch || '未知'}</font>
      \>最后提交信息：<font color=\"info\">${lastCommit}</font>
      \>请求链接：[${pushUrl}](${pushUrl})`;

    await ctx.curl(webhook, {
      method: 'POST',
      contentType: 'json',
      data: {
        msgtype: 'markdown',
        markdown: {
          content: msg,
          mentioned_mobile_list: [ commitPerson ],
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
