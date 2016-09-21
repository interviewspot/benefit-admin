(function () {
    'use strict';
    angular.module('app.users', ['ngTouch', 'ui.grid', 'ui.grid.edit', 'ui.bootstrap'])
        .controller('UsersCtrl', [
            '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', '$modal', 'UserService', 'Users', 'fetchContact', '$timeout', '$rootScope', 'authHandler',
            function ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, UserService, Users, fetchContact, $timeout, $rootScope, authHandler) {
                var _URL_users, _getUsers, _updateUser;
                authHandler.checkLoggedIn();
                $scope.clientId = $routeParams.clientId;

                $scope.sortType = 'email'; // set the default sort type
                $scope.sortReverse = false; // set the default sort order
                // $scope.searchFish   = '';     // set the default search/filter term
                _URL_users = {
                    list: config.path.baseURL + config.path.contacts.replace(":org_id", $routeParams.clientId),
                    sendMail: config.path.baseURL + config.path.send_information_login.replace(":org_id", $routeParams.clientId),

                };
                $scope.getTime = function (ndate) {
                    var dateAsDateObject;
                    dateAsDateObject = new Date(Date.parse(ndate));
                    return dateAsDateObject.getTime();
                };
                $scope.sortQuery = '';
                // $scope.sortReverse = false;
                $scope.searchUserKey = '';

                $scope.checkallUser = false;
                _getUsers = function (limit, goPage) {
                    console.log($scope.dataSendMailRaw);
                    $scope.checkallUser = false;
                    var searchQuery = 'position.employee.firstName:%' + $scope.searchUserKey + '%';
                    var field = $scope.sortType;
                    var type = $scope.sortReverse == false ? 'asc' : 'desc';
                    $scope.sortQuery = 'position.employee.' + field + ':' + type;
                    var url = _URL_users.list + '?limit=' + limit + '&page=' + goPage + '&sort=' + $scope.sortQuery + '&search=' + searchQuery;
                    return fetchContact.get(url).then(function (res) {


                        var i, item, _fn, _ref;
                        console.log(_URL_users.list);
                        if (res.data._embedded.items.length) {
                            $scope.users = res.data;
                            $scope.users.items = [];
                            console.log($scope.users);
                            _ref = res.data._embedded.items;
                            _fn = function (itemInstance, i) {
                                return Users.get(itemInstance._links.employee.href).then(function (res) {
                                    if (res.status !== 200 || typeof res !== 'object') {
                                        return;
                                    }
                                    res.data.position_data = itemInstance;
                                    res.data.ordering = parseInt(i);
                                    $scope.users.items.push(res.data);
                                    Users.get(_URL_users.list + '/' + itemInstance.id + '/classes').then(function (tag) {
                                        var tag_lst;
                                        if (tag.data._embedded.items.length > 0) {
                                            tag_lst = [];
                                            angular.forEach(tag.data._embedded.items, function (tag) {
                                                if (tag.employee_class) {
                                                    return tag_lst.push(tag.name);
                                                }
                                            });
                                            res.data.employee_class = tag_lst.join(', ');
                                            return res.data.tags = tag.data._embedded.items;
                                        }
                                    }, function (error) {
                                        return console.log(error);
                                    });
                                }, function (error) {
                                    return console.log(error);
                                });
                            };
                            for (i in _ref) {
                                item = _ref[i];
                                _fn(item, i);
                            }
                        }
                    });
                };
                $scope.numPerPageOpt = [3, 5, 10, 20,50];
                $scope.numPerPage = $scope.numPerPageOpt[2];
                $scope.currentPage = 1;
                $scope.filteredUsers = [];
                $scope.currentPageUsers = [];
                $scope.onNPPChange = function () {
                    return _getUsers($scope.numPerPage, $scope.currentPage);
                };
                $scope.gotoPage = function (page) {
                    return _getUsers($scope.numPerPage, $scope.currentPage);
                };

                $scope.typeSendMail = '';
                $scope.dataSendMail = {};
                $scope.dataSendMailRaw = {};
                $scope.setDataSendMail = function (user, isTrue) {
                    if (isTrue) {
                        if($scope.dataSendMailRaw[user.id] === undefined) {
                            $scope.dataSendMailRaw[user.id] = user;
                        }
                    } else {
                        delete $scope.dataSendMailRaw[user.id];
                    }

                }
                $scope.checkAll = function () {
                    $scope.isTrue = $scope.checkallUser;
                    if ($scope.isTrue) {
                        angular.forEach($scope.users.items, function (user) {
                            if($scope.dataSendMailRaw[user.id] === undefined) {
                                $scope.dataSendMailRaw[user.id] = user;
                            }
                        });
                    } else {
                        angular.forEach($scope.users.items, function (user) {
                            delete $scope.dataSendMailRaw[user.id];
                        });
                    }
                };
                $scope.isCheckedSendmail = function (userId) {
                    if($scope.dataSendMailRaw[userId] !== undefined) {
                        return true;
                    }
                    return false;
                }
                $scope.sendInformationLogin = function () {
                    if ($scope.typeSendMail != '' && $scope.dataSendMailRaw) {
                        $scope.dataSendMail.data = {};
                        $scope.dataSendMail.data.type = $scope.typeSendMail;
                        $scope.dataSendMail.data.users = [];
                        angular.forEach($scope.dataSendMailRaw, function (user,userId) {
                            var data = {
                                "email": user.email,
                                "full_name": user.first_name + ' ' + user.last_name,
                                "web_username": user.username,
                                "web_password": "N/A",
                                "app_username": "N/A",
                                "app_password": user.code
                            }
                            $scope.dataSendMail.data.users.push(data);
                        });
                        console.log($scope.dataSendMail);
                        Users.post(_URL_users.sendMail, $scope.dataSendMail).then(function (res) {
                            if (res.status === 204) {
                                alert('Information sent successfully!');
                                $scope.checkall = false;
                                $scope.typeSendMail = '';
                            }
                        }, function (error) {
                            alert(error.status + ': Error API, refresh & try again!');
                        });


                    }else{
                        alert('Please select at least one user!');
                    }
                }

                $scope.sorting = function () {
                    var field = $scope.sortType;
                    var type = $scope.sortReverse == false ? 'asc' : 'desc';
                    $scope.sortQuery = 'position.employee.' + field + ':' + type;
                    return _getUsers($scope.numPerPage, $scope.currentPage)
                }
                $scope.searchUser = function () {
                    return _getUsers($scope.numPerPage, $scope.currentPage);
                }

                $scope.removeUser = function (user) {
                    var deleteUrl, r;
                    r = confirm("Do you want to delete this user \"" + user.email + "\"?");
                    if (r === true) {
                        deleteUrl = config.path.baseURL + config.path.users + '/';
                        Users["delete"](deleteUrl + user.id).then(function (res) {
                            if (typeof res === 'object' && res.status === 204) {
                                $timeout(function () {
                                    return location.reload();
                                }, 300);
                            }
                        }, function (error) {
                            return alert(error.status + ': Error, refresh & try again !');
                        });
                    }
                };
                $scope.enabUser = function (user, i) {
                    var r;
                    r = confirm("Do you want to change this user \"" + user.email + "\"?");
                    console.log(user);
                    if (r === true) {
                        _updateUser(user, i);
                    }
                };
                _updateUser = function (user, i) {
                    var newData, numTag, uTags, updateContact;
                    newData = {
                        "user": {
                            "first_name": user.first_name,
                            "last_name": user.last_name,
                            "username": user.username,
                            "email": user.email ? user.email : user.email_canonical,
                            "code": user.code,
                            "four_digit_pin": user.four_digit_pin || '',
                            "mobile_no": user.mobile_no || '',
                            "office_no": user.office_no || '',
                            "enabled": user.enabled,
                            "date_added": $filter('date')(new Date(user.date_added), 'yyyy-MM-ddT00:00:00+0000')
                        }
                    };
                    updateContact = {
                        "position": {
                            "employee": user.id,
                            "enabled": user.enabled,
                            "employer": $scope.clientId,
                            "handbook_contact": user.position_data.position_data
                        }
                    };
                    if (user.tags) {
                        uTags = {};
                        numTag = 1;
                        angular.forEach(user.tags, function (tag) {
                            var keyTag;
                            keyTag = "tag" + numTag;
                            uTags[keyTag] = {};
                            uTags[keyTag].name = tag.name;
                            uTags[keyTag].enabled = tag.enabled;
                            uTags[keyTag].employee_class = tag.employee_class;
                            uTags[keyTag].employee_function = tag.employee_function;
                            return numTag++;
                        });
                        updateContact.position["tags"] = uTags;
                    }
                    return Users.put(user._links.self.href, newData).then(function (res) {
                        if (res.status === 204) {
                            Users.put(_URL_users.list + '/' + user.position_data.id, updateContact).then(function (res) {
                                if (res.status === 204) {
                                    $scope.infoUpdated = 'Updated user ' + user.email + ' successfully!';
                                    $scope.users.items[i].enabled = newData.user.enabled;
                                    return $timeout(function () {
                                        return $scope.infoUpdated = null;
                                    }, 2000);
                                }
                            }, function (error) {
                                return $scope.infoUpdated = error.status + ' : Error updating, refresh & try again!';
                            });
                        }
                    }, function (error) {
                        $scope.infoUpdated = error.status + ': Error updating, refresh & try again!';
                        return $timeout(function () {
                            return $scope.infoUpdated = null;
                        }, 2000);
                    });
                };
                _getUsers($scope.numPerPage, $scope.currentPage);
            }
        ]).controller('UserCtrl', [
        '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', '$modal', 'UserService', 'Users', '$timeout', 'authHandler',
        function ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, UserService, Users, $timeout, authHandler) {
            var _URL, _getTags, _getUser, _searchUserbyEntry, _getHandbook;
            authHandler.checkLoggedIn();
            $scope.clientId = $routeParams.clientId;
            $scope.userId = $routeParams.userId ? $routeParams.userId.trim() : false;
            $scope.updateTags = {};
            if (!$scope.userId) {
                location.href = '#/clients/' + $scope.clientId;
                return;
            }
            _URL = {
                list: config.path.baseURL + config.path.users,
                detail: config.path.baseURL + config.path.contacts.replace(":org_id", $routeParams.clientId) + '/',
                handbooks: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/users/' + $scope.userId + '/cloud/books',
                tags: config.path.baseURL + '/tags',
                userGroup: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/usergroups'
            };
            _getUser = function () {
                return Users.get(_URL.detail + $scope.userId).then(function (pos) {
                    if (pos.status !== 200 || typeof pos !== 'object') {
                        return;
                    }
                    $scope.updateTags.position = {};
                    $scope.updateTags.position.title = pos.data.title;
                    $scope.updateTags.position.active = pos.data.active;
                    $scope.updateTags.position.employer = $scope.clientId;
                    $scope.updateTags.position.handbook_contact = pos.data.handbook_contact;
                    $scope.updateTags.position.email_address = pos.data.email_address;
                    $scope.updateTags.position.mobile_phone = pos.data.mobile_phone;
                    $scope.updateTags.position.office_phone = pos.data.office_phone;
                    $scope.updateTags.position.hr_admin = pos.data.hr_admin;
                    $scope.updateTags.position.enabled = pos.data.enabled;

                    return Users.get(pos.data._links.employee.href).then(function (res) {
                        if (res.status !== 200 || typeof res !== 'object') {
                            return;
                        }
                        $scope.user = res.data;
                        var arrRoles = Object.keys(res.data.roles).map(function (key) {
                            return res.data.roles[key]
                        });
                        console.log(arrRoles)
                        if (arrRoles.join().indexOf('ROLE_ADMIN') > -1) {
                            $scope.user.roles = 'ROLE_ADMIN';
                        } else if (arrRoles.join().indexOf('ROLE_HR_ADMIN') > -1) {
                            $scope.user.roles = 'ROLE_HR_ADMIN';
                        } else {
                            $scope.user.roles = 'ROLE_USER';
                        }
                        $scope.user.position_data = pos.data;
                        $scope.user.employee_class = [];
                        $scope.user.employee_function = [];

                        $scope.updateTags.position.employee = $scope.user.id;
                        if ($scope.user.birthday === "-0001-11-30T00:00:00+0655") {
                            $scope.user.birthday = "";
                        }
                        if ($scope.user.date_added === "-0001-11-30T00:00:00+0655") {
                            $scope.user.date_added = "";
                        } else {
                            $scope.user.date_added = $filter('date')(new Date($scope.user.date_added), 'MM/dd/yyyy');
                        }
                        Users.get(_URL.detail + $scope.userId + '/functions').then(function (tag) {
                            if (tag.data._embedded.items.length > 0) {
                                return $scope.user.employee_function = $filter('filter')(tag.data._embedded.items, {
                                    employee_function: true
                                });
                            }
                        }, function (error) {
                            return console.log(error);
                        });
                        Users.get(_URL.detail + $scope.userId + '/classes').then(function (tag) {
                            if (tag.data._embedded.items.length > 0) {
                                return $scope.user.employee_class = $filter('filter')(tag.data._embedded.items, {
                                    employee_class: true
                                });
                            }
                        }, function (error) {
                            return console.log(error);
                        });
                        var _urlHandbook;
                        if ($scope.user.roles == 'ROLE_USER') {
                            var isAdmin = false;
                            _urlHandbook = _URL.handbooks;
                            _getHandbook(_urlHandbook);
                            _getUserGroup($scope.user.id, isAdmin);
                        } else {
                            var isAdmin = true;
                            _urlHandbook = config.path.baseURL + '/organisations/' + $routeParams.clientId + '/handbooks';
                            _getHandbook(_urlHandbook);
                            _getUserGroup($scope.user.id, isAdmin)

                        }
                    }, function (error) {
                        return console.log(error);
                    });
                }, function (error) {
                    return console.log(error);
                });
            };

            _getHandbook = function (_urlHandbook) {
                Users.get(_urlHandbook).then(function (hbresults) {
                    if (hbresults.status !== 200 || typeof hbresults !== 'object') {
                        return;
                    }

                    var handbookAll = hbresults.data._embedded.items;

                    angular.forEach(handbookAll, function (handbook) {

                        handbook.locale = 'en_us';
                        Users.get(handbook._links.translations.href).then(function (res) {
                            if (res.status !== 200 || typeof res !== 'object') {
                                return;
                            }
                            handbook['translations'] = res.data;
                            if (handbook.translations['en_us']) {
                                handbook.title = handbook.translations['en_us'].title;
                            }
                        }, function (error) {
                            console.log(error);
                        });
                    });

                    $scope.handbooks = handbookAll;
                });
            };

            var _getUserGroup = function (userId, isAdmin) {
                Users.get(_URL.userGroup).then(function (results) {
                    if (results.status !== 200 || typeof results !== 'object') {
                        return;
                    }
                    if (isAdmin == true) {
                        $scope.groups = results.data._embedded.items;
                    } else {
                        $scope.groups = [];
                        angular.forEach(results.data._embedded.items, function (item) {
                            Users.get(item._links.users.href).then(function (result) {
                                if (result.status !== 200 || typeof result !== 'object') {
                                    return;
                                }
                                var res = result.data._embedded.items;
                                if (Array.isArray(res)) {
                                    // if(res.roles.join().indexOf('ROLE_ADMIN') == -1 && result.data.roles.join().indexOf('ROLE_HR_ADMIN') == -1 )
                                    // {
                                    angular.forEach(res, function (value) {
                                        if (value.id == userId) {
                                            $scope.groups.push(item)
                                        }
                                    });

                                    // }

                                }

                            })
                        });
                    }
                })

            };
            _getUserGroup();
            _searchUserbyEntry = function (entry, searchVal, callback) {
                var get_result;
                if (typeof callback !== 'function') {
                    return;
                }
                get_result = null;
                return Users.get(_URL.list + '?search=user.' + entry + ':' + searchVal).then(function (res) {
                    if (res.status === 200 && typeof res === 'object') {
                        get_result = res.data;
                        callback(get_result);
                    }
                    return get_result;
                }, function (error) {
                    callback(error);
                    return console.log(error);
                });
            };
            $scope.isDisable = true;
            $scope.updateUser = function () {
                var birthday, date_added, newData, numTag, user_code;
                angular.forEach($scope.frm_updateuser.$error.required, function (field) {
                    return field.$dirty = true;
                });

                // if ($scope.frm_updateuser.$error.required || $scope.frm_updateuser.$invalid) {
                //   return false;
                // }
                user_code = $scope.user.code;
                user_code = user_code.trim();
                user_code = user_code.toLowerCase();
                date_added = $scope.user.date_added;
                if (date_added === "") {
                    date_added = $filter('date')(new Date(), 'yyyy-MM-ddT00:00:00+0000');
                } else {
                    date_added = $filter('date')(new Date($scope.user.date_added), 'yyyy-MM-ddT00:00:00+0000');
                }
                var roles = [];
                if (Array.isArray($scope.user.roles)) {
                    roles.push($scope.user.roles.join());
                } else {
                    roles.push($scope.user.roles);
                }
                newData = {
                    "user": {
                        "roles": roles,
                        "first_name": $scope.user.first_name,
                        "last_name": $scope.user.last_name,
                        "username": $scope.user.username,
                        "email": $scope.user.email,
                        "plain_password": $scope.user.password,
                        "code": $scope.user.code,
                        "enabled": true,
                        "mobile_no": $scope.user.mobile_no || '',
                        "office_no": $scope.user.office_no || '',
                        "date_added": date_added,
                        "four_digit_pin": $scope.user.four_digit_pin || ''
                    }
                };
                var isHr = $scope.user.roles == 'ROLE_HR_ADMIN' ? true : false;
                $scope.updateTags.position = {
                    "title": $scope.user.first_name + ' ' + $scope.user.last_name,
                    "employee": $scope.user.id,
                    "enabled": $scope.updateTags.position.enabled,
                    "employer": $scope.clientId,
                    "handbook_contact": $scope.user.position_data.handbook_contact,
                    "email_address": $scope.user.position_data.email_address,
                    "mobile_phone": $scope.user.position_data.mobile_phone,
                    "office_phone": $scope.user.position_data.office_phone,
                    "hr_admin": isHr,
                };

                $scope.updateTags.position.employee_classes = {};
                $scope.updateTags.position.employee_functions = {};
                numTag = 1;
                angular.forEach($scope.user.employee_class, function (tag) {
                    var keyTag;
                    keyTag = "tag" + numTag;
                    $scope.updateTags.position.employee_classes[keyTag] = {};
                    $scope.updateTags.position.employee_classes[keyTag].name = tag.name;
                    $scope.updateTags.position.employee_classes[keyTag].enabled = true;
                    $scope.updateTags.position.employee_classes[keyTag].employee_class = 1;
                    $scope.updateTags.position.employee_classes[keyTag].employee_function = 0;
                    return numTag++;
                });
                angular.forEach($scope.user.employee_function, function (tag) {
                    var keyTag;
                    keyTag = "tag" + numTag;
                    $scope.updateTags.position.employee_functions[keyTag] = {};
                    $scope.updateTags.position.employee_functions[keyTag].name = tag.name;
                    $scope.updateTags.position.employee_functions[keyTag].enabled = true;
                    $scope.updateTags.position.employee_functions[keyTag].employee_class = 0;
                    $scope.updateTags.position.employee_functions[keyTag].employee_function = 1;
                    return numTag++;
                });
                birthday = $scope.user.birthday || '';
                if (birthday !== '') {
                    birthday = $filter('date')(new Date(birthday), 'yyyy-MM-ddT00:00:00+0000');
                    newData.user.birthday = birthday;
                }

                return Users.put(_URL.list + '/' + $scope.user.id, newData).then(function (res) {
                    if (res.status === 204) {
                        Users.put(_URL.detail + $scope.userId, $scope.updateTags).then(function (res) {
                            if (res.status === 204) {
                                $scope.infoUpdated = 'Updated user successfully!';
                                $timeout(function () {
                                    return $scope.infoUpdated = null;
                                }, 2000);
                            }
                        }, function (error) {
                            return $scope.infoUpdated = error.status + ': Error update tags, refresh & try again!';
                        });
                    }
                }, function (error) {
                    var checkError;
                    checkError = function (datajson) {
                        if (typeof datajson === 'object' && datajson._embedded.items.length) {
                            return $scope.infoUpdated = error.status + ': Verification code existed, refresh & try again!';
                        } else {
                            return $scope.infoUpdated = error.status + ': Error API, refresh & try again!';
                        }
                    };
                    return _searchUserbyEntry('code', newData.user.code, checkError);
                });
            };
            $scope.openDatepicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                return $scope.datepickerOpened = true;
            };
            $scope.tags = {};
            $scope.tags.employee_class = [];
            $scope.tags.employee_function = [];
            _getTags = function () {
                return Users.get(_URL.tags).then(function (res) {
                    if (res.status !== 200 || typeof res !== 'object') {
                        return;
                    }
                    angular.forEach(res.data._embedded.items, function (tag) {
                        if (tag.employee_class && tag.active) {
                            $scope.tags.employee_class.push(tag);
                        }
                        if (tag.employee_function && tag.active) {
                            return $scope.tags.employee_function.push(tag);
                        }
                    });
                }, function (error) {
                    return console.log(error);
                });
            };
            _getTags();
            $scope.tags.getEmployeeClass = function (query) {
                var deferred;
                deferred = $q.defer();
                deferred.resolve($scope.tags.employee_class);
                return deferred.promise;
            };
            $scope.tags.getEmployeeFunction = function (query) {
                var deferred;
                deferred = $q.defer();
                deferred.resolve($scope.tags.employee_function);
                return deferred.promise;
            };
            $scope.deleteUser = function () {
                var r;
                r = confirm("Do you want to delete this user \"" + $scope.user.email + "\"?");
                if (r === true) {
                    Users["delete"](config.path.baseURL + '/organisations/' + $scope.user.position_data.id + '/position').then(function (res) {
                        if (typeof res === 'object' && res.status === 204) {
                            $scope.infoUpdated = 'Deleted user successfully!';
                            $timeout(function () {
                                var clientId;
                                clientId = $routeParams.clientId;
                                return $location.path('/clients/' + clientId + '/user');
                            }, 300);
                        }
                    }, function (error) {
                        return $scope.infoUpdated = error.status + ': Error, refresh & try again !';
                    });
                }
            };
            if ($scope.userId !== 'new') {
                return _getUser();
            } else {

            }
        }
    ]).controller('NewUserCtrl', [
        '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', 'UserService', 'Users', '$timeout', 'ContactService', 'php', 'authHandler',
        function ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout, ContactService, php, authHandler) {
            var _URL, _getTags, _insertUser, _searchUserbyEntry;
            authHandler.checkLoggedIn();
            $scope.clientId = $routeParams.clientId;
            $scope.isExcel = false;
            $scope.user.handbook_contact = true;
            $scope.user.enabled = true;
            _URL = {
                detail: config.path.baseURL + config.path.users,
                tags: config.path.baseURL + '/tags'
            };
            _searchUserbyEntry = function (entry, searchVal, callback) {
                var get_result;
                if (typeof callback !== 'function') {
                    return;
                }
                get_result = null;
                return Users.get(_URL.detail + '?search=user.' + entry + ':' + searchVal).then(function (res) {
                    if (res.status === 200 && typeof res === 'object') {
                        get_result = res.data;
                        callback(get_result);
                    }
                    return get_result;
                }, function (error) {
                    callback(error);
                    return console.log(error);
                });
            };
            _insertUser = function (user) {
                var newData;
                newData = {
                    "user": user
                };
                return Users.post(_URL.detail, newData).then(function (res) {
                    if (typeof res === 'object' && res.status === 201) {
                        return Users.get(_URL.detail + '/' + user.email.trim()).then(function (res) {
                            var newContact, numTag;
                            $scope.infoUpdated = 'Created New';
                            if (res.status === 200 && typeof res === 'object') {
                                var isHr = res.data.roles[0] == 'ROLE_HR_ADMIN' ? true : false;
                                newContact = {
                                    "position": {
                                        "title": $scope.user.first_name + ' ' + $scope.user.last_name,
                                        "employee": res.data.id,
                                        "enabled": $scope.user.enabled,
                                        "employer": $scope.clientId,
                                        "handbook_contact": $scope.user.handbook_contact,
                                        "email_address": $scope.user.email,
                                        "mobile_phone": $scope.user.mobile_no || '',
                                        "office_phone": $scope.user.office_no || '',
                                        "hr_admin": isHr
                                    }
                                };
                                newContact.position.employee_classes = {};
                                newContact.position.employee_functions = {};
                                numTag = 1;

                                if($scope.isExcel === false){
                                    var employeeClass = $scope.user_tags.employee_class;
                                    var employeeFunction =$scope.user_tags.employee_function;
                                }else{
                                    var employeeClass = $scope.user_tags_excel[user.email].employee_class;
                                    var employeeFunction =$scope.user_tags_excel[user.email].employee_function;
                                }
                                if ($scope.user_tags != undefined || $scope.user_tags_excel) {
                                    angular.forEach(employeeClass, function (tag) {
                                        var keyTag;
                                        keyTag = "tag" + numTag;
                                        newContact.position.employee_classes[keyTag] = {};
                                        newContact.position.employee_classes[keyTag].name = tag.name;
                                        newContact.position.employee_classes[keyTag].enabled = true;
                                        newContact.position.employee_classes[keyTag].employee_class = 1;
                                        newContact.position.employee_classes[keyTag].employee_function = 0;
                                        return numTag++;
                                    });
                                }
                                if ($scope.user_tags != undefined || $scope.user_tags_excel) {
                                    angular.forEach(employeeFunction, function (tag) {
                                        var keyTag;
                                        keyTag = "tag" + numTag;
                                        newContact.position.employee_functions[keyTag] = {};
                                        newContact.position.employee_functions[keyTag].name = tag.name;
                                        newContact.position.employee_functions[keyTag].enabled = true;
                                        newContact.position.employee_functions[keyTag].employee_class = 0;
                                        newContact.position.employee_functions[keyTag].employee_function = 1;
                                        return numTag++;
                                    });
                                }
                                return ContactService.save({
                                    org_id: $scope.clientId
                                }, newContact, function (res) {
                                    if (typeof res === 'object' && res.code === 201) {
                                        // return $timeout(function() {
                                        return $location.path('/clients/' + $scope.clientId + '/user');
                                        // }, 500);
                                    }
                                });
                            }
                        }, function (error) {
                            console.log(error);
                            return alert('API error connection: Not yet create user for this client');
                        });
                    }
                }, function (error) {
                    var checkError;
                    checkError = function (datajson) {
                        if (typeof datajson === 'object' && datajson._embedded.items.length) {
                            return $scope.infoUpdated = error.status + ': Verification code existed, refresh & try again!';
                        } else if (error.data.errors.children.email) {

                            //-------------------------------------------------------------------------
                            return Users.get(_URL.detail + '/' + user.email.trim()).then(function (res) {
                                var newContact, numTag;
                                $scope.infoUpdated = 'Created New';
                                if (res.status === 200 && typeof res === 'object') {
                                    var isHr = res.data.roles[0] == 'ROLE_HR_ADMIN' ? true : false;
                                    newContact = {
                                        "position": {
                                            "title": $scope.user.first_name + ' ' + $scope.user.last_name,
                                            "employee": res.data.id,
                                            "enabled": $scope.user.enabled,
                                            "employer": $scope.clientId,
                                            "handbook_contact": $scope.user.handbook_contact,
                                            "email_address": $scope.user.email,
                                            "mobile_phone": $scope.user.mobile_no || '',
                                            "office_phone": $scope.user.office_no || '',
                                            "hr_admin": isHr
                                        }
                                    };
                                    newContact.position.employee_classes = {};
                                    newContact.position.employee_functions = {};
                                    numTag = 1;
                                    if($scope.isExcel === false){
                                        var employeeClass = $scope.user_tags.employee_class;
                                        var employeeFunction =$scope.user_tags.employee_function;
                                    }else{
                                        var employeeClass = $scope.user_tags_excel[user.email].employee_class;
                                        var employeeFunction =$scope.user_tags_excel[user.email].employee_function;
                                    }
                                    if ($scope.user_tags != undefined || $scope.user_tags_excel) {
                                        angular.forEach(employeeClass, function (tag) {
                                            var keyTag;
                                            keyTag = "tag" + numTag;
                                            newContact.position.employee_classes[keyTag] = {};
                                            newContact.position.employee_classes[keyTag].name = tag.name;
                                            newContact.position.employee_classes[keyTag].enabled = true;
                                            newContact.position.employee_classes[keyTag].employee_class = 1;
                                            newContact.position.employee_classes[keyTag].employee_function = 0;
                                            return numTag++;
                                        });
                                    }
                                    if ($scope.user_tags != undefined || $scope.user_tags_excel) {
                                        angular.forEach(employeeFunction, function (tag) {
                                            var keyTag;
                                            keyTag = "tag" + numTag;
                                            newContact.position.employee_functions[keyTag] = {};
                                            newContact.position.employee_functions[keyTag].name = tag.name;
                                            newContact.position.employee_functions[keyTag].enabled = true;
                                            newContact.position.employee_functions[keyTag].employee_class = 0;
                                            newContact.position.employee_functions[keyTag].employee_function = 1;
                                            return numTag++;
                                        });
                                    }
                                    return ContactService.save({
                                        org_id: $scope.clientId
                                    }, newContact, function (res) {
                                        if (typeof res === 'object' && res.code === 201) {
                                            return $timeout(function () {
                                                return $location.path('/clients/' + $scope.clientId + '/user');
                                            }, 500);
                                        }
                                    }, function (error) {
                                        return $scope.infoUpdated = error.status + ': Email is already used.';
                                    });
                                }
                            }, function (error) {
                                return alert('API error connection: Not yet create user for this client');
                            });
                            //---------------------------------------------------------------------------------------
                        } else {
                            return $scope.infoUpdated = error.status + ': Error API, refresh & try again!';
                        }
                    };
                    return _searchUserbyEntry('code', newData.user.code, checkError);
                });
            };
            $scope.openDatepicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                return $scope.datepickerOpened = true;
            };
            $scope.tags = {};
            $scope.tags.employee_class = [];
            $scope.tags.employee_function = [];
            _getTags = function () {
                return Users.get(_URL.tags).then(function (res) {
                    if (res.status !== 200 || typeof res !== 'object') {
                        return;
                    }
                    angular.forEach(res.data._embedded.items, function (tag) {
                        if (tag.employee_class && tag.active) {
                            $scope.tags.employee_class.push(tag);
                        }
                        if (tag.employee_function && tag.active) {
                            return $scope.tags.employee_function.push(tag);
                        }
                    });
                }, function (error) {
                    return console.log(error);
                });
            };
            _getTags();
            $scope.tags.getEmployeeClass = function (query) {
                var deferred;
                deferred = $q.defer();
                deferred.resolve($scope.tags.employee_class);
                return deferred.promise;
            };
            $scope.tags.getEmployeeFunction = function (query) {
                var deferred;
                deferred = $q.defer();
                deferred.resolve($scope.tags.employee_function);
                return deferred.promise;
            };
            $scope.submitCreateUser = function () {
                var birthday, user;
                angular.forEach($scope.frm_adduser.$error.required, function (field) {
                    return field.$dirty = true;
                });
                if ($scope.frm_adduser.$error.required) {
                    return false;
                }
                $scope.isExcel = false;

                var code = $scope.user.code == undefined || $scope.user.code == "" ? php.randomString(6, 'a#') : $scope.user.code;
                if (!$scope.user.roles) {
                    $scope.user.roles = 'ROLE_USER';
                }
                var roles = [];
                roles.push($scope.user.roles);
                user = {
                    "roles": roles,
                    "first_name": $scope.user.first_name,
                    "last_name": $scope.user.last_name,
                    "username": $scope.user.username,
                    "email": $scope.user.email,
                    "enabled": true,
                    "plain_password": $scope.user.password,
                    "ssn": null,
                    "code": code,
                    "mobile_no": $scope.user.mobile_no || '',
                    "office_no": $scope.user.office_no || '',
                    "date_added": $filter('date')(new Date(), 'yyyy-MM-ddT00:00:00+0000')
                };
                birthday = $scope.user.birthday || '';
                if (birthday !== '') {
                    birthday = $filter('date')(new Date(birthday), 'yyyy-MM-ddT00:00:00+0000');
                    user.birthday = birthday;
                }
                console.log(user);
                return _insertUser(user);
            };

            var trimObj = function (obj) {
                if (!Array.isArray(obj) && typeof obj != 'object') return obj;
                return Object.keys(obj).reduce(function (acc, key) {
                    acc[key.trim().split(" ").join("")] = typeof obj[key] == 'string' ? obj[key].trim() : trimObj(obj[key]);
                    return acc;
                }, Array.isArray(obj) ? [] : {});
            }

            $scope.user_tags_excel = {};
            return $scope.createUserExcel = function () {
                var birthday, insertUser, user;
                $scope.isExcel = true;
                var users = $scope.jsonResult.data.json.Sheet1;
                window.ux = users;
                angular.forEach(users, function (item) {
                    var user = trimObj(item);
                    if (user.UserName === void 0 || user.UserName === null || user.UserName === "") {
                        $scope.infoUpdated = "Missing username.";
                        return;
                    }
                    if (user.FirstName === void 0 || user.FirstName === null || user.FirstName === "") {
                        $scope.infoUpdated = "Missing first name.";
                        return;
                    }
                    if (user.Email === void 0 || user.Email === null || user.Email === "") {
                        $scope.infoUpdated = "Missing email.";
                        return;
                    }
                    if (user.Birthday === void 0 || user.Birthday === null || user.Birthday === "") {
                        $scope.infoUpdated = "Missing birthday.";
                        return;
                    }
                    if (user.LastName === void 0 || user.LastName === null || user.LastName === "") {
                        $scope.infoUpdated = "Missing last name.";
                        return;
                    }
                    insertUser = {
                        "first_name": user.FirstName,
                        "last_name": user.LastName,
                        "username": user.UserName,
                        "email": user.Email,
                        "enabled": true,
                        "plain_password": 'p@ssword',
                        "ssn": null,
                        "roles": ['ROLE_USER'],
                        "code": php.randomString(6, 'a#'),
                        "mobile_no": user.MobileNo || '',
                        "office_no": user.OfficeNo || '',
                        "date_added": $filter('date')(new Date(), 'yyyy-MM-ddT00:00:00+0000'),
                    };
                    birthday = user.Birthday || '';
                    if (birthday !== '') {
                        birthday = $filter('date')(new Date(birthday), 'yyyy-MM-ddT00:00:00+0000');
                        insertUser.birthday = birthday;
                    }
                    $scope.user_tags_excel[user.Email] ={'employee_class':[],'employee_function':[]};

                    if(user.EmployeeClass != undefined && user.EmployeeClass != null && user.EmployeeClass != ""){
                        var employeeClass ={'name':user.EmployeeClass};
                        $scope.user_tags_excel[user.Email].employee_class.push(employeeClass)
                    }
                    if(user.Function != undefined && user.Function != null && user.Function != ""){
                        var employeeFunction ={'name':user.Function};
                        $scope.user_tags_excel[user.Email].employee_function.push(employeeFunction)
                    }
                    $scope.user.email = user.Email;
                    $scope.user.mobile_no = user.MobileNo;
                    $scope.user.office_no = user.OfficeNo;
                    _insertUser(insertUser);
                })
            };
        }
    ]).controller('AccountCtrl', [
        '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', 'UserService', 'Users', '$timeout', 'ContactService', 'php', 'authHandler',
        function ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout, ContactService, php, authHandler) {
            var _URL, _getTags, _getUser, _searchUserbyEntry;
            authHandler.checkLoggedIn();
            $scope.clientId = $routeParams.clientId;
            $scope.userId = $routeParams.userId ? $routeParams.userId.trim() : false;
            $scope.updateTags = {};
            if (!$scope.userId) {
                location.href = '#/clients/' + $scope.clientId;
                return;
            }
            _URL = {
                list: config.path.baseURL + config.path.users,
                detail: config.path.baseURL + config.path.contacts.replace(":org_id", $routeParams.clientId) + '/',
                tags: config.path.baseURL + '/tags'
            };
            _getUser = function () {
                return Users.get(_URL.detail + $scope.userId).then(function (pos) {
                    if (pos.status !== 200 || typeof pos !== 'object') {
                        return;
                    }
                    $scope.updateTags.position = {};
                    $scope.updateTags.position.title = pos.data.title;
                    $scope.updateTags.position.active = pos.data.active;
                    $scope.updateTags.position.employer = $scope.clientId;
                    $scope.updateTags.position.handbook_contact = pos.data.handbook_contact;
                    $scope.updateTags.position.email_address = pos.data.email_address;
                    $scope.updateTags.position.mobile_phone = pos.data.mobile_phone;
                    $scope.updateTags.position.office_phone = pos.data.office_phone;
                    $scope.updateTags.position.hr_admin = pos.data.hr_admin;
                    $scope.updateTags.position.employee = pos.data.employee;
                    $scope.updateTags.position.enabled = pos.data.enabled;
                    $scope.updateTags.position.hr_admin = pos.data.hr_admin;
                    return Users.get(pos.data._links.employee.href).then(function (res) {
                        if (res.status !== 200 || typeof res !== 'object') {
                            return;
                        }
                        $scope.user = res.data;
                        $scope.user.roles = res.data.roles[0];
                        $scope.user.position_data = pos.data;
                        $scope.user.employee_class = [];
                        $scope.user.employee_function = [];

                        $scope.updateTags.position.employee = $scope.user.id;
                        if ($scope.user.birthday === "-0001-11-30T00:00:00+0655") {
                            $scope.user.birthday = "";
                        }
                        if ($scope.user.date_added === "-0001-11-30T00:00:00+0655") {
                            $scope.user.date_added = "";
                        } else {
                            $scope.user.date_added = $filter('date')(new Date($scope.user.date_added), 'MM/dd/yyyy');
                        }
                        Users.get(_URL.detail + $scope.userId + '/functions').then(function (tag) {
                            if (tag.data._embedded.items.length > 0) {
                                return $scope.user.employee_function = $filter('filter')(tag.data._embedded.items, {
                                    employee_function: true
                                });
                            }
                        }, function (error) {
                            return console.log(error);
                        });
                        Users.get(_URL.detail + $scope.userId + '/classes').then(function (tag) {
                            if (tag.data._embedded.items.length > 0) {
                                return $scope.user.employee_class = $filter('filter')(tag.data._embedded.items, {
                                    employee_class: true
                                });
                            }
                        }, function (error) {
                            return console.log(error);
                        });
                    }, function (error) {
                        return console.log(error);
                    });
                }, function (error) {
                    return console.log(error);
                });
            };
            _searchUserbyEntry = function (entry, searchVal, callback) {
                var get_result;
                if (typeof callback !== 'function') {
                    return;
                }
                get_result = null;
                return Users.get(_URL.list + '?search=user.' + entry + ':' + searchVal).then(function (res) {
                    if (res.status === 200 && typeof res === 'object') {
                        get_result = res.data;
                        callback(get_result);
                    }
                    return get_result;
                }, function (error) {
                    callback(error);
                    return console.log(error);
                });
            };
            $scope.isDisable = true;
            $scope.updateUser = function () {
                var birthday, date_added, newData, numTag, user_code;
                angular.forEach($scope.frm_updateuser.$error.required, function (field) {
                    return field.$dirty = true;
                });

                user_code = $scope.user.code;
                user_code = user_code.trim();
                user_code = user_code.toLowerCase();
                date_added = $scope.user.date_added;
                if (date_added === "") {
                    date_added = $filter('date')(new Date(), 'yyyy-MM-ddT00:00:00+0000');
                } else {
                    date_added = $filter('date')(new Date($scope.user.date_added), 'yyyy-MM-ddT00:00:00+0000');
                }
                var roles = [];
                roles.push($scope.user.roles);
                newData = {
                    "user": {
                        "roles": roles,
                        "first_name": $scope.user.first_name,
                        "last_name": $scope.user.last_name,
                        "username": $scope.user.username,
                        "email": $scope.user.email,
                        "plain_password": $scope.user.password,
                        "code": $scope.user.code,
                        "enabled": true,
                        "mobile_no": $scope.user.mobile_no || '',
                        "office_no": $scope.user.office_no || '',
                        "date_added": date_added,
                        "four_digit_pin": $scope.user.four_digit_pin || ''
                    }
                };
                $scope.updateTags.position = {
                    "title": $scope.user.first_name + ' ' + $scope.user.last_name,
                    "employee": $scope.user.id,
                    "enabled": $scope.updateTags.position.enabled,
                    "employer": $scope.clientId,
                    "handbook_contact": $scope.user.position_data.handbook_contact,
                    "email_address": $scope.updateTags.position.email_address,
                    "mobile_phone": $scope.user.position_data.mobile_phone,
                    "office_phone": $scope.user.position_data.office_phone,
                    "hr_admin": $scope.updateTags.position.hr_admin,
                };

                birthday = $scope.user.birthday || '';
                if (birthday !== '') {
                    birthday = $filter('date')(new Date(birthday), 'yyyy-MM-ddT00:00:00+0000');
                    newData.user.birthday = birthday;
                }

                return Users.put(_URL.list + '/' + $scope.user.id, newData).then(function (res) {
                    if (res.status === 204) {
                        Users.put(_URL.detail + $scope.userId, $scope.updateTags).then(function (res) {
                            if (res.status === 204) {
                                $scope.infoUpdated = 'Updated user successfully!';
                                $timeout(function () {
                                    return $scope.infoUpdated = null;
                                }, 2000);
                            }
                        }, function (error) {
                            return $scope.infoUpdated = error.status + ': Error update tags, refresh & try again!';
                        });
                    }
                }, function (error) {
                    var checkError;
                    checkError = function (datajson) {
                        if (typeof datajson === 'object' && datajson._embedded.items.length) {
                            return $scope.infoUpdated = error.status + ': Verification code existed, refresh & try again!';
                        } else {
                            return $scope.infoUpdated = error.status + ': Error API, refresh & try again!';
                        }
                    };
                    return _searchUserbyEntry('code', newData.user.code, checkError);
                });
            };
            $scope.openDatepicker = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                return $scope.datepickerOpened = true;
            };
            $scope.tags = {};
            $scope.tags.employee_class = [];
            $scope.tags.employee_function = [];
            _getTags = function () {
                return Users.get(_URL.tags).then(function (res) {
                    if (res.status !== 200 || typeof res !== 'object') {
                        return;
                    }
                    angular.forEach(res.data._embedded.items, function (tag) {
                        if (tag.employee_class && tag.active) {
                            $scope.tags.employee_class.push(tag);
                        }
                        if (tag.employee_function && tag.active) {
                            return $scope.tags.employee_function.push(tag);
                        }
                    });
                }, function (error) {
                    return console.log(error);
                });
            };
            _getTags();
            $scope.tags.getEmployeeClass = function (query) {
                var deferred;
                deferred = $q.defer();
                deferred.resolve($scope.tags.employee_class);
                return deferred.promise;
            };
            $scope.tags.getEmployeeFunction = function (query) {
                var deferred;
                deferred = $q.defer();
                deferred.resolve($scope.tags.employee_function);
                return deferred.promise;
            };
            $scope.deleteUser = function () {
                var r;
                r = confirm("Do you want to delete this user \"" + $scope.user.email + "\"?");
                if (r === true) {
                    Users["delete"](_URL.detail + $scope.user.id).then(function (res) {
                        if (typeof res === 'object' && res.status === 204) {
                            $scope.infoUpdated = 'Deleted user successfully!';
                            $timeout(function () {
                                var clientId;
                                clientId = $routeParams.clientId;
                                return $location.path('/clients/' + clientId + '/user');
                            }, 300);
                        }
                    }, function (error) {
                        return $scope.infoUpdated = error.status + ': Error, refresh & try again !';
                    });
                }
            };
            if ($scope.userId !== 'new') {
                return _getUser();
            } else {

            }
        }
    ]).controller('CategoryUserGroupCtrl', [
        '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', 'UserService', 'Users', '$timeout', 'hotRegisterer', 'authHandler',
        function ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout, hotRegisterer, authHandler) {
            authHandler.checkLoggedIn();
            $scope.data = [];
            $scope.minSpareRow = 0;

            $scope.colHeaders = [];
            $scope.colHeaders.push('Code');
            $scope.colHeaders.push('Folder Name');
            $scope.colHeaders.push('List Users')
            $scope.colHeaders.push('List Categories')

            $scope.columns = [];
            $scope.columns.push({readOnly: true});
            $scope.columns.push({});
            $scope.columns.push({renderer: "html"});
            $scope.columns.push({renderer: "html"});


            var _URL, getData;
            var cloudbookAceActions = [];
            var listCloudbookUrl = [];
            _URL = {
                Actions: config.path.baseURL + '/app/cloudbook/acl/category/acl/actions',
                Groups: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/usergroups',
            };

            getData = function () {
                Users.get(_URL.Actions).then(function (results) {
                    if (results.status !== 200 || typeof results !== 'object') {
                        return;
                    }
                    cloudbookAceActions = results.data;

                    Users.get(_URL.Groups).then(function (groupResults) {
                        if (groupResults.status !== 200 || typeof groupResults !== 'object') {
                            return;
                        }

                        var buildData = function (index) {
                            if (index < 0) {
                                $scope.minSpareRow = 1;
                                return;
                            }

                            var group = groupResults.data._embedded.items[index];

                            Users.get(group._links.category_user_group_aces.href).then(function (results) {
                                if (results.status !== 200 || typeof results !== 'object') {
                                    return;
                                }

                                var cloudbookAceGroup = [];
                                cloudbookAceGroup.push('G' + group.id);
                                cloudbookAceGroup.push(group.name);
                                cloudbookAceGroup.push('<a href="#/clients/' + $routeParams.clientId + '/user-group/' + group.id + '/users" title="Click to view users of this group">Click To View</a>');
                                cloudbookAceGroup.push('<a href="#/clients/' + $routeParams.clientId + '/user-group/' + group.id + '/categories" title="Click to view categories of this group">Click To View</a>');
                                if (results.data._embedded.items.length) {
                                    var listActionAllow = results.data._embedded.items[0].attributes;
                                    listCloudbookUrl[group.id] = group._links.category_user_group_aces.href + '/' + results.data._embedded.items[0].id;

                                    angular.forEach(cloudbookAceActions, function (action) {
                                        var permission = false;
                                        if (listActionAllow.indexOf(action) != -1) {
                                            permission = true;
                                        }
                                        cloudbookAceGroup.push(permission);
                                        if (index === 0) {
                                            $scope.colHeaders.push(action)
                                            $scope.columns.push({type: 'checkbox'});
                                        }
                                    });
                                    $scope.data.push(cloudbookAceGroup);
                                } else {
                                    angular.forEach(cloudbookAceActions, function (action) {
                                        var permission = false;
                                        cloudbookAceGroup.push(permission);
                                        if (index === 0) {
                                            $scope.colHeaders.push(action)
                                            $scope.columns.push({type: 'checkbox'});
                                        }
                                    });
                                    $scope.data.push(cloudbookAceGroup);
                                }

                                buildData(--index);

                            }, function (error) {
                                return console.log(error);
                            });
                        }
                        buildData(groupResults.data._embedded.items.length - 1);

                    }, function (error) {
                        return console.log(error);
                    });
                }, function (error) {
                    return console.log(error);
                });
            };
            getData();

            var getAttributes = function (item) {
                item.splice(0, 4);
                var attr = [];
                angular.forEach(cloudbookAceActions, function (action, index) {
                    if (item[index] === true) {
                        attr.push(action);
                    }
                });
                return attr.join(',');
            }
            $scope.infoUpdated = '';
            $scope.submit = function () {
                var dataSubmit = hotRegisterer.getInstance('my-handsontable').getData();
                angular.forEach(dataSubmit, function (item) {
                    if (item[0] === null) {
                        if (item[1] != null) {
                            //create group
                            var dataUserGroup = {
                                'user_group': {
                                    "name": item[1],
                                    "type": 1,
                                    "organisation": $routeParams.clientId
                                }
                            }
                            Users.post(_URL.Groups, dataUserGroup).then(function (results) {

                                if (typeof results === 'object' && results.status === 201) {
                                    var local = results.headers().location;
                                    var url = config.path.baseURL + local;
                                    //create handboookUserGroupAce
                                    Users.get(url).then(function (results) {
                                        if (results.status !== 200 || typeof results !== 'object') {
                                            return;
                                        }


                                        //ACE---------------------------------------------------------
                                        //handbookace
                                        var dataUserGroupAce = {
                                            'handbook_user_group_ace': {
                                                "userGroup": results.data.id,
                                                "attributes": "",
                                            }
                                        }
                                        Users.post(results.data._links.handbook_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                            if (typeof results === 'object' && results.status === 201) {
                                                $scope.infoUpdated = 'Updated Successfully.';
                                            } else {
                                                $scope.infoUpdated = 'Updated Fail.';
                                            }

                                        }, function (error) {
                                            return console.log(error);
                                        });
                                        //userace
                                        var dataUserGroupAce = {
                                            'user_user_group_ace': {
                                                "userGroup": results.data.id,
                                                "attributes": "",
                                            }
                                        }
                                        Users.post(results.data._links.user_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                            if (typeof results === 'object' && results.status === 201) {
                                                $scope.infoUpdated = 'Updated Successfully.';
                                            } else {
                                                $scope.infoUpdated = 'Updated Fail.';
                                            }

                                        }, function (error) {
                                            return console.log(error);
                                        });
                                        //usergroupace
                                        var dataUserGroupAce = {
                                            'user_group_user_group_ace': {
                                                "userGroup": results.data.id,
                                                "attributes": "",
                                            }
                                        }
                                        Users.post(results.data._links.user_group_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                            if (typeof results === 'object' && results.status === 201) {
                                                $scope.infoUpdated = 'Updated Successfully.';
                                            } else {
                                                $scope.infoUpdated = 'Updated Fail.';
                                            }

                                        }, function (error) {
                                            return console.log(error);
                                        });
                                        //categoryace
                                        var dataUserGroupAce = {
                                            'category_user_group_ace': {
                                                "userGroup": results.data.id,
                                                "attributes": getAttributes(item),
                                            }
                                        }
                                        Users.post(results.data._links.category_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                            if (typeof results === 'object' && results.status === 201) {
                                                $scope.infoUpdated = 'Updated Successfully.';
                                            } else {
                                                $scope.infoUpdated = 'Updated Fail.';
                                            }

                                        }, function (error) {
                                            return console.log(error);
                                        });
                                        //END ACE-----------------------------------------------------------

                                    });

                                } else {
                                    $scope.infoUpdated = 'Updated Fail.';
                                }


                            }, function (error) {
                                return console.log(error);
                            });


                        }
                    } else {
                        //Update Group
                        var dataUserGroup = {
                            'user_group': {
                                "name": item[1],
                                "type": 1,
                                "organisation": $routeParams.clientId
                            }
                        }
                        var userGroupId = item[0].substr(1);

                        Users.put(_URL.Groups + '/' + userGroupId, dataUserGroup).then(function (results) {
                            if (results.status === 204) {
                                //update handboookUserGroupAce
                                var dataUserGroupAce = {
                                    'category_user_group_ace': {
                                        "userGroup": userGroupId,
                                        "attributes": getAttributes(item),
                                    }
                                }
                                Users.put(listCloudbookUrl[userGroupId], dataUserGroupAce).then(function (results) {
                                    if (results.status === 204) {
                                        $scope.infoUpdated = 'Updated Successfully.';
                                    } else {
                                        $scope.infoUpdated = 'Updated Fail.';
                                    }

                                }, function (error) {
                                    return console.log(error);
                                });

                            } else {
                                $scope.infoUpdated = 'Updated Fail.';
                            }

                        }, function (error) {
                            return console.log(error);
                        });

                    }
                });
            }
        }
    ]).controller('HandbookUserGroupCtrl', [
        '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', 'UserService', 'Users', '$timeout', 'hotRegisterer', 'authHandler', '$uibModal', 'clientService',
        function ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout, hotRegisterer, authHandler, $uibModal, clientService) {
            authHandler.checkLoggedIn();
            $scope.data = [];
            $scope.minSpareRow = 0;
            $scope.clientId = $routeParams.clientId;

            $scope.colHeaders = [];
            $scope.colHeaders.push('Code');
            $scope.colHeaders.push('User Group Name');
            $scope.colHeaders.push('List Users')
            $scope.colHeaders.push('List Handbooks')

            $scope.columns = [];
            $scope.columns.push({readOnly: true});
            $scope.columns.push({});
            $scope.columns.push({renderer: "html"});
            $scope.columns.push({renderer: "html"});

            clientService.get({
                org_id: $scope.clientId,
            }, function (data, getResponseHeaders) {
                return $scope.clientDetail = data;
            });

            var _URL, getData;
            var cloudbookAceActions = [];
            var listCloudbookUrl = [];

            _URL = {
                Actions: config.path.baseURL + '/app/cloudbook/acl/cloudbook/acl/actions',
                Groups: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/usergroups',
            };

            $scope.deleteThisRow = function (row) {
                var id = parseInt(row.code.substring(1));
                if (id != 0) {
                    var deleteGroup = confirm('Are you sure you want to delete this group?');
                } else {
                    confirm('You can\'t delete default group');
                }

                if (deleteGroup) {
                    Users.delete(_URL.Groups + '/' + id).then(function (results) {
                        var index = $scope.gridOptions.data.indexOf(row);
                        $scope.gridOptions.data.splice(index, 1);
                    })
                }
            }
            $scope.open = function (size) {
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'myModalContent.html',
                    controller: 'ModalInstanceCtrl',
                    size: size
                });

                modalInstance.result.then(function (name) {
                    var dataUserGroup = {
                        'user_group': {
                            "name": name,
                            "type": 1,
                            "organisation": $routeParams.clientId
                        }
                    }
                    Users.post(_URL.Groups, dataUserGroup).then(function (results) {

                        if (typeof results === 'object' && results.status === 201) {
                            var local = results.headers().location;
                            var url = config.path.baseURL + local;


                            //create handboookUserGroupAce
                            Users.get(url).then(function (results) {
                                if (results.status !== 200 || typeof results !== 'object') {
                                    return;
                                }

                                $scope.gridOptions.data.push({
                                    "code": "G" + results.data.id,
                                    "userGroupName": name,
                                    "listUsers": '#/clients/' + $routeParams.clientId + '/user-group/' + results.data.id + '/users',
                                    "listHandbooks": '#/clients/' + $routeParams.clientId + '/user-group/' + results.data.id + '/handbooks'
                                });

                                //ACE---------------------------------------------------------
                                //handbookace
                                var dataUserGroupAce = {
                                    'handbook_user_group_ace': {
                                        "userGroup": results.data.id,
                                        "attributes": "VIEW",
                                    }
                                }
                                Users.post(results.data._links.handbook_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                    if (typeof results === 'object' && results.status === 201) {
                                        $scope.infoUpdated = 'Updated Successfully.';
                                    } else {
                                        $scope.infoUpdated = 'Updated Fail.';
                                    }

                                }, function (error) {
                                    return console.log(error);
                                });
                                //userace
                                // var dataUserGroupAce = {
                                //     'user_user_group_ace': {
                                //         "userGroup": results.data.id,
                                //         "attributes": "",
                                //     }
                                // }
                                // Users.post(results.data._links.user_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                //     if (typeof results === 'object' && results.status === 201) {
                                //         $scope.infoUpdated = 'Updated Successfully.';
                                //     } else {
                                //         $scope.infoUpdated = 'Updated Fail.';
                                //     }
                                //
                                // }, function (error) {
                                //     return console.log(error);
                                // });
                                // //usergroupace
                                // var dataUserGroupAce = {
                                //     'user_group_user_group_ace': {
                                //         "userGroup": results.data.id,
                                //         "attributes": "",
                                //     }
                                // }
                                // Users.post(results.data._links.user_group_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                //     if (typeof results === 'object' && results.status === 201) {
                                //         $scope.infoUpdated = 'Updated Successfully.';
                                //     } else {
                                //         $scope.infoUpdated = 'Updated Fail.';
                                //     }
                                //
                                // }, function (error) {
                                //     return console.log(error);
                                // });
                                // //categoryace
                                // var dataUserGroupAce = {
                                //     'category_user_group_ace': {
                                //         "userGroup": results.data.id,
                                //         "attributes": "",
                                //     }
                                // }
                                // Users.post(results.data._links.category_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                //     if (typeof results === 'object' && results.status === 201) {
                                //         $scope.infoUpdated = 'Updated Successfully.';
                                //     } else {
                                //         $scope.infoUpdated = 'Updated Fail.';
                                //     }
                                //
                                // }, function (error) {
                                //     return console.log(error);
                                // });
                                //END ACE-----------------------------------------------------------

                            });

                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }


                    }, function (error) {
                        return console.log(error);
                    });
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };

            $scope.rowFormatter = function (row) {
                return row.entity.code === 'G0';
            };

            var linkCellTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
                '  <a href="{{COL_FIELD}}">Click to view</a>' +
                '</div>';
            /**
             var checkboxCellTemplate = '<input type="checkbox" ng-model="row.entity.visibility" ng-click="toggle(row.entity.visibility)">';
             var checkboxViewCellTemplate = '<input type="checkbox" ng-model="row.entity.view" ng-click="toggle(row.entity.view)">';
             */
            var actionCellTemplate = '<div class="grid-action-cell">' + '<a ng-class="{ \'my-css-class\': grid.appScope.rowFormatter( row ) }" style="margin-left : 15px" ng-click="grid.appScope.deleteThisRow(row.entity)" href=""><span><i class="fa fa-trash-o"></i></span></a>' + '</div>'

            var actionCellTemplateDisabled = '<div class="grid-action-cell">' + '<a style="pointer-events: none; cursor: default; opacity: 0.6; margin-left : 15px" href=""><span><i class="fa fa-trash-o"></i></span></a>' + '</div>'

            var data = [{
                'code': 'G0',
                'userGroupName': 'Everyone',
                'listUsers': '#/clients/' + $routeParams.clientId + '/everyone',
                'listHandbooks': '#/clients/' + $routeParams.clientId + '/everyone/handbooks'
            }];
            getData = function () {
                Users.get(_URL.Actions).then(function (results) {
                    if (results.status !== 200 || typeof results !== 'object') {
                        return;
                    }
                    cloudbookAceActions = results.data;

                    Users.get(_URL.Groups).then(function (groupResults) {
                        if (groupResults.status !== 200 || typeof groupResults !== 'object') {
                            return;
                        }

                        var buildData = function (index) {
                            if (index < 0) {
                                $scope.minSpareRow = 1;
                                return;
                            }

                            var group = groupResults.data._embedded.items[index];

                            Users.get(group._links.handbook_user_group_aces.href).then(function (results) {
                                if (results.status !== 200 || typeof results !== 'object') {
                                    return;
                                }

                                var cloudbookAceGroup = {};
                                cloudbookAceGroup.code = 'G' + group.id;
                                cloudbookAceGroup.userGroupName = group.name;
                                cloudbookAceGroup.listUsers = '#/clients/' + $routeParams.clientId + '/user-group/' + group.id + '/users';
                                cloudbookAceGroup.listHandbooks = '#/clients/' + $routeParams.clientId + '/user-group/' + group.id + '/handbooks';

                                data.push(cloudbookAceGroup);
                                buildData(--index);

                            }, function (error) {
                                return console.log(error);
                            });
                        }
                        buildData(groupResults.data._embedded.items.length - 1);

                    }, function (error) {
                        return console.log(error);
                    });
                }, function (error) {
                    return console.log(error);
                });
            };
            getData();

            $scope.gridOptions = {
                enableSorting: true,
                columnDefs: [{
                    name: 'code',
                    displayName: 'Code',
                    enableCellEdit: false,
                    visible: false
                }, {
                    name: 'userGroupName',
                    displayName: 'User Group Name'
                }, {
                    name: 'listUsers',
                    displayName: 'List User',
                    enableCellEdit: false,
                    cellTemplate: linkCellTemplate
                }, {
                    name: 'listHandbooks',
                    displayName: 'List Handbook',
                    enableCellEdit: false,
                    cellTemplate: linkCellTemplate
                }, {
                    displayName: 'Actions',
                    name: 'action',
                    enableCellEdit: false,
                    cellTemplate: actionCellTemplate
                }],
                data: data
            };

            $scope.infoUpdated = '';
            //Submit Group
            $scope.submit = function () {
                var dataSubmit = $scope.gridOptions.data;
                angular.forEach(dataSubmit, function (item) {
                    //Update Group
                    var dataUserGroup = {
                        'user_group': {
                            "name": item.userGroupName,
                            "type": 1,
                            "organisation": $routeParams.clientId
                        }
                    }
                    var userGroupId = parseInt(item.code.substring(1));

                    Users.put(_URL.Groups + '/' + userGroupId, dataUserGroup).then(function (results) {
                        if (results.status === 204) {
                            //update handboookUserGroupAce
                            var dataUserGroupAce = {
                                'handbook_user_group_ace': {
                                    "userGroup": userGroupId,
                                    "attributes": 'VIEW',
                                }
                            }
                            Users.put(listCloudbookUrl[userGroupId], dataUserGroupAce).then(function (results) {
                                if (results.status === 204) {
                                    $scope.infoUpdated = 'Updated Successfully.';
                                } else {
                                    $scope.infoUpdated = 'Updated Fail.';
                                }

                            }, function (error) {
                                return console.log(error);
                            });

                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }

                    }, function (error) {
                        return console.log(error);
                    });
                });
            }
        }
    ]).controller('UserUserGroupCtrl', [
        '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', 'UserService', 'Users', '$timeout', 'hotRegisterer', 'authHandler', '$uibModal', 'clientService',
        function ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout, hotRegisterer, authHandler, $uibModal, clientService) {
            authHandler.checkLoggedIn();
            $scope.data = [];
            $scope.minSpareRow = 0;
            $scope.clientId = $routeParams.clientId;

            $scope.colHeaders = [];
            $scope.colHeaders.push('Code');
            $scope.colHeaders.push('User Group Name');
            $scope.colHeaders.push('List Users');

            $scope.columns = [];
            $scope.columns.push({readOnly: true});
            $scope.columns.push({});
            $scope.columns.push({renderer: "html"});


            clientService.get({
                org_id: $scope.clientId,
            }, function (data, getResponseHeaders) {
                return $scope.clientDetail = data;
            });

            var _URL, getData;
            var cloudbookAceActions = [];
            var listCloudbookUrl = [];
            _URL = {
                Actions: config.path.baseURL + '/app/cloudbook/acl/user/acl/actions',
                Groups: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/usergroups',
            };

            $scope.deleteThisRow = function (row) {
                var id = parseInt(row.code.substring(1));
                var deleteGroup = confirm('Are you sure you want to delete this group?');

                if (deleteGroup) {
                    Users.delete(_URL.Groups + '/' + id).then(function (results) {
                        var index = $scope.gridOptions.data.indexOf(row);
                        $scope.gridOptions.data.splice(index, 1);
                    })
                }
            }
            $scope.open = function (size) {
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'myModalContent.html',
                    controller: 'ModalInstanceCtrl',
                    size: size
                });

                modalInstance.result.then(function (name) {
                    var dataUserGroup = {
                        'user_group': {
                            "name": name,
                            "type": 1,
                            "organisation": $routeParams.clientId
                        }
                    }
                    Users.post(_URL.Groups, dataUserGroup).then(function (results) {

                        if (typeof results === 'object' && results.status === 201) {
                            var local = results.headers().location;
                            var url = config.path.baseURL + local;


                            //create handboookUserGroupAce
                            Users.get(url).then(function (results) {
                                if (results.status !== 200 || typeof results !== 'object') {
                                    return;
                                }

                                $scope.gridOptions.data.push({
                                    "code": "G" + results.data.id,
                                    "userGroupName": name,
                                    "listUsers": '#/clients/' + $routeParams.clientId + '/user-group/' + results.data.id + '/users',
                                    "listHandbooks": '#/clients/' + $routeParams.clientId + '/user-group/' + results.data.id + '/handbooks',
                                    "visibility": false
                                });

                                //ACE---------------------------------------------------------
                                //handbookace
                                var dataUserGroupAce = {
                                    'handbook_user_group_ace': {
                                        "userGroup": results.data.id,
                                        "attributes": "",
                                    }
                                }
                                Users.post(results.data._links.handbook_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                    if (typeof results === 'object' && results.status === 201) {
                                        $scope.infoUpdated = 'Updated Successfully.';
                                    } else {
                                        $scope.infoUpdated = 'Updated Fail.';
                                    }

                                }, function (error) {
                                    return console.log(error);
                                });
                                //userace
                                var dataUserGroupAce = {
                                    'user_user_group_ace': {
                                        "userGroup": results.data.id,
                                        "attributes": "",
                                    }
                                }
                                Users.post(results.data._links.user_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                    if (typeof results === 'object' && results.status === 201) {
                                        $scope.infoUpdated = 'Updated Successfully.';
                                    } else {
                                        $scope.infoUpdated = 'Updated Fail.';
                                    }

                                }, function (error) {
                                    return console.log(error);
                                });
                                //usergroupace
                                var dataUserGroupAce = {
                                    'user_group_user_group_ace': {
                                        "userGroup": results.data.id,
                                        "attributes": "",
                                    }
                                }
                                Users.post(results.data._links.user_group_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                    if (typeof results === 'object' && results.status === 201) {
                                        $scope.infoUpdated = 'Updated Successfully.';
                                    } else {
                                        $scope.infoUpdated = 'Updated Fail.';
                                    }

                                }, function (error) {
                                    return console.log(error);
                                });
                                //categoryace
                                var dataUserGroupAce = {
                                    'category_user_group_ace': {
                                        "userGroup": results.data.id,
                                        "attributes": "",
                                    }
                                }
                                Users.post(results.data._links.category_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                    if (typeof results === 'object' && results.status === 201) {
                                        $scope.infoUpdated = 'Updated Successfully.';
                                    } else {
                                        $scope.infoUpdated = 'Updated Fail.';
                                    }

                                }, function (error) {
                                    return console.log(error);
                                });
                                //END ACE-----------------------------------------------------------

                            });

                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }


                    }, function (error) {
                        return console.log(error);
                    });
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };


            //Update new grid
            var linkCellTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
                '  <a href="{{COL_FIELD}}">Click to view</a>' +
                '</div>';

            var actionCellTemplate = '<div class="grid-action-cell">' + '<a style="margin-left : 15px" ng-click="editRow(row.entity)" href=""><span><i class="fa fa-edit"></i></span></a>' + '<a style="margin-left : 15px" ng-click="grid.appScope.deleteThisRow(row.entity)" href=""><span><i class="fa fa-trash-o"></i></span></a>' + '</div>'
            var data = [];
            $scope.gridOptions = {
                enableSorting: true,
                columnDefs: [{
                    name: 'code',
                    displayName: 'Code',
                    enableCellEdit: false,
                }, {
                    name: 'userGroupName',
                    displayName: 'User Group Name'
                }, {
                    name: 'listUsers',
                    displayName: 'List Users',
                    enableCellEdit: false,
                    cellTemplate: linkCellTemplate
                }, {
                    displayName: 'Actions',
                    name: 'action',
                    enableCellEdit: false,
                    cellTemplate: actionCellTemplate
                }

                ],
                data: data
            };

            getData = function () {
                Users.get(_URL.Actions).then(function (results) {
                    if (results.status !== 200 || typeof results !== 'object') {
                        return;
                    }
                    cloudbookAceActions = results.data;

                    Users.get(_URL.Groups).then(function (groupResults) {
                        if (groupResults.status !== 200 || typeof groupResults !== 'object') {
                            return;
                        }

                        var buildData = function (index) {
                            if (index < 0) {
                                $scope.minSpareRow = 1;
                                return;
                            }

                            var group = groupResults.data._embedded.items[index];

                            Users.get(group._links.user_user_group_aces.href).then(function (results) {
                                if (results.status !== 200 || typeof results !== 'object') {
                                    return;
                                }
                                var cloudbookAceGroup = {};
                                cloudbookAceGroup.code = 'G' + group.id;
                                cloudbookAceGroup.userGroupName = group.name;
                                cloudbookAceGroup.listUsers = '#/clients/' + $routeParams.clientId + '/user-group/' + group.id + '/users';
                                data.push(cloudbookAceGroup);


                                buildData(--index);

                            }, function (error) {
                                return console.log(error);
                            });
                        }
                        buildData(groupResults.data._embedded.items.length - 1);

                    }, function (error) {
                        return console.log(error);
                    });
                }, function (error) {
                    return console.log(error);
                });
            };
            getData();

            var getAttributes = function (item) {
                item.splice(0, 3);
                var attr = [];
                angular.forEach(cloudbookAceActions, function (action, index) {
                    if (item[index] === true) {
                        attr.push(action);
                    }
                });
                return attr.join(',');
            }
            $scope.infoUpdated = '';

            var getAttributes = function (item) {
                // item.splice(0, 4);

                var attr = [];
                if (item.visibility == true) {
                    attr.push('VISIBILITY');
                }
                // angular.forEach(cloudbookAceActions, function (action, index) {
                //     if (item[index] === true) {
                //         attr.push(action);
                //     }
                // });

                return attr.join();
            }

            $scope.submit = function () {
                var dataSubmit = $scope.gridOptions.data;
                angular.forEach(dataSubmit, function (item) {
                    //Update Group
                    var dataUserGroup = {
                        'user_group': {
                            "name": item.userGroupName,
                            "type": 1,
                            "organisation": $routeParams.clientId
                        }
                    }
                    var userGroupId = parseInt(item.code.substring(1));

                    Users.put(_URL.Groups + '/' + userGroupId, dataUserGroup).then(function (results) {
                        if (results.status === 204) {
                            //update handboookUserGroupAce
                            var dataUserGroupAce = {
                                'handbook_user_group_ace': {
                                    "userGroup": userGroupId,
                                    "attributes": getAttributes(item),
                                }
                            }
                            Users.put(listCloudbookUrl[userGroupId], dataUserGroupAce).then(function (results) {
                                if (results.status === 204) {
                                    $scope.infoUpdated = 'Updated Successfully.';
                                } else {
                                    $scope.infoUpdated = 'Updated Fail.';
                                }

                            }, function (error) {
                                return console.log(error);
                            });

                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }

                    }, function (error) {
                        return console.log(error);
                    });
                });
            }
        }
    ]).controller('UserGroupUserGroupCtrl', [
        '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', 'UserService', 'Users', '$timeout', 'hotRegisterer', 'authHandler', '$uibModal', 'clientService',
        function ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout, hotRegisterer, authHandler, $uibModal, clientService) {
            authHandler.checkLoggedIn();
            $scope.data = [];
            $scope.minSpareRow = 0;
            $scope.clientId = $routeParams.clientId;

            $scope.colHeaders = [];
            $scope.colHeaders.push('Code');
            $scope.colHeaders.push('User Group Name');
            $scope.colHeaders.push('List Users');

            $scope.columns = [];
            $scope.columns.push({readOnly: true});
            $scope.columns.push({});
            $scope.columns.push({renderer: "html"});

            clientService.get({
                org_id: $scope.clientId,
            }, function (data, getResponseHeaders) {
                return $scope.clientDetail = data;
            });

            var _URL, getData;
            var cloudbookAceActions = [];
            var listCloudbookUrl = [];
            _URL = {
                Actions: config.path.baseURL + '/app/cloudbook/acl/user/group/acl/actions',
                Groups: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/usergroups',
            };

            $scope.deleteThisRow = function (row) {
                var id = parseInt(row.code.substring(1));
                var deleteGroup = confirm('Are you sure you want to delete this group?');

                if (deleteGroup) {
                    Users.delete(_URL.Groups + '/' + id).then(function (results) {
                        var index = $scope.gridOptions.data.indexOf(row);
                        $scope.gridOptions.data.splice(index, 1);
                    })
                }
            }
            $scope.open = function (size) {
                var modalInstance = $uibModal.open({
                    animation: $scope.animationsEnabled,
                    templateUrl: 'myModalContent.html',
                    controller: 'ModalInstanceCtrl',
                    size: size
                });

                modalInstance.result.then(function (name) {
                    var dataUserGroup = {
                        'user_group': {
                            "name": name,
                            "type": 1,
                            "organisation": $routeParams.clientId
                        }
                    }
                    Users.post(_URL.Groups, dataUserGroup).then(function (results) {

                        if (typeof results === 'object' && results.status === 201) {
                            var local = results.headers().location;
                            var url = config.path.baseURL + local;


                            //create handboookUserGroupAce
                            Users.get(url).then(function (results) {
                                if (results.status !== 200 || typeof results !== 'object') {
                                    return;
                                }

                                $scope.gridOptions.data.push({
                                    "code": "G" + results.data.id,
                                    "userGroupName": name,
                                    "listUsers": '#/clients/' + $routeParams.clientId + '/user-group/' + results.data.id + '/users',
                                    "listHandbooks": '#/clients/' + $routeParams.clientId + '/user-group/' + results.data.id + '/handbooks',
                                    "visibility": false
                                });

                                //ACE---------------------------------------------------------
                                //handbookace
                                var dataUserGroupAce = {
                                    'handbook_user_group_ace': {
                                        "userGroup": results.data.id,
                                        "attributes": "",
                                    }
                                }
                                Users.post(results.data._links.handbook_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                    if (typeof results === 'object' && results.status === 201) {
                                        $scope.infoUpdated = 'Updated Successfully.';
                                    } else {
                                        $scope.infoUpdated = 'Updated Fail.';
                                    }

                                }, function (error) {
                                    return console.log(error);
                                });
                                //userace
                                var dataUserGroupAce = {
                                    'user_user_group_ace': {
                                        "userGroup": results.data.id,
                                        "attributes": "",
                                    }
                                }
                                Users.post(results.data._links.user_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                    if (typeof results === 'object' && results.status === 201) {
                                        $scope.infoUpdated = 'Updated Successfully.';
                                    } else {
                                        $scope.infoUpdated = 'Updated Fail.';
                                    }

                                }, function (error) {
                                    return console.log(error);
                                });
                                //usergroupace
                                var dataUserGroupAce = {
                                    'user_group_user_group_ace': {
                                        "userGroup": results.data.id,
                                        "attributes": "",
                                    }
                                }
                                Users.post(results.data._links.user_group_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                    if (typeof results === 'object' && results.status === 201) {
                                        $scope.infoUpdated = 'Updated Successfully.';
                                    } else {
                                        $scope.infoUpdated = 'Updated Fail.';
                                    }

                                }, function (error) {
                                    return console.log(error);
                                });
                                //categoryace
                                var dataUserGroupAce = {
                                    'category_user_group_ace': {
                                        "userGroup": results.data.id,
                                        "attributes": "",
                                    }
                                }
                                Users.post(results.data._links.category_user_group_aces.href, dataUserGroupAce).then(function (results) {
                                    if (typeof results === 'object' && results.status === 201) {
                                        $scope.infoUpdated = 'Updated Successfully.';
                                    } else {
                                        $scope.infoUpdated = 'Updated Fail.';
                                    }

                                }, function (error) {
                                    return console.log(error);
                                });
                                //END ACE-----------------------------------------------------------

                            });

                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }


                    }, function (error) {
                        return console.log(error);
                    });
                }, function () {
                    $log.info('Modal dismissed at: ' + new Date());
                });
            };


            //Update new grid
            var linkCellTemplate = '<div class="ngCellText" ng-class="col.colIndex()">' +
                '  <a href="{{COL_FIELD}}">Click to view</a>' +
                '</div>';

            var actionCellTemplate = '<div class="grid-action-cell">' + '<a style="margin-left : 15px" ng-click="editRow(row.entity)" href=""><span><i class="fa fa-edit"></i></span></a>' + '<a style="margin-left : 15px" ng-click="grid.appScope.deleteThisRow(row.entity)" href=""><span><i class="fa fa-trash-o"></i></span></a>' + '</div>'
            var data = [];
            $scope.gridOptions = {
                enableSorting: true,
                columnDefs: [{
                    name: 'code',
                    displayName: 'Code',
                    enableCellEdit: false,
                }, {
                    name: 'userGroupName',
                    displayName: 'User Group Name'
                }, {
                    name: 'listUsers',
                    displayName: 'List User',
                    enableCellEdit: false,
                    cellTemplate: linkCellTemplate
                }, {
                    displayName: 'Actions',
                    name: 'action',
                    enableCellEdit: false,
                    cellTemplate: actionCellTemplate
                }

                ],
                data: data
            };

            getData = function () {
                Users.get(_URL.Actions).then(function (results) {
                    if (results.status !== 200 || typeof results !== 'object') {
                        return;
                    }
                    cloudbookAceActions = results.data;

                    Users.get(_URL.Groups).then(function (groupResults) {
                        if (groupResults.status !== 200 || typeof groupResults !== 'object') {
                            return;
                        }

                        var buildData = function (index) {
                            if (index < 0) {
                                $scope.minSpareRow = 1;
                                return;
                            }

                            var group = groupResults.data._embedded.items[index];

                            Users.get(group._links.user_user_group_aces.href).then(function (results) {
                                if (results.status !== 200 || typeof results !== 'object') {
                                    return;
                                }
                                var cloudbookAceGroup = {};
                                cloudbookAceGroup.code = 'G' + group.id;
                                cloudbookAceGroup.userGroupName = group.name;
                                cloudbookAceGroup.listUsers = '#/clients/' + $routeParams.clientId + '/user-group/' + group.id + '/users';
                                data.push(cloudbookAceGroup);


                                buildData(--index);

                            }, function (error) {
                                return console.log(error);
                            });
                        }
                        buildData(groupResults.data._embedded.items.length - 1);

                    }, function (error) {
                        return console.log(error);
                    });
                }, function (error) {
                    return console.log(error);
                });
            };
            getData();

            var getAttributes = function (item) {
                item.splice(0, 3);
                var attr = [];
                angular.forEach(cloudbookAceActions, function (action, index) {
                    if (item[index] === true) {
                        attr.push(action);
                    }
                });
                return attr.join(',');
            }
            $scope.infoUpdated = '';

            var getAttributes = function (item) {
                // item.splice(0, 4);

                var attr = [];
                if (item.visibility == true) {
                    attr.push('VISIBILITY');
                }
                // angular.forEach(cloudbookAceActions, function (action, index) {
                //     if (item[index] === true) {
                //         attr.push(action);
                //     }
                // });

                return attr.join();
            }

            $scope.submit = function () {
                var dataSubmit = $scope.gridOptions.data;
                angular.forEach(dataSubmit, function (item) {
                    //Update Group
                    var dataUserGroup = {
                        'user_group': {
                            "name": item.userGroupName,
                            "type": 1,
                            "organisation": $routeParams.clientId
                        }
                    }
                    var userGroupId = parseInt(item.code.substring(1));

                    Users.put(_URL.Groups + '/' + userGroupId, dataUserGroup).then(function (results) {
                        if (results.status === 204) {
                            //update handboookUserGroupAce
                            var dataUserGroupAce = {
                                'handbook_user_group_ace': {
                                    "userGroup": userGroupId,
                                    "attributes": getAttributes(item),
                                }
                            }
                            Users.put(listCloudbookUrl[userGroupId], dataUserGroupAce).then(function (results) {
                                if (results.status === 204) {
                                    $scope.infoUpdated = 'Updated Successfully.';
                                } else {
                                    $scope.infoUpdated = 'Updated Fail.';
                                }

                            }, function (error) {
                                return console.log(error);
                            });

                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }

                    }, function (error) {
                        return console.log(error);
                    });
                });
            }
        }
    ]).controller('UserByGroupCtrl', [
        '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', 'UserService', 'Users', '$timeout', 'hotRegisterer', 'authHandler',
        function ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout, hotRegisterer, authHandler) {
            authHandler.checkLoggedIn();
            var _URL = {
                users: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/positions',
                checkedUsers: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/usergroups/' + $routeParams.groupId,
                usersAutocomplete: config.path.baseURL + '/organisations/' + $routeParams.clientId
            };
            $scope.clientId = $routeParams.clientId;
            $scope.groupId = $routeParams.groupId;

            $scope.userSearch = [];
            $scope.userSearchObject = [];
            $scope.modelUser = '';
            $scope.allowAdd = false;

            $scope.sortType = 'first_name'; // set the default sort type
            $scope.sortReverse = false; // set the default sort order
            $scope.searchFish = ''; // set the default search/filter term

            $scope.userChange = function (user) {
                var id = user.id;
                if (user.inGroup == false) {
                    Users.delete(_URL.checkedUsers + '/users/' + id).then(function (results) {
                        if (results.status === 204) {
                            $scope.infoUpdated = 'Updated Successfully.';
                            loadList();
                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }
                    });
                } else if (user.inGroup == true) {
                    Users.post(_URL.checkedUsers + '/users/' + id, {}).then(function (results) {
                        if (results.status === 204) {
                            $scope.infoUpdated = 'Updated Successfully.';
                            $scope.users.push(user);
                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }
                    });
                }
            };
            $scope.searchUserKey = '';
            var loadList = function () {
                Users.get(_URL.checkedUsers).then(function (results) {
                    if (results.status !== 200 || typeof results !== 'object') {
                        return;
                    }
                    $scope.group = results.data;

                    Users.get(results.data._links.users.href).then(function (results) {
                        if (results.status !== 200 || typeof results !== 'object') {
                            return;
                        }
                        $scope.users = results.data._embedded.items;
                        var searchQuery = 'position.employee.firstName:%' + $scope.searchUserKey + '%';
                        var url = _URL.users + '?search=' + searchQuery;
                        Users.get(url).then(function (results) {
                            if (results.status !== 200 || typeof results !== 'object') {
                                return;
                            }

                            $scope.listUser = [];
                            angular.forEach(results.data._embedded.items, function (item) {
                                Users.get(item._links.employee.href).then(function (result) {
                                    if (result.status !== 200 || typeof result !== 'object') {
                                        return;
                                    }
                                    var res = result.data.roles;
                                    window.resdi = res;
                                    if (Array.isArray(res)) {
                                        if (result.data.roles.join().indexOf('ROLE_ADMIN') == -1 && result.data.roles.join().indexOf('ROLE_HR_ADMIN') == -1) {
                                            $scope.users.map(function (item) {
                                                if (item.id == result.data.id) {
                                                    result.data.inGroup = true;
                                                }
                                            });
                                            $scope.listUser.push(result.data);
                                        }

                                    }

                                })
                            })
                            window.uxo = $scope.listUser;
                        })
                    });

                });

            }
            loadList();
            $scope.searchUser = function () {
                loadList();
            }
        }
    ]).controller('EveryoneGroupController', [
        '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', 'UserService', 'Users', '$timeout', 'hotRegisterer', 'authHandler',
        function ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout, hotRegisterer, authHandler) {
            authHandler.checkLoggedIn();
            var _URL = {
                users: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/positions',
            };
            $scope.clientId = $routeParams.clientId;
            $scope.groupId = $routeParams.groupId;

            $scope.userSearch = [];
            $scope.userSearchObject = [];
            $scope.modelUser = '';
            $scope.allowAdd = false;

            $scope.searchUserKey = '';
            var loadList = function () {

                var searchQuery = 'position.employee.firstName:%' + $scope.searchUserKey + '%';
                var url = _URL.users + '?search=' + searchQuery;
                Users.get(url).then(function (results) {
                    if (results.status !== 200 || typeof results !== 'object') {
                        return;
                    }

                    $scope.listUser = [];
                    angular.forEach(results.data._embedded.items, function (item) {
                        Users.get(item._links.employee.href).then(function (result) {
                            if (result.status !== 200 || typeof result !== 'object') {
                                return;
                            }
                            var res = result.data.roles;
                            window.resdi = res;
                            if (Array.isArray(res)) {
                                if (result.data.roles.join().indexOf('ROLE_ADMIN') == -1 && result.data.roles.join().indexOf('ROLE_HR_ADMIN') == -1 && result.data.enabled == true) {
                                    result.data.inGroup = true;
                                    $scope.listUser.push(result.data);
                                }

                            }

                        })
                    })
                })

            }
            loadList();
            $scope.searchUser = function () {
                loadList();
            }
        }
    ]).controller('CategoryByGroupCtrl', [
        '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', 'UserService', 'Users', '$timeout', 'hotRegisterer', 'authHandler',
        function ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout, hotRegisterer, authHandler) {
            authHandler.checkLoggedIn();
            var _URL = {
                categoriesByGroup: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/usergroups/' + $routeParams.groupId,
                categories: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/categories',
                postCategoryToGroup: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/usergroups/' + $routeParams.groupId + '/categories',
            };

            $scope.catChange = function (category) {
                var id = category.id;
                if (category.inGroup == false) {
                    Users.delete(_URL.postCategoryToGroup + '/' + id).then(function (results) {
                        if (results.status === 204) {
                            $scope.infoUpdated = 'Updated Successfully.';
                            loadList();
                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }
                    });
                } else if (category.inGroup == true) {
                    Users.post(_URL.postCategoryToGroup + '/' + id, {}).then(function (results) {
                        if (results.status === 204) {
                            $scope.infoUpdated = 'Updated Successfully.';
                            $scope.categories.push(category);
                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }
                    });
                }
            };
            var loadList = function () {
                Users.get(_URL.categoriesByGroup).then(function (results) {
                    if (results.status !== 200 || typeof results !== 'object') {
                        return;
                    }
                    $scope.group = results.data;
                    Users.get(results.data._links.categories.href).then(function (results) {
                        if (results.status !== 200 || typeof results !== 'object') {
                            return;
                        }
                        $scope.categories = results.data._embedded.items;

                        Users.get(_URL.categories).then(function (results) {
                            if (results.status !== 200 || typeof results !== 'object') {
                                return;
                            }

                            var categoriesAll = results.data._embedded.items;


                            angular.forEach(categoriesAll, function (category) {
                                $scope.categories.map(function (item) {
                                    if (item.id == category.id) {
                                        category.inGroup = true;
                                    }
                                });
                            })

                            $scope.listCategory = categoriesAll;
                        })
                    });

                });

            }
            loadList();
        }
    ]).controller('HandbookByGroupCtrl', [
        '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', 'UserService', 'Users', '$timeout', 'hotRegisterer', 'authHandler',
        function ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout, hotRegisterer, authHandler) {
            authHandler.checkLoggedIn();
            var _URL = {
                handbooksByGroup: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/usergroups/' + $routeParams.groupId,
                handbooks: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/handbooks',
                postHandbookToGroup: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/usergroups/' + $routeParams.groupId + '/handbooks',
            };
            $scope.group = {};
            $scope.handbooks = [];
            $scope.clientId = $routeParams.clientId;
            $scope.handbookChange = function (handbook) {
                var id = handbook.id;
                if (handbook.inGroup == false) {
                    Users.delete(_URL.postHandbookToGroup + '/' + id).then(function (results) {
                        if (results.status === 204) {
                            $scope.infoUpdated = 'Updated Successfully.';
                            loadList();
                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }
                    });
                } else if (handbook.inGroup == true) {
                    Users.post(_URL.postHandbookToGroup + '/' + id, {}).then(function (results) {
                        if (results.status === 204) {
                            $scope.infoUpdated = 'Updated Successfully.';
                            $scope.handbooks.push(handbook);
                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }
                    });
                }
            };
            var loadList = function () {
                Users.get(_URL.handbooksByGroup).then(function (results) {
                    if (results.status !== 200 || typeof results !== 'object') {
                        return;
                    }
                    $scope.group = results.data;
                    Users.get(results.data._links.handbooks.href).then(function (results) {
                        if (results.status !== 200 || typeof results !== 'object') {
                            return;
                        }
                        $scope.handbooks = results.data._embedded.items;

                        Users.get(_URL.handbooks).then(function (results) {
                            if (results.status !== 200 || typeof results !== 'object') {
                                return;
                            }

                            var handbookAll = [];
                            angular.forEach(results.data._embedded.items, function (item) {
                                if (item.enabled == true) {
                                    handbookAll.push(item);
                                }
                            });

                            angular.forEach(handbookAll, function (handbook) {

                                $scope.handbooks.map(function (item) {
                                    if (item.id == handbook.id) {
                                        handbook.inGroup = true;
                                    }
                                });

                                handbook.locale = 'en_us';
                                return Users.get(handbook._links.translations.href).then(function (res) {
                                    if (res.status !== 200 || typeof res !== 'object') {
                                        return;
                                    }
                                    handbook['translations'] = res.data;
                                    if (handbook.translations['en_us']) {
                                        handbook.title = handbook.translations['en_us'].title;
                                    }
                                }, function (error) {
                                    console.log(error);
                                });

                            });

                            $scope.listHandbook = handbookAll;
                        })
                    });

                });

            }
            loadList();

        }
    ]).controller('PublicHandbookByGroupController', [
        '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', 'UserService', 'Users', '$timeout', 'hotRegisterer', 'authHandler',
        function ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout, hotRegisterer, authHandler) {
            authHandler.checkLoggedIn();
            var _URL = {
                handbooks: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/handbooks',
            };
            $scope.group = {};
            $scope.handbooks = [];
            $scope.clientId = $routeParams.clientId;
            $scope.handbookChange = function (handbook) {
                var id = handbook.id;
                if (handbook.inGroup == false) {
                    Users.delete(_URL.postHandbookToGroup + '/' + id).then(function (results) {
                        if (results.status === 204) {
                            $scope.infoUpdated = 'Updated Successfully.';
                            loadList();
                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }
                    });
                } else if (handbook.inGroup == true) {
                    Users.post(_URL.postHandbookToGroup + '/' + id, {}).then(function (results) {
                        if (results.status === 204) {
                            $scope.infoUpdated = 'Updated Successfully.';
                            $scope.handbooks.push(handbook);
                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }
                    });
                }
            };
            $scope.searchHandbookKey = '';
            var loadList = function () {
                var searchQuery = 'handbook.title:%' + $scope.searchHandbookKey + '%';
                var url = _URL.handbooks + '?search=' + searchQuery;
                // var url = _URL.handbooks;
                Users.get(url).then(function (results) {
                    if (results.status !== 200 || typeof results !== 'object') {
                        return;
                    }

                    var handbookAll = results.data._embedded.items;
                    var handbooks = [];
                    angular.forEach(handbookAll, function (handbook) {

                        if (handbook.enabled == true && handbook.public == true) {
                            handbook.inGroup = true;
                            handbook.locale = 'en_us';
                            handbooks.push(handbook);
                            Users.get(handbook._links.translations.href).then(function (res) {
                                if (res.status !== 200 || typeof res !== 'object') {
                                    return;
                                }
                                handbook['translations'] = res.data;
                                if (handbook.translations['en_us']) {
                                    handbook.title = handbook.translations['en_us'].title;
                                }
                            }, function (error) {
                                console.log(error);
                            });
                        }

                    });

                    $scope.listHandbook = handbooks;
                });
            }
            loadList();
            $scope.searchHandbook = function () {
                loadList();
            }

        }
    ]).controller('HandbookByUserCtrl', [
        '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', 'UserService', 'Users', '$timeout', 'hotRegisterer', 'authHandler',
        function ($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout, hotRegisterer, authHandler) {
            authHandler.checkLoggedIn();
            var _URL = {
                user: config.path.baseURL + '/users/' + $routeParams.userId,
                handbooks: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/users/' + $routeParams.userId + '/cloud/books',
                postHandbookToGroup: config.path.baseURL + '/organisations/' + $routeParams.clientId + '/users/' + $routeParams.userId + '/blockeds',
            };

            $scope.clientId = $routeParams.clientId;
            $scope.groupId = $routeParams.groupId;
            $scope.handbookChange = function (handbook) {
                var id = handbook.id;
                if (handbook.blocked == false) {
                    Users.delete(_URL.postHandbookToGroup + '/' + id + '/handbook').then(function (results) {
                        if (results.status === 204) {
                            $scope.infoUpdated = 'Updated Successfully.';
                            loadList();
                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }
                    });
                } else if (handbook.blocked == true) {
                    Users.post(_URL.postHandbookToGroup + '/' + id + '/handbooks', {}).then(function (results) {
                        if (results.status === 204) {
                            $scope.infoUpdated = 'Updated Successfully.';
                            $scope.handbooks.push(handbook);
                        } else {
                            $scope.infoUpdated = 'Updated Fail.';
                        }
                    });
                }
            };
            var loadList = function () {
                Users.get(_URL.user).then(function (results) {
                    if (results.status !== 200 || typeof results !== 'object') {
                        return;
                    }


                    $scope.group = results.data;
                    Users.get(_URL.handbooks).then(function (hbresults) {
                        if (hbresults.status !== 200 || typeof hbresults !== 'object') {
                            return;
                        }

                        var handbookAll = hbresults.data._embedded.items;

                        angular.forEach(handbookAll, function (handbook) {

                            handbook.locale = 'en_us';
                            Users.get(handbook._links.translations.href).then(function (res) {
                                if (res.status !== 200 || typeof res !== 'object') {
                                    return;
                                }
                                handbook['translations'] = res.data;
                                if (handbook.translations['en_us']) {
                                    handbook.title = handbook.translations['en_us'].title;
                                }
                            }, function (error) {
                                console.log(error);
                            });
                        });

                        $scope.handbooks = handbookAll;
                    });

                });

            }
            loadList();

        }

    ]).controller('ModalInstanceCtrl', function ($scope, $uibModalInstance) {

        $scope.name = '';
        $scope.ok = function () {
            $uibModalInstance.close($scope.name);
        };

        $scope.cancel = function () {
            $uibModalInstance.dismiss('cancel');
        };
    });

}).call(this);