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

.factory 'handbookService', ($resource, config) ->
	service = $resource(config.path.baseURL + config.path.handbook, {}, {
            query:
                method:"GET",
                # action: config.path.baseURL + config.path.handbooks
            update:
                method:"PUT"
            save:
                method:"POST"
                action: config.path.baseURL + config.path.handbooks
    	}
	)
	return service
.factory('fetchHandbook', [ '$http', '$q', '$resource', ($http, $q, $resource) ->
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
        delete : (url) ->
            d = $q.defer()
            $http({
                method: 'DELETE'
                url: url
            })
            .then (res) ->
                d.resolve(res)
                return
            , (error) ->
                d.reject(error)
                return

            d.promise
    }
])
