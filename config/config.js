'use strict';

module.exports = {
  // 机器人列表
  webhook: '',
  // 机器人链接
  baseWebhook: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=',
  // 接收人
  receivers: [ ],
  // 人员列表
  commitPeople: {},
  mergeTargetBranch: [ 'develop', 'release' ],
};
