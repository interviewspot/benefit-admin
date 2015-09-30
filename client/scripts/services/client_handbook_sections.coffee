'use strict'

###*
 # @ngdoc service
 # @name transformApp.client
 # @description
 # # client
 # Service in the transformApp.
###
angular.module('app.handbook.sections.services', [])
.factory('sectionService', [ '$resource', 'config', ($resource, config) ->
	service = $resource(config.path.baseURL + config.path.section, {}, {
            query:{
                method:"GET",
                action: config.path.baseURL + config.path.sections,
            },
            children:{
                method:"GET",
                action: config.path.baseURL + config.path.section_children,
            },
            parent:{
                method:"GET",
                action: config.path.baseURL + config.path.section_parent,
            },
            update:{
                method:"PUT"
            }
    	}
	)
	return service
])