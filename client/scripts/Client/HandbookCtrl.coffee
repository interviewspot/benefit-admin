'use strict'
angular.module('app.handbooks', [])
# --------------------------------------------
# Contact in Handbook TAB of Client
# 1. manage list contacts
# 2. Autocomplete email
.controller('HandbookCtrl', [
    '$scope', '$routeParams', 'handbookService', 'clientService', 'sectionService', '$location', '$timeout',
    ($scope, $routeParams, handbookService, clientService, sectionService, $location, $timeout) ->

        $scope.clientId = $routeParams.clientId
        $scope.handbookId = $routeParams.handbookId

        clientService.get {org_id:$scope.clientId}, (data, getResponseHeaders) ->
            $scope.clientDetail = data

        handbookService.get {org_id:$scope.clientId, hand_id:$scope.handbookId}, (data, getResponseHeaders) ->
            $scope.handbook = data

        $scope.isActive = (href) ->
            path = $location.path()
            if path.indexOf(href) is 0
              return 'active'

        $scope.submitHandbookInfo = ->

            updateData = {
                handbook: $scope.handbook
            }
            delete updateData.handbook._links 
            delete updateData.handbook.id
            updateData.handbook['organisation'] = $scope.clientId
            handbookService.update {org_id:$scope.clientId, hand_id:$scope.handbookId}, updateData

            # update company info
            updateData = {
                children: {
                    name: $scope.clientDetail.name
                    code: $scope.clientDetail.code
                    parent: null
                    adminUser: null
                    root: null
                    location: null
                    logo: null
                    lft: null
                    lvl: null
                    rgt: null
                    regNo: $scope.clientDetail.reg_no
                    headOfficeNo: $scope.clientDetail.head_office_no
                    billingAddress: $scope.clientDetail.billing_address
                    reservationEmail: $scope.clientDetail.reservation_email
                    userContactNo: $scope.clientDetail.user_contact_no
                    clientSince: $scope.clientDetail.client_since
                    officeHours: $scope.clientDetail.office_hours
                    redemptionPassword: $scope.clientDetail.redemption_password
                    aboutCompany: $scope.clientDetail.about_company
                }
            }
            # delete updateData._links 
            # delete updateData.id
            clientService.update {org_id:$scope.clientId}, updateData
            # display message
            $scope.generalUpdated = 'Update Success'
            $timeout ()->
                $scope.generalUpdated = null
            , 3000


])



