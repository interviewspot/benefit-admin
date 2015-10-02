'use strict'
angular.module('app.contacts', [])
# --------------------------------------------
# Contact in Handbook TAB of Client
# 1. manage list contacts
.controller('ContactCtrl', [
    '$scope', '$filter' , 'fetchTabData', 'fakeData', '$location', '$routeParams', 'ContactService', 'fetchContact',
    ($scope, $filter, fetchTabData, fakeData, $location, $routeParams, ContactService, fetchContact) ->

        # 1 manage list contacts
        if $routeParams.clientId
            ContactService.get {org_id:$routeParams.clientId}, (data, getResponseHeaders) ->
                if data._embedded.items.length
                    $scope.contacts = []

                    for i, item of data._embedded.items
                        fetchContact.get(item._links.employee.href).then  (res) ->
                            $scope.contacts.push({
                                'position': item
                                'user' : res.data
                                'alphabet' : res.data.first_name.charAt(0).toLowerCase()
                            })

                return
])
