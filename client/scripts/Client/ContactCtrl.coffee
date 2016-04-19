'use strict'
angular.module('app.contacts', [])
# --------------------------------------------
# Contact in Handbook TAB of Client
# 1. Display list contacts
# 2. Autocomplete search User by email
# 3. Create a contact
# 4. Edit contact : call modalbox
# 5. Delete a contact item
# 6. Count selected contact item
# 7. Delete multi-selected contact
# --------------------------------------------
.controller('ContactCtrl', [
    '$scope', '$filter' , 'fetchTabData', 'fakeData', '$location', '$routeParams', 'ContactService', 'fetchContact', 'SearchUsers', 'fetchUsers', 'config' , '$q', '$modal', 'authHandler'
    ($scope, $filter, fetchTabData, fakeData, $location, $routeParams, ContactService, fetchContact, SearchUsers, fetchUsers, config, $q, $modal, authHandler) ->

        _URL =
            list   : config.path.baseURL + config.path.contacts.replace(":org_id", $routeParams.clientId) + '?search=position.handbookContact:1,position.enabled:1'

        # 0. Authorize
        authHandler.checkLoggedIn()

        # 1. Display list contacts
        $scope.loadContactList = ->
            fetchContact.get(_URL.list).then (res) ->
                console.log _URL.list
                if res.data._embedded.items.length
                    $scope.contacts = []

                    angular.forEach res.data._embedded.items, (item, i) ->
                        $scope.contacts[i] = {}
                        ((itemInstance) ->
                            fetchContact.get(itemInstance._links.employee.href).then  (res) ->
                                $scope.contacts[i]['position'] = itemInstance
                                $scope.contacts[i]['user']     = res.data
                                $scope.contacts[i]['alphabet'] = if res.data.first_name then res.data.first_name.charAt(0).toLowerCase() else res.data.username.charAt(0).toLowerCase()
                                console.log $scope.contacts[i]['position']
                                fetchContact.get(itemInstance._links.tags.href).then  (res) ->
                                    $scope.contacts[i]['tags'] = res.data
                        )(item)
                return

        if $routeParams.clientId
            $scope.loadContactList()

        # 2. Autocomplete search User by email
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


        # 3. Create a contact
        $scope.selectedUser = null
        $scope.createContact = ->
            # VALIDATE FRM
            angular.forEach $scope.frm_contact.$error.required, (field)->
                field.$dirty = true

            if $scope.frm_contact.$error.required.length
                return false

            # PREPARE JSON DATA
            newContact = {
                "position": {
                    "title"   : $scope.contact.title
                    "employee": $scope.srch_users[$scope.contact.email]
                    "enabled"  : true
                    "employer": $routeParams.clientId
                    "handbook_contact" : true
                }
            }

            # SEND API : SAVE
            ContactService.save {org_id:$routeParams.clientId}, newContact, (res)->
                $scope.loadContactList()

        # 4. Edit contact : call modalbox
        $scope.editContact = (contact) ->
            $scope.editcontact = contact
            modalInstance = $modal.open {
                templateUrl: 'views/handbooks/contact_form.html'
                controller: 'ContactFormCtrl'
                resolve: {
                    contact: ->
                        return contact
                }
                scope: $scope
            }

        # 5. Delete a contact item
        $scope.deleteContact = (contact) ->
            r = confirm("Do you want to delete \"" + contact.position.title + "\"?")
            if r == true
                fetchContact.delete contact.position._links.self.href
                .then (res) ->
                    $scope.loadContactList()


        # 5. submit contact form
#        $scope.contact_submit = () ->
#            angular.forEach $scope.frm_contact.$error.required, (field)->
#                field.$dirty = true



        # 6. Count selected contact item
        $scope.totalSelected = 0
        $scope.contactSelect = () ->
            $scope.totalSelected = 0
            for i, item of $scope.contacts
                if item.checked == true
                    $scope.totalSelected++

        # 7. Delete multi-selected contact
        $scope.deleteSelectedContacts = ->
            r = confirm("Do you want to delete all selected contacts ?")
            count = 0
            if r == true
                for i, item of $scope.contacts
                    if item.checked == true
                        fetchContact.delete item.position._links.self.href
                        .then (res) ->
                            count++
                            if count == $scope.totalSelected
                                $scope.loadContactList()
        return

])
# ------------------------------------
# EDIT CONTACT CTRL
# in MODAL BOX
.controller('ContactFormCtrl', [
    '$scope', '$routeParams', 'fetchContact', 'config', '$modalInstance', 'fetchUsers', '$q','contact', 'authHandler'
    ($scope, $routeParams, fetchContact, config, $modalInstance, fetchUsers, $q, contact, authHandler) ->
        # 0. Authorize
        authHandler.checkLoggedIn()

        $scope.contact = contact
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


        $scope.save = ->
            console.log $scope.srch_users
            updateContact = {
                "position": {
                    "title": contact.position.title
                    "employee": $scope.srch_users[$scope.contact.user.email]
                    "enabled": true
                    "employer": $routeParams.clientId
                    "handbook_contact" : true
                }
            }

            fetchContact.update(contact.position._links.self.href, updateContact).then  (res) ->
                $scope.loadContactList()
                $modalInstance.close()
            , (error) ->
                alert error.status + ' : Wrong email! Try again.'

        $scope.cancel = ->
            $modalInstance.dismiss('cancel');
])
# ------------------------------------
# SEARCH SUGGEST USER by EMAIL Directive
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



