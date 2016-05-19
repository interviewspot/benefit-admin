(function() {
  'use strict';

  /**
    * @ngdoc service
    * @name transformApp.client.handbook
    * @description
    * # client.handbook
    * Service in the transformApp.
   */
  angular.module('app.contacts.services', []).factory('ContactService', function($resource, config) {
    var service;
    service = $resource(config.path.baseURL + config.path.contacts, {}, {
      query: {
        method: "GET",
        action: config.path.baseURL + config.path.contacts,
        isArray: true
      },
      update: {
        method: "PUT",
        action: config.path.contact
      },
      save: {
        method: "POST",
        action: config.path.baseURL + config.path.contacts
      }
    });
    return service;
  }).factory('fetchContact', [
    '$http', '$q', '$resource','$route','$rootScope','$location', function($http, $q, $resource,$route,$rootScope,$location) {
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
            if(error.status == 498){
              $location.path('/404');
              return $route.reload();
            }
            d.reject(error);
          });
          return d.promise;
        },
        update: function(url, data) {
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
  ]).factory('fetchUsers', [
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
        }
      };
    }
  ]).factory('SearchUsers', function($resource, config) {
    var service;
    service = $resource(config.path.baseURL + config.path.users, {}, {
      query: {
        method: "GET",
        action: config.path.baseURL + config.path.users
      },
      update: {
        method: "PUT"
      }
    });
    return service;
  });

}).call(this);
