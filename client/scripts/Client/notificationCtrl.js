(function() {
  'use strict';
  angular.module('app.notifications', []).controller('notificationCtrl', [
    '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', '$modal', 'aREST', '$timeout', function($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, aREST, $timeout) {
      var getNOW_TimeStamp, _URL_notifis, _getNotifis;
      $scope.clientId = $routeParams.clientId;
      $scope.notifis = [];
      _URL_notifis = {
        list: config.path.baseURL + config.path.clients + "/" + $scope.clientId + "/notifications"
      };
      _getNotifis = function(limit, goPage) {
        return aREST.get(_URL_notifis.list + '?limit=' + limit + '&page=' + goPage).then(function(res) {
          if (typeof res.data._embedded === 'object' && res.data._embedded.items.length > 0) {
            $scope.notifis = res.data;
            return $scope.notifis._embedded.items = $filter('orderBy')($scope.notifis._embedded.items, '-id', false);
          } else {
            return console.log('No data');
          }
        }, function(error) {
          return console.log(error);
        });
      };
      $scope.numPerPageOpt = [3, 5, 10, 20];
      $scope.numPerPage = $scope.numPerPageOpt[3];
      $scope.currentPage = 1;
      $scope.filteredUsers = [];
      $scope.currentPageUsers = [];
      $scope.onNPPChange = function() {
        return _getNotifis($scope.numPerPage, $scope.currentPage);
      };
      $scope.gotoPage = function(page) {
        return _getNotifis($scope.numPerPage, $scope.currentPage);
      };
      $scope.getTime = function(ndate) {
        var dateAsDateObject;
        if (ndate === 1) {
          ndate = getNOW_TimeStamp();
        }
        dateAsDateObject = new Date(Date.parse(ndate));
        return dateAsDateObject.getTime();
      };
      getNOW_TimeStamp = function() {
        var now;
        now = new Date;
        return now.getMonth() + 1 + '/' + now.getDate() + '/' + now.getFullYear() + ' ' + now.getHours() + ':' + (now.getMinutes() < 10 ? '0' + now.getMinutes() : now.getMinutes()) + ':' + (now.getSeconds() < 10 ? '0' + now.getSeconds() : now.getSeconds());
      };
      $scope.new_notifi = {};
      $scope.submitCreateNotifi = function() {
        var newMsg;
        newMsg = {
          "message": {
            "subject": $scope.new_notifi.subject.trim(),
            "body": $scope.new_notifi.body.trim()
          }
        };
        return aREST.post(_URL_notifis.list, newMsg).then(function(res) {
          if (typeof res === 'object' && res.status === 201) {
            newMsg.message['created_at'] = 1;
            newMsg.message['isNew'] = 1;
            if ($scope.notifis._embedded.items.length) {
              $scope.notifis._embedded.items.unshift(newMsg.message);
              return $timeout(function() {
                return $scope.notifis._embedded.items[0].isNew = 0;
              }, 3000);
            } else {
              return location.reload();
            }
          }
        }, function(error) {
          return console.log(error);
        });
      };
      $scope.pushNotifi = function(notifi) {
        var pushMsg, re_push;
        pushMsg = {
          "push": {
            "current": 0
          }
        };
        re_push = function(pMsg) {
          return aREST.get(notifi._links.push.href).then(function(res) {
            if (typeof res === 'object' && res.status === 200) {
              pMsg.push.current = res.data.current + 1;
              if (pMsg.push.current <= res.data.total) {
                return aREST.put(notifi._links.push.href, pMsg).then(function(res) {
                  return re_push(pMsg);
                }, function(error) {
                  return alert(error.data.message);
                });
              } else {
                return alert('The message has been delivered to employees in the company.');
              }
            }
          }, function(error) {
            return console.log(error);
          });
        };
        return re_push(pushMsg);
      };
      $scope.showNotiForm = function(key) {
        $scope.notifis._embedded.items[key]['shw_frm'] = !$scope.notifis._embedded.items[key]['shw_frm'];
      };
      $scope.submitUpdateNotifi = function(key) {
        var newMsg;
        newMsg = {
          "message": {
            "subject": $scope.notifis._embedded.items[key].subject.trim(),
            "body": $scope.notifis._embedded.items[key].body.trim()
          }
        };
        return aREST.put($scope.notifis._embedded.items[key]._links.self.href, newMsg).then(function(res) {
          if (typeof res === 'object' && res.status === 204) {
            return $timeout(function() {
              return window.location.reload();
            }, 500);
          }
        }, function(error) {
          return console.log(error);
        });
      };
      $scope.deleteNotifi = function(key) {
        var r;
        r = confirm("Do you want to delete this notification \"" + $scope.notifis._embedded.items[key].subject.trim() + "\"?");
        if (r === true) {
          return aREST["delete"]($scope.notifis._embedded.items[key]._links.self.href).then(function(res) {
            if (typeof res === 'object' && res.status === 204) {
              return $timeout(function() {
                return window.location.reload();
              }, 500);
            }
          }, function(error) {
            return console.log(error);
          });
        }
      };
      return _getNotifis($scope.numPerPage, $scope.currentPage);
    }
  ]);

}).call(this);
