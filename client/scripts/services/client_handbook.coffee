'use strict'

###*
 # @ngdoc service
 # @name transformApp.client.handbook
 # @description
 # # client.handbook
 # Service in the transformApp.
###
# angular.module 'transformApp'
#   .service 'client.handbook', ->
    # AngularJS will instantiate a singleton by calling "new" on this function

angular.module('app.handbook.services', [])

.factory 'Handbook', ($resource) ->
	return $resource mainConfig.path.baseURL + mainConfig.path.handbook, {organisation_id:1, handbook_id:1}, {
		query: {
			action: mainConfig.path.baseURL + mainConfig.path.handbooks
			method: 'GET'
		}
	}