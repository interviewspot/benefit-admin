'use strict'
angular.module('app.contacts', [])
# --------------------------------------------
# Contact in Handbook TAB of Client
# 1. manage list contacts
# 2. Autocomplete email
.controller('ContactCtrl', [
    '$scope', '$filter' , 'fetchTabData', 'fakeData', '$location', '$routeParams', 'ContactService', 'fetchContact', 'SearchUsers', 'fetchUsers', 'config' ,
    ($scope, $filter, fetchTabData, fakeData, $location, $routeParams, ContactService, fetchContact, SearchUsers, fetchUsers, config) ->

        # 1. manage list contacts
        if $routeParams.clientId
            ContactService.get {org_id:$routeParams.clientId}, (data, getResponseHeaders) ->
                if data._embedded.items.length
                    $scope.contacts = []
                    for i, item of data._embedded.items
                        ((itemInstance) ->
                            fetchContact.get(itemInstance._links.employee.href).then  (res) ->
                                $scope.contacts.push({
                                    'position': itemInstance
                                    'user' : res.data
                                    'alphabet' : res.data.first_name.charAt(0).toLowerCase()
                                })
                        )(item)

                return

        # 2. Autocomplete email
        $scope.dirty = {};



        states = []

        suggest_state = (term) ->
            # TODO update states
            #.then (res)->
               # states = res;
            d = $q.defer()
            q = term.toLowerCase().trim()
            results = []

            fetchUsers.get(config.path.baseURL + config.path.users + '?search=user.email:%'+q+'%').then  (res) ->

                if res._embedded
                    states = res._embedded.items
                    # Find first 10 states that start with 'term'.
                    for i in [0...states.length] when results.length < 10
                        item = states[i]
                        if (item.toLowerCase().indexOf(q) >= 0)
                            results.push({
                                label: item.email
                                value: item.id
                            })
                    d.resolve(results)
                else
                    d.reject()

            return d.promise

        test (term)->
            suggest_state(term).then (res)->
                return res

        $scope.autocomplete_options = {
            suggest: test
        }

        console.log $scope.autocomplete_options.suggest

        return
])
