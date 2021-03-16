'use strict';

module.exports = {
  // 机器人列表
  webhook: '',
  // 机器人链接
  baseWebhook: 'https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=',
  // 接收人
  receivers: [ '谢志非', '覃荣邦', '张盛彬', '郑佳娜', '李尚纲' ],
  // 人员列表
  commitPeople: {
    xiezhifei: {
      name: '谢志非',
      phone: '',
    },
    lishanggang: {
      name: '李尚纲',
      phone: '',
    },
    zhangshengbin: {
      name: '张盛彬',
      phone: '',
    },
    zhengjiana: {
      name: '郑佳娜',
      phone: '',
    },
    qinrongbang: {
      name: '覃荣邦',
      phone: '',
    },
  },
  mergeTargetBranch: [ 'develop', 'release' ],
};
