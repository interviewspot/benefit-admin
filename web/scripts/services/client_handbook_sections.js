(function() {
  'use strict';

  /**
    * @ngdoc service
    * @name transformApp.client
    * @description
    * # client
    * Service in the transformApp.
   */
  angular.module('app.handbook.sections.services', []).factory('sectionService', [
    '$resource', 'config', function($resource, config) {
      var service;
      service = $resource(config.path.baseURL + config.path.section, {}, {
        query: {
          method: "GET",
          action: config.path.baseURL + config.path.sections
        },
        children: {
          method: "GET",
          action: config.path.baseURL + config.path.section_children,
          isArray: true
        },
        parent: {
          method: "GET",
          action: config.path.baseURL + config.path.section_parent,
          isArray: true
        },
        update: {
          method: "PUT"
        },
        save: {
          method: "POST",
          action: config.path.baseURL + config.path.sections
        },
        saveChild: {
          method: "POST",
          action: config.path.baseURL + config.path.sections
        }
      });
      return service;
    }
  ]);

}).call(this);
