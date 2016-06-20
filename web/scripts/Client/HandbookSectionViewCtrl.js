(function () {
    'use strict';
    angular.module('app.handbook_section_view', []).controller('HandbookSectionViewCtrl', [
        '$scope', '$routeParams', 'handbookService', 'clientService', 'sectionService', '$location', '$timeout', 'fetchHandbook', 'config', '$rootScope', function ($scope, $routeParams, handbookService, clientService, sectionService, $location, $timeout, fetchHandbook, config, $rootScope) {
            var  translateSection, _URL_sections, _loadAllParent;
            translateSection = function (item) {
                var newItem;
                newItem = item;
                fetchHandbook.get(item._links.translations.href).then(function (res) {
                    if (res.status !== 200 || typeof res !== 'object') {
                        return;
                    }
                    newItem['translations'] = res.data;
                }, function (error) {
                    console.log(error);
                });
                return newItem;
            };


            $scope.clientId = $routeParams.clientId;
            $scope.handbookId = $routeParams.handbookId;


            handbookService.get({
                org_id: $scope.clientId,
                hand_id: $scope.handbookId
            }, function(data, getResponseHeaders) {
                $scope.handbook = data;
                $scope.handbook.locale = 'en_us';
                return fetchHandbook.get(data._links.translations.href).then(function(res) {
                    if (res.status !== 200 || typeof res !== 'object') {
                        return;
                    }
                    $scope.handbook['translations'] = res.data;
                }, function(error) {
                    console.log(error);
                });
            });


            _URL_sections = {
                list: config.path.baseURL + config.path.sections.replace(':org_id', $scope.clientId).replace(':hand_id', $scope.handbookId)
            };

            $scope.allowShowActionSections = false;
            $scope.loadSections = function (limit, goPage) {
                return fetchHandbook.get(_URL_sections.list + '?search=section.parent{null}1', +'&limit=' + limit, +'&page=' + goPage, +'&sort=section.ordering:asc').then(function (res) {
                    $scope.sections = {};
                    if (res.data._embedded.items.length > 0) {
                        $scope.sections.pages = res.data.pages;
                        $scope.sections.total = res.data.total;
                        $scope.sections.items = [];
                        angular.forEach(res.data._embedded.items, function (item) {
                            item = translateSection(item);
                            item.children = {};
                            item.children.items = [];
                            item.children.total = 0;
                            item.children.show = false;
                            if (item._links.children) {
                                fetchHandbook.get(item._links.children.href, +'?limit=9999', +'&sort=section.ordering:asc').then(function (child) {
                                    if (child.data._embedded.items.length > 0) {
                                        console.log(child.data._embedded.items);
                                        item.children.total = child.data.total;
                                        return angular.forEach(child.data._embedded.items, function (child_item) {
                                            item.children.items.push(translateSection(child_item));
                                            $scope.allowShowActionSections = true;
                                        });
                                    }else{
                                        $scope.allowShowActionSections = true;
                                    }
                                }, function (error) {
                                    return console.log(error);
                                });
                            }else{
                                $scope.allowShowActionSections = true;
                            }
                            return $scope.sections.items.push(item);
                        });
                        return;
                    } else {
                        $scope.sections.pages = 0;
                        $scope.sections.total = 0;
                        return $scope.sections.items = [];
                    }
                }, function (error) {
                    return console.log(error);
                });
            };
            $scope.numPerPageOpt = [3, 5, 10, 20];
            $scope.numPerPage = $scope.numPerPageOpt[2];
            $scope.currentPage = 1;
            $scope.filteredUsers = [];
            $scope.currentPageUsers = [];
            $scope.onNPPChange = function () {
                return $scope.loadSections($scope.numPerPage, $scope.currentPage);
            };
            $scope.gotoPage = function (page) {
                return $scope.loadSections($scope.numPerPage, page);
            };
            $scope.loadSections($scope.numPerPage, $scope.currentPage);
            $scope.parentSection = [];
            _loadAllParent = function () {
                return fetchHandbook.get(_URL_sections.list + '?search=section.parent{null}1&limit=9999').then(function (child) {
                    if (child.data._embedded.items.length > 0) {
                        return angular.forEach(child.data._embedded.items, function (child_item) {
                            return $scope.parentSection.push(translateSection(child_item));
                        });
                    }
                }, function (error) {
                    return console.log(error);
                });
            };
            _loadAllParent();
            $scope.isUpdate = false;
            $scope.isCreateSubSection = true;
            $scope.selectedSec = null;
            $scope.uploadButtonLabel = "Upload Section Images";
            $scope.uploadButtonLabelPdf = "Upload Section Pdfs";
            $scope.urlUpload = "";
            $scope.uploadResponse = "";
            $rootScope.readyToUpload = false;
            $rootScope.readyToUploadPdf = false;
            $scope.readyToAddContent = false;
            $scope.showChildren = function (section) {
                return section.children.show = !section.children.show;
            };

            $scope.loadDescription = function (section) {
                $scope.descriptionHanbookSection = section.translations['en_us'] != undefined ? section.translations['en_us'].description : section.description;
            }

        }
    ]);

}).call(this);
