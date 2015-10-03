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

angular.module('app.contacts.services', [])

.factory 'ContactService', ($resource, config) ->
    service = $resource(config.path.baseURL + config.path.contacts, {}, {
            query:
                method:"GET",
                action: config.path.baseURL + config.path.contacts
                isArray: true
            update:
                method:"PUT"
            save:
                method:"POST"
                action: config.path.baseURL + config.path.contacts

        }
    )
    return service

.factory 'SearchUsers', ($resource, config) ->
    service = $resource(config.path.baseURL + config.path.users, {}, {
            query:
                method:"GET",
                action: config.path.baseURL + config.path.users
                #isArray: true
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
                method: 'GET'
                url: url
            })
            .then (res) ->
                d.resolve(res)
                return
            , (error) ->
                d.reject(error)
                return

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

.factory('fetchUsers', [ '$http', '$q', '$resource', ($http, $q, $resource) ->
    return {
        get : (url) ->
            d = $q.defer()
            $http({
                method: 'GET'
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
