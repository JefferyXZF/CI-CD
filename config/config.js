'use strict';

module.exports = {
  // 机器人列表
  webhook: '',
  // 机器人链接
  baseWebhook: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=',
  // 接收人
  receivers: [ '谢志非', 'xiezhifei', '李尚纲', 'lishanggang', '张盛彬', 'zhangshengbin', '郑佳娜', 'zhengjiana', '覃荣邦', 'qinrongbang' ],
  // 人员列表
  peopelList: [
    // { name, phone }
  ],
  mergeTargetBranch: [ 'develop', 'release' ],
};
