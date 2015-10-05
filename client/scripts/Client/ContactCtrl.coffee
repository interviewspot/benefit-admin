'use strict'
angular.module('app.contacts', [])
# --------------------------------------------
# Contact in Handbook TAB of Client
# 1. manage list contacts
# 2. Autocomplete email
.controller('ContactCtrl', [
    '$scope', '$filter' , 'fetchTabData', 'fakeData', '$location', '$routeParams', 'ContactService', 'fetchContact', 'SearchUsers', 'fetchUsers', 'config' , '$q',
    ($scope, $filter, fetchTabData, fakeData, $location, $routeParams, ContactService, fetchContact, SearchUsers, fetchUsers, config, $q) ->

        # $scope.handbook = {}

        # $scope.$watch () ->
        #     $scope.handbook.title
        # ,
        #     (nv)->
        #         console.log $scope.frm_crt_handbook.hb_title

        # 1. manage list contacts
        init = ->
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

        if $routeParams.clientId
            init()

        # 2. Autocomplete email
        $scope.contact = {
            email: ''
            title: ''
        }

        $scope.srch_users   =
            'email' : 0

        $scope.searchMail = (term) ->
            d = $q.defer()
            q = term.toLowerCase().trim()
            results = {}

            fetchUsers.get(config.path.baseURL + config.path.users + '?search=user.email:%'+q+'%').then (res) ->

                if res.data._embedded
                    $scope.srch_users = {}
                    users = res.data._embedded.items
                    for i in [0...users.length]
                        item = users[i]
                        results[item.email] = item.id
                    $scope.srch_users = results
                    d.resolve(results)
                else
                    return
            , () ->
                d.resolve(results)
            return d.promise
        return


        # 3. create contact
        $scope.selectedUser = null
        $scope.createContact = ->
            newContact = {
                "position": {
                    "title": $scope.contact.title
                    "employee": $scope.srch_users[$scope.contact.email]
                    "active": true
                    "employer": $routeParams.clientId
                }
            }
            ContactService.save {org_id:$routeParams.clientId}, newContact, (res)->
                init()

        # 4.delete contact
        $scope.deleteContact = (contact) ->
            console.log contact.position._links.self.href
            fetchContact.delete contact.position._links.self.href
            .then (res) ->
                init()

])
.directive('keyboardPoster',
    ($parse, $timeout) ->
        DELAY_TIME_BEFORE_POSTING = 1000;
        return (scope, elem, attrs) ->
            element = angular.element(elem)[0];
            currentTimeout = null;

            element.oninput = () ->
                model  = $parse(attrs.postFunction);
                poster = model(scope);

                if(currentTimeout)
                    $timeout.cancel(currentTimeout)

                currentTimeout = $timeout( () ->
                    poster angular.element(element).val()
                    return
                , DELAY_TIME_BEFORE_POSTING)
                return
            return
)



