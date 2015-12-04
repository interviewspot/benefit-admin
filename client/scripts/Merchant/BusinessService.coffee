'use strict'

angular.module('app.businesses.services', [])

.factory('Businesses', [ '$http', '$q', '$resource', ($http, $q, $resource) ->
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
         post : (url, data) ->
            d = $q.defer()
            $http({
                method: 'POST'
                url: url
                data: data
            })
            .then (res) ->
                d.resolve(res)
                return
            , (error) ->
                d.reject(error)
                return
            d.promise
        put : (url, data) ->
            d = $q.defer()
            $http({
                method: 'PUT'
                url: url
                data: data
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
