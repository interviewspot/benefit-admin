(function () {
    'use strict';
    angular.module('app.clients', []).controller('clientCtrl', [
        '$scope', '$filter', 'fetchTabData', 'fakeData', '$location', 'clientService','categoryService', 'fetchHandbook','fetchCategory', '$routeParams', '$route', 'config', 'Images', 'php', 'ClientAPI', 'Companies', 'Clients', 'handbookService', '$timeout', 'authHandler', '$rootScope', '$location', function ($scope, $filter, fetchTabData, fakeData, $location, clientService,categoryService, fetchHandbook, fetchCategory, $routeParams, $route, config, Images, php, ClientAPI, Companies, Clients, handbookService, $timeout, authHandler, $rootScope) {
            var _URL_clients, _getClients;
            authHandler.checkLoggedIn();
            if ($location.path() == '/clients') {
                if ($rootScope.employerId != null && $rootScope.isAdmin == false) {
                    $location.path('/clients/' + $rootScope.employerId + '/info');
                    return $route.reload();
                }
            }
            _URL_clients = {
                list: config.path.baseURL + config.path.clients,
                handbooks: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/category/handbook/uncategorize'

            };
            _getClients = function (limit, goPage) {
                return Clients.get(_URL_clients.list + '?limit=' + limit + '&page=' + goPage).then(function (res) {
                    if (res.status !== 200 || typeof res !== 'object') {
                        return;
                    }
                    $scope.clients = res.data;
                    $scope.clients_list = res.data._embedded.items;
                }, function (error) {
                    console.log(error);
                });
            };
            
            $scope.numPerPageOpt = [5, 10, 20, 30];
            $scope.numPerPage = $scope.numPerPageOpt[1];
            $scope.currentPage = 1;
            $scope.filteredUsers = [];
            $scope.currentPageUsers = [];
            $scope.onNPPChange = function () {
                return _getClients($scope.numPerPage, $scope.currentPage);
            };
            $scope.gotoPage = function (page) {
                return _getClients($scope.numPerPage, $scope.currentPage);
            };
            _getClients($scope.numPerPage, $scope.currentPage);
            $scope.showPreview = false;
            $scope.isForward = false;
            $scope.isTerm = false;
            $scope.isCode = false;
            $scope.isForward = false;
            $scope.isOurCpny = false;
            $scope.isCreateNew = false;
            $scope.fnCreateNew = function () {
                return $scope.isCreateNew = !$scope.isCreateNew;
            };
            $scope.isEditHandbook = false;
            $scope.fnEditHandbook = function () {
                return $scope.isEditHandbook = !$scope.isEditHandbook;
            };
            $scope.isEditClients = false;
            $scope.isCreateHandbook = false;
            $scope.createNewVersion = function () {
                return $scope.isCreateHandbook = !$scope.isCreateHandbook;
            };
            
            $scope.addNewCategory = function (category) {

                var data = {
                    "category": {
                        "name": category.name,
                        "slug": category.name,
                        "enabled": category.enabled,
                        "organisation": $rootScope.employerId
                    }
                };

                return categoryService.save({
                    org_id: $rootScope.employerId
                }, data, function(res) {
                    $scope.infoUpdated = 'Create Category Success';
                    return $timeout(function() {
                        return location.reload();
                    }, 1000);
                }, function(error) {
                    return $scope.infoUpdated = error.status + ': Error, refresh & try again !';
                });
            }
            $scope.changePublished = function (handbook, clientId) {
                var desc, r, title, updateData;
                r = confirm("Do you want to change this Handbook ?");
                if (!r) {
                    return;
                }
                handbook.locale = 'en_us';
                if (handbook.translations[handbook.locale]) {
                    title = handbook.translations[handbook.locale].title;
                } else {
                    title = handbook.title;
                }
                if (handbook.translations[handbook.locale]) {
                    desc = handbook.translations[handbook.locale].description;
                } else {
                    desc = handbook.description;
                }
                updateData = {
                    "handbook": {
                        "version": handbook.version,
                        "title": title,
                        "year": handbook.year,
                        "description": desc,
                        "organisation": clientId,
                        "locale": handbook.locale,
                        "enabled": handbook.enabled
                    }
                };
                return handbookService.update({
                    org_id: clientId,
                    hand_id: handbook.id
                }, updateData, function (res) {
                    if (res.status === 204) {
                        $timeout(function () {
                            return location.reload();
                        }, 300);
                    }
                }, function (error) {
                    return alert(error.status + ': Error, refresh & try again !');
                });
            };


            $scope.isCreateCategory = false;
            $scope.createNewCategory = function () {
                return $scope.isCreateCategory = !$scope.isCreateCategory;
            }

            $scope.showAllHandbook = false;
            $scope.magicShowCategoryHandbook = function () {
                return $scope.showAllHandbook = !$scope.showAllHandbook;

            }
            $scope.isHandbookShow = false;
            $scope.handbookShow = function (category) {
                $scope.isHandbookShow = true;

                if(category.uncategory == true){
                    return Clients.get(_URL_clients.handbooks).then(function (res){
                        if (res.status !== 200 || typeof res !== 'object') {
                            return;
                        }
                        $scope.handbooks = res.data._embedded.items;
                        return angular.forEach($scope.handbooks, function (item, i) {
                            return Clients.get(item._links.translations.href).then(function (res) {
                                if (res.status !== 200 || typeof res !== 'object') {
                                    return;
                                }
                                $scope.handbooks[i]['translations'] = res.data;
                                $scope.handbooks[i]['EDIT'] = item._links.self.actions.join().indexOf('OPERATE') > -1 ||  item._links.self.actions.join().indexOf('EDIT') > -1 ? true : false ;
                                $scope.handbooks[i]['DELETE'] = item._links.self.actions.join().indexOf('OPERATE') > -1 ||  item._links.self.actions.join().indexOf('DELETE') > -1 ? true : false ;
                            }, function (error) {
                                console.log(error);
                            });
                        });
                    })
                } else {
                    return Clients.get(category._links.handbooks.href).then(function (res) {
                        if (res.status !== 200 || typeof res !== 'object') {
                            return;
                        }
                        $scope.handbooks = res.data._embedded.items;
                        return angular.forEach($scope.handbooks, function (item, i) {
                            return Clients.get(item._links.translations.href).then(function (res) {
                                if (res.status !== 200 || typeof res !== 'object') {
                                    return;
                                }
                                $scope.handbooks[i]['translations'] = res.data;
                                $scope.handbooks[i]['EDIT'] = item._links.self.actions.join().indexOf('OPERATE') > -1 ||  item._links.self.actions.join().indexOf('EDIT') > -1 ? true : false ;
                                $scope.handbooks[i]['DELETE'] = item._links.self.actions.join().indexOf('OPERATE') > -1 ||  item._links.self.actions.join().indexOf('DELETE') > -1 ? true : false ;
                            }, function (error) {
                                console.log(error);
                            });
                        });
                    })
                }


            }
            $scope.categoryShow = function () {
                $scope.isHandbookShow = false;
                console.log($scope.isHandbookShow);
            }

            $scope.ClientPage = {
                tabUrls: {}
            };
            if ($routeParams.clientId) {
                clientService.get({
                    org_id: $routeParams.clientId
                }, function (data, getResponseHeaders) {
                    if(data._links.handbooks) {
                        fetchHandbook.get(data._links.handbooks.href).then(function (res) {
                            if (typeof res.data._embedded !== 'object' || !res.data._embedded.items) {
                                $scope.isCreateHandbook = true;
                                return;
                            }
                            $scope.handbookAll = res.data._embedded.items;
                            return angular.forEach($scope.handbookAll, function (item, i) {
                                return Clients.get(item._links.translations.href).then(function (res) {
                                    if (res.status !== 200 || typeof res !== 'object') {
                                        return;
                                    }
                                    $scope.handbookAll[i]['translations'] = res.data;
                                    $scope.handbookAll[i]['EDIT'] = item._links.self.actions.join().indexOf('OPERATE') ||  item._links.self.actions.join().indexOf('EDIT') ? true : false ;
                                    $scope.handbookAll[i]['DELETE'] = item._links.self.actions.join().indexOf('OPERATE') ||  item._links.self.actions.join().indexOf('DELETE') ? true : false ;
                                }, function (error) {
                                    console.log(error);
                                });
                            });
                        });
                    }
                    if (data._links.categories) {
                        $scope.ClientPage.tabUrls = {
                            "info": '#/clients/' + data.id + '/info',
                            "user": '#/clients/' + data.id + '/user',
                            "categories": '#/clients/' + data.id + '/categories/handbooks',
                            "categoriesList": '#/clients/' + data.id + '/categories/list',
                            "policies": '#/clients/' + data.id + '/policies',
                            "insurance": '#/clients/' + data.id + '/insurance',
                            "healthcare": '#/clients/' + data.id + '/healthcare',
                            "imerchant": '#/clients/' + data.id + '/imerchant',
                            "notifications": '#/clients/' + data.id + '/notifications'
                        };
                        fetchCategory.get(data._links.categories.href).then(function (res) {
                            if (typeof res.data._embedded !== 'object' || !res.data._embedded.items) {
                                return;
                            }
                            $scope.categories = res.data._embedded.items;
                            $scope.categories.unshift({ name : "Uncategories" , uncategory : true ,enabled : true});
                            window.handb = $scope.categories;
                        })
                    }

                    $scope.clientDetail = data;
                    if (typeof data._links.logo === 'object' && data._links.logo != undefined) {
                        Images.get(data._links.logo.href).then(function (res) {
                            var logo_id_arr;
                            if (res.status !== 200 || typeof res !== 'object') {
                                return;
                            }
                            logo_id_arr = php.explode('/media/', data._links.logo.href);
                            $scope.urlUpload = $scope.clientDetail._links['logo.post'].href;
                            $scope.clientDetail['logo'] = res.data;
                            if (typeof res.data._links.url === 'object' && res.data._links.url.href) {
                                Images.get(data._links.logo.href + '/url').then(function (url) {
                                    if (url.status !== 200 || typeof url !== 'object') {
                                        return;
                                    }
                                    return $scope.clientDetail['logo_url'] = url.data.url;
                                }, function (error) {
                                    return console.log(error);
                                });
                            }
                        }, function (error) {
                            return console.log(error);
                        });
                    } else {
                        $scope.urlUpload = $scope.clientDetail._links['logo.post'].href;
                    }
                    if (typeof data._links.banners === 'object' && data._links.banners != undefined) {
                        Images.get(data._links.banners.href).then(function (res) {
                            if (res.status !== 200 || typeof res !== 'object') {
                                return;
                            }
                            $scope.urlUploadBanner = $scope.clientDetail._links['banners'].href;
                            $scope.clientDetail['banners'] = [];
                            if (res.data._embedded.items.length > 0) {
                                angular.forEach(res.data._embedded.items, function (itm) {
                                    var b;
                                    b = itm;
                                    if (typeof b._links.url === 'object' && b._links.url.href) {
                                        return Images.get(config.path.baseURL + b._links.url.href).then(function (bn) {
                                            if (bn.status === 200 || typeof bn === 'object') {
                                                b['banner_url'] = bn.data.url;
                                                return $scope.clientDetail['banners'].push(b);
                                            }
                                        }, function (error) {
                                            return console.log(error);
                                        });
                                    }
                                });
                            }
                        }, function (error) {
                            return console.log(error);
                        });
                    } else {
                        $scope.urlUploadBanner = $scope.clientDetail._links['banners'].href;
                    }

                });
            }
            $scope.isEditUser = false;
            $scope.fnEditUser = function () {
                return $scope.isEditUser = !$scope.isEditUser;
            };
            $scope.isNewUser = false;
            $scope.isUserUpload = false;
            $scope.isDetailUpload = false;
            $scope.enabClient = function (client, i) {
                var banners_id_arr, logo_id_arr, r, sm_client_data;
                r = confirm("Do you want to change this company?");
                if (!r) {
                    return;
                }
                logo_id_arr = null;
                if (client._links.logo) {
                    logo_id_arr = php.explode('/media/', client._links.logo.href);
                    logo_id_arr = logo_id_arr[1];
                }
                sm_client_data = {
                    "organisation": {
                        "admin_user": null,
                        "parent": null,
                        "name": client.name ? client.name : null,
                        "code": client.code ? client.code : null,
                        "reg_no": client.reg_no ? client.reg_no : null,
                        "head_office_no": client.head_office_no ? client.head_office_no : null,
                        "billingAddress": client.billing_address ? client.billing_address : null,
                        "office_address": client.office_address ? client.office_address : null,
                        "reservation_email": client.reservation_email ? client.reservation_email : null,
                        "user_contact_no": client.user_contact_no ? client.user_contact_no : null,
                        "client_since": client.client_since ? client.client_since : null,
                        "office_hours": client.office_hours ? client.office_hours : null,
                        "redemption_password": client.redemption_password ? client.redemption_password : null,
                        "about_company": client.about_company ? client.about_company : null,
                        "enabled": !client.enabled,
                        "logo": logo_id_arr
                    }
                };
                banners_id_arr = null;
                if (client._links.banners) {
                    return Images.get(client._links.banners.href).then(function (res) {
                        if (res.status === 200 && typeof res === 'object') {
                            banners_id_arr = [];
                            angular.forEach(res.data._embedded.items, function (banner) {
                                return banners_id_arr.push(banner.id);
                            });
                            sm_client_data.organisation.banners = banners_id_arr;
                            return clientService.update({
                                org_id: client.id
                            }, sm_client_data, function (res) {
                                return $scope.clients_list[i].enabled = sm_client_data.organisation.enabled;
                            }, function (error) {
                                return alert(error.status + ' : Try later after refreshing!');
                            });
                        }
                    });
                } else {
                    return clientService.update({
                        org_id: client.id
                    }, sm_client_data, function (res) {
                        return $scope.clients_list[i].enabled = sm_client_data.organisation.enabled;
                    }, function (error) {
                        return alert(error.status + ' : Try later after refreshing!');
                    });
                }
            };
            $scope.clients_edit = false;
            $scope.editClient = function (clients_edit) {
                $scope.isDisable = !$scope.isDisable;
                $scope.clients_edit = !clients_edit;
                if ($scope.clients_edit === false && $scope.clientDetail.id) {
                    return $scope.updateClient("", null);
                }
            };
            $scope.updateClient = function (task, obj) {
                var banner_id, logo_id, sm_client_data;
                if ($scope.clientDetail.redemption_password && $scope.clientDetail.redemption_password.length !== 4) {
                    alert('Please entry 4 chars in Redemption password');
                    return;
                }
                sm_client_data = {
                    "organisation": {
                        "admin_user": null,
                        "parent": null,
                        "name": $scope.clientDetail.name ? $scope.clientDetail.name : null,
                        "code": $scope.clientDetail.code ? $scope.clientDetail.code : null,
                        "reg_no": $scope.clientDetail.reg_no ? $scope.clientDetail.reg_no : null,
                        "head_office_no": $scope.clientDetail.head_office_no ? $scope.clientDetail.head_office_no : null,
                        "billingAddress": $scope.clientDetail.billing_address ? $scope.clientDetail.billing_address : null,
                        "office_address": $scope.clientDetail.office_address ? $scope.clientDetail.office_address : null,
                        "reservation_email": $scope.clientDetail.reservation_email ? $scope.clientDetail.reservation_email : null,
                        "user_contact_no": $scope.clientDetail.user_contact_no ? $scope.clientDetail.user_contact_no : null,
                        "client_since": $scope.clientDetail.client_since ? $scope.clientDetail.client_since : null,
                        "office_hours": $scope.clientDetail.office_hours ? $scope.clientDetail.office_hours : null,
                        "redemption_password": $scope.clientDetail.redemption_password ? $scope.clientDetail.redemption_password : null,
                        "about_company": $scope.clientDetail.about_company ? $scope.clientDetail.about_company : null,
                        "enabled": $scope.clientDetail.enabled || null
                    }
                };
                logo_id = null;
                if (task !== "delete_logo") {
                    if ($scope.$$childTail.uploadresponse) {
                        logo_id = $scope.$$childTail.uploadresponse.logo_id;
                    } else {
                        logo_id = $scope.clientDetail.logo ? $scope.clientDetail.logo.id : null;
                    }
                }
                sm_client_data.organisation['logo'] = logo_id;
                banner_id = [];
                if ($scope.clientDetail.banners && $scope.clientDetail.banners.length > 0) {
                    angular.forEach($scope.clientDetail.banners, function (bn) {
                        if (task !== "delete_banner" || bn.id !== obj.id) {
                            return banner_id.push(bn.id);
                        }
                    });
                    if ($scope.$$childTail.uploadbanner) {
                        banner_id.push($scope.$$childTail.uploadbanner.logo_id);
                    }
                } else {
                    banner_id = $scope.$$childTail.uploadbanner ? $scope.$$childTail.uploadbanner.logo_id : null;
                }
                sm_client_data.organisation['banners'] = banner_id;
                console.log(sm_client_data);
                return clientService.update({
                    org_id: $scope.clientDetail.id
                }, sm_client_data, function (res) {
                    if (typeof res.organisation === 'object') {
                        if (task === "delete_logo") {
                            return Images["delete"]($scope.clientDetail._links.logo.href).then(function (res) {
                                if (res.status === 204) {
                                    location.reload();
                                }
                            }, function (error) {
                                console.log(error);
                                if (error.status === 500) {
                                    return $scope.clientDetail.logo = null;
                                }
                            });
                        } else if (task === "delete_banner" && typeof obj === 'object') {
                            return Images["delete"](config.path.baseURL + obj._links.self.href).then(function (res) {
                                if (res.status === 204) {
                                    $timeout(function () {
                                        return location.reload();
                                    }, 300);
                                }
                            }, function (error) {
                                console.log(error);
                                if (error.status === 500) {
                                    return $scope.clientDetail.logo = null;
                                }
                            });
                        } else {
                            console.log(sm_client_data);
                            return;
                            return $timeout(function () {
                                return location.reload();
                            }, 300);
                        }
                    }
                }, function (error) {
                    return alert(error.status + ' : Try later and new company code');
                });
            };
            $scope.isActive = function (path) {
                if ($location.path().search(path) >= 0) {
                    return 'active';
                }
            };
            $scope.deleteHandbook = function (handbook) {
                var r;
                r = confirm("Do you want to delete \"" + handbook.title + "\"?");
                if (r === true) {
                    return fetchHandbook["delete"](handbook._links.self.href).then(function (res) {
                        return $route.reload();
                    });
                }
            };
            $scope.urlUpload = config.path.baseURL + config.path.upload + 'image/media';
            $scope.uploadButtonLabel = 'Upload file';
            $scope.delLogo = function () {
                if (typeof $scope.clientDetail._links.logo === 'object' && $scope.clientDetail._links.logo.href) {
                    return $scope.updateClient("delete_logo", null);
                }
            };
            $scope.delBanner = function (banner) {
                if (typeof $scope.clientDetail._links.banners === 'object' && $scope.clientDetail._links.banners.href) {
                    return $scope.updateClient("delete_banner", banner);
                }
            };
            $scope.deleteClient = function (client) {
                var r;
                r = confirm("Do you want to delete this client \"" + client.name + "\"?");
                if (r === true) {
                    ClientAPI.go('DELETE', client._links.self.href).then(function (res) {
                        location.reload();
                        return true;
                    }, function (error) {
                        return alert(error.status + ' : Try later');
                    });
                }
            };
            $scope.co = null;
            $scope.rule = {
                validMail: /^[-a-z0-9~!$%^&*_=+}{\'?]+(\.[-a-z0-9~!$%^&*_=+}{\'?]+)*@([a-z0-9_][-a-z0-9_]*(\.[-a-z0-9_]+)*\.(aero|arpa|biz|com|coop|edu|gov|info|int|mil|museum|name|net|org|pro|travel|mobi|[a-z][a-z])|([0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}))(:[0-9]{1,5})?$/i,
                noSpace: /[^\s\\]/
            };
            return $scope.submitNewClient = function () {
                var co_data;
                angular.forEach($scope.frm_create_clients.$error.required, function (field) {
                    return field.$dirty = true;
                });
                if ($scope.frm_create_clients.$error.required) {
                    return false;
                }
                $scope.co.enabled = true;
                co_data = {
                    organisation: $scope.co
                };
                Companies.post(config.path.baseURL + config.path.clients, co_data).then(function (res) {
                    console.log(res);
                    if (typeof res === 'object' && res.status === 201) {
                        console.log("OK, SAVED");
                    } else {
                        alert(error.status + ' : Try later');
                    }
                    location.reload();
                    return true;
                }, function (error) {
                    return alert(error.status + ' : Try later and new company code');
                });
            };
        }
    ]).controller('CategoryCtrl', [
        '$scope', '$routeParams', 'fetchCategory','categoryService' , 'clientService', 'sectionService', '$location', '$timeout', 'authHandler',
        function($scope, $routeParams, fetchCategory, categoryService, clientService, sectionService, $location, $timeout, authHandler) {
            authHandler.checkLoggedIn();
            $scope.clientId = $routeParams.clientId;
            $scope.categoryId = $routeParams.categoryId;
            $scope.isCreateCategory = false;
            $scope.infoUpdated = null;
            $scope.ClientPage = {
                tabUrls : {
                "info": '#/clients/' +  $scope.clientId + '/info',
                "user": '#/clients/' +  $scope.clientId + '/user',
                "categories": '#/clients/' +  $scope.clientId + '/categories/handbooks',
                "categoriesList": '#/clients/' +  $scope.clientId + '/categories/list',
                "policies": '#/clients/' +  $scope.clientId + '/policies',
                "insurance": '#/clients/' +  $scope.clientId + '/insurance',
                "healthcare": '#/clients/' +  $scope.clientId + '/healthcare',
                "imerchant": '#/clients/' +  $scope.clientId + '/imerchant',
                "notifications": '#/clients/' +  $scope.clientId + '/notifications'
                }
            };

            clientService.get({
                org_id: $scope.clientId,
            }, function(data, getResponseHeaders) {
                return $scope.clientDetail = data;
            });

            if ($scope.isCreateCategory === false) {
                categoryService.get({
                    org_id: $scope.clientId,
                    category_id: $scope.categoryId
                }, function(data, getResponseHeaders) {
                    $scope.category = data;

                });
            }
            $scope.submitCategory = function () {
                var updateData = {
                    "category": {
                        "name": $scope.category.name,
                        "slug": $scope.category.name,
                        "enabled": $scope.category.enabled,
                        "organisation": $scope.clientId
                    }
                };

                return categoryService.update({
                    org_id: $scope.clientId,
                    category_id: $scope.categoryId
                }, updateData, function(res) {
                    $scope.infoUpdated = 'Update Success';
                    return $timeout(function() {
                        return $scope.infoUpdated = null;
                    }, 1000);
                }, function(error) {
                    return $scope.infoUpdated = error.status + ': Error, refresh & try again !';
                });

            }
        }
    ]).controller('CategoryHandbookCtrl', [
        '$scope' , '$routeParams', '$location', '$timeout', 'authHandler', 'config','Users',
        function ($scope ,$routeParams , $location , $timeout , authHandler, config,Users) {
            authHandler.checkLoggedIn();
            $scope.clientId = $routeParams.clientId;
            $scope.categoryId = $routeParams.categoryId;
            $scope.infoUpdated = null;

            var _URL = {
                handbooks: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/categories/' + $routeParams.categoryId + '/handbooks',
                handbooksAutocomplete: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/handbooks',
                postHandbookToCategory: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/categories/' + $routeParams.categoryId,
            };
            $scope.handbooks = [];

            $scope.handbookSearch = [];
            $scope.handbookSearchObject = [];
            $scope.modelHandbook = '';
            $scope.allowAdd = false;

            $scope.addHandbook = function () {
                if($scope.handbookSearchObject[$scope.modelHandbook] != undefined) {

                    var handbook = $scope.handbookSearchObject[$scope.modelHandbook];
                    Users.post(_URL.postHandbookToCategory + '/handbooks/' +handbook.id, {}).then(function (results) {
                        if (results.status === 204) {
                            $scope.infoUpdated = 'Updated Successfully.';
                            $scope.handbooks.push(handbook);
                            $scope.modelHandbook = '';
                            delete $scope.handbookSearchObject[$scope.modelHandbook];
                            return $timeout(function() {
                                return $scope.infoUpdated = null;
                            }, 2000);
                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                            $scope.modelHandbook = '';
                            delete $scope.handbookSearchObject[$scope.modelHandbook];
                            return $timeout(function() {
                                return $scope.infoUpdated = null;
                            }, 2000);
                        }
                    });
                }
            }
            $scope.removeHandbook = function (id) {
                Users.delete(_URL.postHandbookToCategory + '/handbooks/' +id).then(function (results) {
                    if (results.status === 204) {
                        $scope.infoUpdated = 'Updated Successfully.';
                        loadList();
                    } else {
                        $scope.infoUpdated = 'Updated Fail.';
                        return $timeout(function() {
                            return $scope.infoUpdated = null;
                        }, 2000);
                    }
                });
            }
            $scope.$watch('modelHandbook', function (modelHandbook) {
                if (modelHandbook != '') {
                    Users.get(_URL.handbooksAutocomplete + '?search=handbook.title=%' + modelHandbook + '%').then(function (results) {
                        if (results.status !== 200 || typeof results !== 'object') {
                            return;
                        }
                        $scope.handbookSearch = [];
                        angular.forEach(results.data._embedded.items, function (handbook) {
                            $scope.handbookSearch.push(handbook.title);
                            $scope.handbookSearchObject[handbook.title] = handbook;
                        });
                    });
                }

            }, true);
            var loadList = function () {
                Users.get(_URL.handbooks).then(function (results) {
                    if (results.status !== 200 || typeof results !== 'object') {
                        return;
                    }
                    $scope.handbooks = results.data._embedded.items;
                    return $timeout(function() {
                        return $scope.infoUpdated = null;
                    }, 2000);
                });
            }
            loadList();
        }
    ]);

}).call(this);
