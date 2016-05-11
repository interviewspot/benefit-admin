(function() {
  'use strict';

  /**
    * @ngdoc service
    * @name transformApp.client.handbook
    * @description
    * # client.handbook
    * Service in the transformApp.
   */
  angular.module('app.handbook.services', []).factory('handbookService', function($resource, config) {
    var service;
    service = $resource(config.path.baseURL + config.path.handbook, {}, {
      query: {
        method: "GET"
      },
      update: {
        method: "PUT"
      },
      save: {
        method: "POST",
        action: config.path.baseURL + config.path.handbooks
      }
    });
    return service;
  }).factory('fetchHandbook', [
    '$http', '$q', '$resource', function($http, $q, $resource) {
      return {
        get: function(url) {
          var d;
          d = $q.defer();
          $http({
            method: 'GET',
            url: url
          }).then(function(res) {
            return d.resolve(res);
          }, function(error) {
            return d.reject(error);
          });
          return d.promise;
        },
        "delete": function(url) {
          var d;
          d = $q.defer();
          $http({
            method: 'DELETE',
            url: url
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        post: function(url, data) {
          var d;
          d = $q.defer();
          $http({
            method: 'POST',
            url: url,
            data: data
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        put: function(url, data) {
          var d;
          d = $q.defer();
          $http({
            method: 'PUT',
            url: url,
            data: data
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        }
      };
    }
  ]);

}).call(this);
