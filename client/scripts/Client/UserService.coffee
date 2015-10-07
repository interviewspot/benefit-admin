'use strict'

angular.module('app.users.services', [])

.factory 'UserService', ($resource, config) ->
    service = $resource(config.path.baseURL + config.path.contacts, {}, {
            query:
                method:"GET",
                action: config.path.baseURL + config.path.contacts
                isArray: true
            update:
                method:"PUT"
                action: config.path.contact
            save:
                method:"POST"
                action: config.path.baseURL + config.path.contacts

        }
    )
    return service

.factory('Users', [ '$http', '$q', '$resource', ($http, $q, $resource) ->
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
