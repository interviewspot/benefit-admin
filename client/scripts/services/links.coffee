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

angular.module('app.links.services', [])

# .factory('linkServices', [ '$http', '$q', '$resource', ($http, $q, $resource) ->
#     return {
#         get : (url) ->
#             d = $q.defer()

#             $http({
#                 method: 'GET',
#                 url: url
#             })
#             .then (res) ->
#                 d.resolve(res)
#             , (error) ->
#                 d.reject(error)

#             d.promise
#     }
# ])
.factory('linkServices', [ '$resource', 'config', ($resource, config) ->
    service = (url) -> 
        $resource(url, {}, {
                query:{
                    method:"GET"
                    action: url
                    isArray: true
                },
            }
        )
    return service
])