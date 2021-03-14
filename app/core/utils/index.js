
'use strict';

function getDateFormat(createDate) {
  if (createDate) {
    const date = new Date(createDate);
    const dateFormat =
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

    return dateFormat;
  }
}

module.exports = {
  getDateFormat,
};
