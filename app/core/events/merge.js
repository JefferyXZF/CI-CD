'use strict';

const config = require('../../../config/config');
const utils = require('../utils/index');

async function mergeEvent(ctx, webhook, body) {
  try {
    const { user, project, object_attributes } = body;
    const username = user.name || user.username;
    const projectName = project && project.name;
    let stateType = '',
      mergeUrl = '',
      targetBranch = '',
      sourceBranch = '',
      lastCommit = '',
      commitPerson = '',
      dateFormat = '';

    if (object_attributes) {
      const { state, url, created_at, target_branch, source_branch, last_commit } = object_attributes;
      stateType = state;
      mergeUrl = url;
      targetBranch = target_branch;
      sourceBranch = source_branch;
      lastCommit = last_commit ? last_commit.message : '';

      // 针对目标分支过滤
      if (config.mergeTargetBranch && config.mergeTargetBranch.length) {
        if (!config.mergeTargetBranch.includes(target_branch)) {
          return;
        }
      }

      const lastCommitUserArr = lastCommit.match(
        /--user=[a-zA-Z\d\u4e00-\u9fa5]+\s{0,1}/g
      );
      // 提交人
      commitPerson =
          lastCommitUserArr && lastCommitUserArr[0]
            ? lastCommitUserArr[0].replace(/--user=/g, '').replace(/\s+/g, '')
            : null;

      // 提交时间
      if (created_at) {
        dateFormat = utils.getDateFormat(created_at);
      }
    }

    const receivers = config.receivers;
    // 如果设置接收者，验证
    if (receivers && receivers.length) {
      if (!(receivers.includes(username) || receivers.includes(commitPerson))) {
        return;
      }
    }

    let msg = '';
    let isSend = false;
    switch (stateType) {
      case 'opened':
        // 发起合并请求
        msg = `\*\*发起了一个合并请求，请及时查看\*\*
                \>发起人：${username}
                \>时间：<font color=\"info\">${dateFormat}</font>
                \>项目：<font color=\"info\">${projectName}</font>
                \>来源分支：<font color=\"info\">${sourceBranch}</font>
                \>目标分支：<font color=\"info\">${targetBranch}</font>
                \>最后提交信息：<font color=\"info\">${lastCommit}</font>
                \>请求链接：[${mergeUrl}](${mergeUrl})`;
        await ctx.curl(webhook, {
          method: 'POST',
          contentType: 'json',
          data: {
            msgtype: 'text',
            text: {
              content: '【合并请求通知】',
              mentioned_mobile_list: config.receivers.includes(username) ? config.receivers : config.receivers.concat(username),
            },
          },
          dataType: 'json',
        });
        isSend = true;
        break;
      case 'merged':
        // 合并成功
        msg = `\*\*合并请求已完成\*\*
                \>发起人：${commitPerson || '未知'}
                \>合并人：${username}
                \>时间：<font color=\"info\">${dateFormat}</font>
                \>项目：<font color=\"info\">${projectName}</font>
                \>来源分支：<font color=\"info\">${sourceBranch}</font>
                \>目标分支：<font color=\"info\">${targetBranch}</font>
                \>最后提交信息：<font color=\"info\">${lastCommit}</font>
                \>请求链接：[${mergeUrl}](${mergeUrl})`;
        isSend = true;
        break;
      case 'closed':
        // 请求关闭
        msg = `\*\*合并请求已关闭\*\*
                \>发起人：${commitPerson || '未知'}
                \>关闭人：${username}
                \>时间：<font color=\"info\">${dateFormat}</font>
                \>项目：<font color=\"info\">${projectName}</font>
                \>来源分支：<font color=\"info\">${sourceBranch}</font>
                \>目标分支：<font color=\"info\">${targetBranch}</font>
                \>最后提交信息：<font color=\"info\">${lastCommit}</font>
                \>请求链接：[${mergeUrl}](${mergeUrl})`;
        isSend = true;
        break;
      default:
        break;
    }

    if (isSend) {
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
      this.ctx.body = '消息推送成功！';
    } else {
      this.ctx.body = '消息类型${stateType}不合法';
    }

  } catch (error) {
    console.error(error);
    this.ctx.body = '请求参数不合法';
  }

}

module.exports = {
  mergeEvent,
};
