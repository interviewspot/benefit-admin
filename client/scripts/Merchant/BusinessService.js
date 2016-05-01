(function() {
  'use strict';
  angular.module('app.businesses.services', []).factory('Businesses', [
    '$http', '$q', '$resource', function($http, $q, $resource) {
      return {
        get: function(url) {
          var d;
          d = $q.defer();
          $http({
            method: 'GET',
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
        }
      };
    }
  ]);

}).call(this);
