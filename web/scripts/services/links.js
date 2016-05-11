(function() {
  'use strict';

  /**
    * @ngdoc service
    * @name transformApp.client.handbook
    * @description
    * # client.handbook
    * Service in the transformApp.
   */
  angular.module('app.links.services', []).factory('linkServices', [
    '$resource', 'config', function($resource, config) {
      var service;
      service = function(url) {
        return $resource(url, {}, {
          query: {
            method: "GET",
            action: url,
            isArray: true
          }
        });
      };
      return service;
    }
  ]);

}).call(this);
