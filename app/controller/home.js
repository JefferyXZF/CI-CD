'use strict';

const Controller = require('egg').Controller;
const config = require('../../config/config');

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.body = 'hi, egg';
  }
  async webhook() {
    const { ctx, app } = this;
    const body = ctx.request.body;
    // ctx.logger.info('****** gitlab-start *******');
    // ctx.logger.info('gitlab信息：%j', ctx.request.body);
    // ctx.logger.info('****** gitlab-end *******');

    const gitlabHookSend = await app.redis.get('gitlabHookSend');
    if (gitlabHookSend === 'close') {
      ctx.logger.info('消息推送开关已关闭！不发送推送！');
      ctx.body = '消息推送开关已关闭！';
      return;
    }

    try {
      const eventType = body.object_kind;
      const username = body.user && (body.user.name || body.user.username);
      const projectName = body.project && body.project.name;
      let stateType = '',
        mergeUrl = '',
        targetBranch = '',
        sourceBranch = '',
        lastCommit = '',
        commitPerson = '',
        commitPersonPhone = '',
        dateFormat = '';

      if (body.object_attributes) {
        const { state, url, created_at, target_branch, source_branch, last_commit } = body.object_attributes;
        stateType = state;
        mergeUrl = url;
        targetBranch = target_branch;
        sourceBranch = source_branch;
        lastCommit = last_commit ? last_commit.message : '';

        const lastCommitUserArr = lastCommit.match(
          /--user=[a-zA-Z\d\u4e00-\u9fa5]+\s{0,1}/g
        );
        commitPerson =
          lastCommitUserArr && lastCommitUserArr[0]
            ? lastCommitUserArr[0].replace(/--user=/g, '').replace(/\s+/g, '')
            : null;

        if (commitPerson) {
          config.peopelList &&
            config.peopelList.forEach(person => {
              if (person.name === commitPerson) {
                commitPersonPhone = person.phone;
                return false;
              }
            });
        }
        // 提交时间
        if (created_at) {
          const date = new Date(created_at);
          dateFormat =
          date.getFullYear() +
          '年' +
          (date.getMonth() + 1) +
          '月' +
          date.getDate() +
          '日 ' +
          date.getHours() +
          ':' +
          date.getMinutes() +
          ':' +
          date.getSeconds();
        }
      }

      let msg = '';
      let isSend = false;
      if (eventType === 'tag_push') {
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
            // await ctx.curl(config.webhook, {
            //   method: 'POST',
            //   contentType: 'json',
            //   data: {
            //     msgtype: 'text',
            //     text: {
            //       content: '【合并请求通知】',
            //       mentioned_mobile_list: config.receivers,
            //     },
            //   },
            //   dataType: 'json',
            // });
            isSend = true;
            break;
          case 'merged':
            // 合并成功
            if (commitPersonPhone) {
              // await ctx.curl(config.webhook, {
              //   method: 'POST',
              //   contentType: 'json',
              //   data: {
              //     msgtype: 'text',
              //     text: {
              //       content: '【合并请求完成通知】',
              //       mentioned_mobile_list: [ commitPersonPhone ],
              //     },
              //   },
              //   dataType: 'json',
              // });
            }
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
            if (commitPersonPhone) {
              // await ctx.curl(config.webhook, {
              //   method: 'POST',
              //   contentType: 'json',
              //   data: {
              //     msgtype: 'text',
              //     text: {
              //       content: '【合并请求关闭通知】',
              //       mentioned_mobile_list: [ commitPersonPhone ],
              //     },
              //   },
              //   dataType: 'json',
              // });
            }
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
        this.ctx.body = msg;
        let msgRes;
        if (isSend) {
          // msgRes = await ctx.curl(config.webhook, {
          //   method: 'POST',
          //   contentType: 'json',
          //   data: {
          //     msgtype: 'markdown',
          //     markdown: {
          //       content: msg,
          //     },
          //   },
          //   dataType: 'json',
          // });
          this.ctx.body = '消息推送成功！';
        } else {
          this.ctx.body = '消息类型${stateType}不合法';
        }
        ctx.logger.info('******** 调用小助手-start *********');
        ctx.logger.info('小助手返回: %j', msgRes);
        ctx.logger.info('******** 调用小助手-end *********');
      }
    } catch (ex) {
      console.log(ex);
      this.ctx.body = '请求参数不合法';
    }
  }
  async test() {
    const { ctx } = this;
    const body = ctx.request.body;
    this.ctx.body = body;
  }
}

module.exports = HomeController;
