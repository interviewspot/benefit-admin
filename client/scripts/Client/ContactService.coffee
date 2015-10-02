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

angular.module('app.client.services', [])

.factory 'ContactService', ($resource, config) ->
	service = $resource(config.path.baseURL + config.path.handbook, {}, {
            query:
                method:"GET",
                action: config.path.baseURL + config.path.handbooks
            update:
                method:"PUT"
    	}
	)
	return service
.factory('fetchContact', [ '$http', '$q', '$resource', ($http, $q, $resource) ->
    return {
        get : (url) ->
            d = $q.defer()

            $http({
                method: 'GET',
                url: url
            })
            .then (res) ->
                d.resolve(res)
            , (error) ->
                d.reject(error)

            d.promise
    }
])
