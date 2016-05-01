(function() {
  'use strict';
  angular.module('app.phpjs.services', []).factory('php', [
    function() {
      return {
        explode: function(delimiter, string, limit) {
          var s;
          if (arguments.length < 2 || typeof delimiter === 'undefined' || typeof string === 'undefined') {
            return null;
          }
          if (delimiter === '' || delimiter === false || delimiter === null) {
            return false;
          }
          if (typeof delimiter === 'function' || typeof delimiter === 'object' || typeof string === 'function' || typeof string === 'object') {
            return {
              0: ''
            };
          }
          if (delimiter === true) {
            delimiter = '1';
          }
          delimiter += '';
          string += '';
          s = string.split(delimiter);
          if (typeof limit === 'undefined') {
            return s;
          }
          if (limit === 0) {
            limit = 1;
          }
          if (limit > 0) {
            if (limit >= s.length) {
              return s;
            }
            return s.slice(0, limit - 1).concat([s.slice(limit - 1).join(delimiter)]);
          }
          if (-limit >= s.length) {
            return [];
          }
          s.splice(s.length + limit);
          return s;
        },
        randomString: function(length, chars) {
          var i, mask, result, _i;
          mask = '';
          if (chars.indexOf('a') > -1) {
            mask += 'abcdefghijklmnopqrstuvwxyz';
          }
          if (chars.indexOf('A') > -1) {
            mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
          }
          if (chars.indexOf('#') > -1) {
            mask += '0123456789';
          }
          if (chars.indexOf('!') > -1) {
            mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
          }
          result = '';
          for (i = _i = length; length <= 0 ? _i <= 0 : _i >= 0; i = length <= 0 ? ++_i : --_i) {
            result += mask[Math.round(Math.random() * (mask.length - 1))];
          }
          return result;
        },
        getNOW_TimeStamp: function() {
          var now;
          now = new Date;
          return now.getMonth() + 1 + '/' + now.getDate() + '/' + now.getFullYear() + ' ' + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()) + ':' + (now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds());
        },
        getTimeStamp: function(ndate) {
          var dateAsDateObject;
          if (ndate === 1) {
            ndate = getNOW_TimeStamp();
          }
          dateAsDateObject = new Date(Date.parse(ndate));
          return dateAsDateObject.getTime();
        }
      };
    }
  ]);

}).call(this);
