(function() {
  'use strict';
  angular.module('app.handbook_info', []).controller('HandbookInfoCtrl', [
    '$scope', '$routeParams', 'fetchHandbook', 'handbookService', 'clientService', 'sectionService', '$location', '$timeout', 'authHandler', function($scope, $routeParams, fetchHandbook, handbookService, clientService, sectionService, $location, $timeout, authHandler) {
      authHandler.checkLoggedIn();
      $scope.clientId = $routeParams.clientId;
      $scope.handbookId = $routeParams.handbookId;
      $scope.isNewHandBook = false;
      $scope.isCreateHandbook = false;
      $scope.handbook = {};
      $scope.handbook.locale = 'en_us';
      clientService.get({
        org_id: $scope.clientId
      }, function(data, getResponseHeaders) {
        return $scope.clientDetail = data;
      });
      if ($scope.isCreateHandbook === false) {
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
      }
      $scope.isActive = function(href) {
        var path;
        path = $location.path();
        if (path.indexOf(href) === 0) {
          return 'active';
        }
      };
      $scope.submitHandbookInfo = function() {
        var desc, title, updateData;
        angular.forEach($scope.frm_crt_handbook.$error.required, function(field) {
          return field.$dirty = true;
        });
        if ($scope.frm_crt_handbook.$error.required) {
          return false;
        }
        updateData = {
          "handbook": {
            "version": $scope.handbook.version,
            "title": $scope.handbook.title,
            "year": $scope.handbook.year,
            "description": $scope.handbook.description,
            "organisation": $scope.clientId,
            "locale": "en_us",
            "enabled": $scope.handbook.enabled,
            "public": $scope.handbook.public
          }
        };
        console.log(updateData);
        return handbookService.update({
          org_id: $scope.clientId,
          hand_id: $scope.handbookId
        }, updateData, function(res) {
          $scope.infoUpdated = 'Update Success';
          return $timeout(function() {
            return $scope.infoUpdated = null;
          }, 1000);
        }, function(error) {
          return $scope.infoUpdated = error.status + ': Error, refresh & try again !';
        });
      };
      return $scope.submitCreateHandbook = function() {
        var newData;
        angular.forEach($scope.frm_crt_handbook.$error.required, function(field) {
          return field.$dirty = true;
        });
        if ($scope.frm_crt_handbook.$error.required) {
          return false;
        }
        newData = {
          "handbook": {
            "version": $scope.handbook.version,
            "title": $scope.handbook.title,
            "year": $scope.handbook.year,
            "description": $scope.handbook.description,
            "organisation": $scope.clientId,
            "locale": "en_us",
            "enabled": $scope.handbook.enabled
          }
        };
        return handbookService.save({
          org_id: $scope.clientId
        }, newData, function(res) {
          $scope.infoUpdated = 'Created New';
          return $timeout(function() {
            $scope.infoUpdated = null;
            return location.reload();
          }, 500);
        }, function(error) {
          return $scope.infoUpdated = error.status + ': Error, refresh & try again !';
        });
      };
    }
  ]);

}).call(this);
