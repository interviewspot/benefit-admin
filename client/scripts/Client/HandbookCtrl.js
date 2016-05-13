(function() {
  'use strict';
  angular.module('app.handbooks', []).controller('HandbookCtrl', [
    '$scope', '$routeParams', 'fetchHandbook', 'handbookService', 'clientService', 'sectionService', '$location', '$timeout', 'authHandler', function($scope, $routeParams, fetchHandbook, handbookService, clientService, sectionService, $location, $timeout, authHandler) {
      authHandler.checkLoggedIn();
      $scope.clientId = $routeParams.clientId;
      $scope.handbookId = $routeParams.handbookId;
      $scope.ClientPage = {
        tabUrls: {}
      };
      clientService.get({
        org_id: $scope.clientId
      }, function(data, getResponseHeaders) {
        $scope.clientDetail = data;
        return $scope.ClientPage.tabUrls = {
          "info": '#/clients/' + data.id + '/info',
          "user": '#/clients/' + data.id + '/user',
          "handbooks": '#/clients/' + data.id + '/handbooks',
          "policies": '#/clients/' + data.id + '/policies',
          "insurance": '#/clients/' + data.id + '/insurance',
          "healthcare": '#/clients/' + data.id + '/healthcare',
          "imerchant": '#/clients/' + data.id + '/imerchant',
          "notifications": '#/clients/' + data.id + '/notifications'
        };
      });
      handbookService.get({
        org_id: $scope.clientId,
        hand_id: $scope.handbookId
      }, function(data, getResponseHeaders) {
        $scope.handbook = data;
        $scope.handbook.locale = 'en_us';
        return fetchHandbook.get(data._links.translations.href).then(function(res) {
          if (res.status !== 200 || typeof res !== 'object') {
            return;
          }
          $scope.handbook['translations'] = res.data;
          if ($scope.handbook.translations['en_us']) {
            $scope.handbook.title = $scope.handbook.translations['en_us'].title;
          }
        }, function(error) {
          console.log(error);
        });
      });
      $scope.isActive = function(href) {
        var path;
        path = $location.path();
        if (path.indexOf(href) === 0) {
          return 'active';
        }
      };
      return $scope.submitHandbookInfo = function() {
        var desc, title, updateData;
        if ($scope.handbook.translations[$scope.handbook.locale]) {
          title = $scope.handbook.translations[$scope.handbook.locale].title;
        } else {
          title = $scope.handbook.title;
        }
        if ($scope.handbook.translations[$scope.handbook.locale]) {
          desc = $scope.handbook.translations[$scope.handbook.locale].description;
        } else {
          desc = $scope.handbook.description;
        }
        updateData = {
          "handbook": {
            "version": $scope.handbook.version,
            "title": title,
            "year": $scope.handbook.year,
            "description": desc,
            "organisation": $scope.clientId,
            "locale": "en_us",
            "enabled": $scope.handbook.enabled
          }
        };
        updateData.handbook['organisation'] = $scope.clientId;
        console.log(updateData);
        return handbookService.update({
          org_id: $scope.clientId,
          hand_id: $scope.handbookId
        }, updateData, function(res) {
          $scope.generalUpdated = 'Update Success';
          return $timeout(function() {
            return $scope.generalUpdated = null;
          }, 1000);
        }, function(error) {
          return $scope.generalUpdated = error.status + ': Error, refresh & try again !';
        });
      };
    }
  ]);

}).call(this);
