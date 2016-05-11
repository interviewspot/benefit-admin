(function() {
  'use strict';
  angular.module('app.users', [])
      .controller('UsersCtrl', [
    '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', '$modal', 'UserService', 'Users', 'fetchContact', '$timeout', function($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, UserService, Users, fetchContact, $timeout) {
      var _URL_users, _getUsers, _updateUser;
      $scope.clientId = $routeParams.clientId;
      _URL_users = {
        list: config.path.baseURL + config.path.contacts.replace(":org_id", $routeParams.clientId)
      };
      $scope.getTime = function(ndate) {
        var dateAsDateObject;
        dateAsDateObject = new Date(Date.parse(ndate));
        return dateAsDateObject.getTime();
      };
      _getUsers = function(limit, goPage) {
        return fetchContact.get(_URL_users.list + '?limit=' + limit + '&page=' + goPage).then(function(res) {
          var i, item, _fn, _ref;
          console.log(_URL_users.list);
          if (res.data._embedded.items.length) {
            $scope.users = res.data;
            $scope.users.items = [];
            console.log($scope.users);
            _ref = res.data._embedded.items;
            _fn = function(itemInstance) {
              return Users.get(itemInstance._links.employee.href).then(function(res) {
                if (res.status !== 200 || typeof res !== 'object') {
                  return;
                }
                res.data.position_data = itemInstance;
                $scope.users.items.push(res.data);
                Users.get(_URL_users.list + '/' + itemInstance.id + '/classes').then(function(tag) {
                  var tag_lst;
                  if (tag.data._embedded.items.length > 0) {
                    tag_lst = [];
                    angular.forEach(tag.data._embedded.items, function(tag) {
                      if (tag.employee_class) {
                        return tag_lst.push(tag.name);
                      }
                    });
                    res.data.employee_class = tag_lst.join(', ');
                    return res.data.tags = tag.data._embedded.items;
                  }
                }, function(error) {
                  return console.log(error);
                });
              }, function(error) {
                return console.log(error);
              });
            };
            for (i in _ref) {
              item = _ref[i];
              _fn(item);
            }
          }
        });
      };
      $scope.numPerPageOpt = [3, 5, 10, 20];
      $scope.numPerPage = $scope.numPerPageOpt[2];
      $scope.currentPage = 1;
      $scope.filteredUsers = [];
      $scope.currentPageUsers = [];
      $scope.onNPPChange = function() {
        return _getUsers($scope.numPerPage, $scope.currentPage);
      };
      $scope.gotoPage = function(page) {
        return _getUsers($scope.numPerPage, $scope.currentPage);
      };
      $scope.removeUser = function(user) {
        var deleteUrl, r;
        r = confirm("Do you want to delete this user \"" + user.email + "\"?");
        if (r === true) {
          deleteUrl = config.path.baseURL + config.path.users + '/';
          Users["delete"](deleteUrl + user.id).then(function(res) {
            if (typeof res === 'object' && res.status === 204) {
              $timeout(function() {
                return location.reload();
              }, 300);
            }
          }, function(error) {
            return alert(error.status + ': Error, refresh & try again !');
          });
        }
      };
      $scope.enabUser = function(user, i) {
        var r;
        r = confirm("Do you want to change this user \"" + user.email + "\"?");
        console.log(user);
        if (r === true) {
          _updateUser(user, i);
        }
      };
      _updateUser = function(user, i) {
        var newData, numTag, uTags, updateContact;
        newData = {
          "user": {
            "first_name": user.first_name,
            "last_name": user.last_name,
            "username": user.username,
            "email": user.email,
            "code": user.code,
            "four_digit_pin": user.four_digit_pin || '',
            "mobile_no": user.mobile_no || '',
            "office_no": user.office_no || '',
            "enabled": !user.enabled,
            "date_added": $filter('date')(new Date(user.date_added), 'yyyy-MM-ddT00:00:00+0000')
          }
        };
        updateContact = {
          "position": {
            "employee": user.id,
            "enabled": !user.enabled,
            "employer": $scope.clientId,
            "handbook_contact": user.position_data.position_data
          }
        };
        if (user.tags) {
          uTags = {};
          numTag = 1;
          angular.forEach(user.tags, function(tag) {
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
        return Users.put(user._links.self.href, newData).then(function(res) {
          if (res.status === 204) {
            Users.put(_URL_users.list + '/' + user.position_data.id, updateContact).then(function(res) {
              if (res.status === 204) {
                $scope.infoUpdated = 'Updated user ' + user.email + ' successfully!';
                $scope.users.items[i].enabled = newData.user.enabled;
                return $timeout(function() {
                  return $scope.infoUpdated = null;
                }, 2000);
              }
            }, function(error) {
              return $scope.infoUpdated = error.status + ' : Error updating, refresh & try again!';
            });
          }
        }, function(error) {
          $scope.infoUpdated = error.status + ': Error updating, refresh & try again!';
          return $timeout(function() {
            return $scope.infoUpdated = null;
          }, 2000);
        });
      };
      _getUsers($scope.numPerPage, $scope.currentPage);
    }
  ]).controller('UserCtrl', [
    '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', '$modal', 'UserService', 'Users', '$timeout', function($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, UserService, Users, $timeout) {
      var _URL, _getTags, _getUser, _searchUserbyEntry;
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
      _getUser = function() {
        return Users.get(_URL.detail + $scope.userId).then(function(pos) {
          if (pos.status !== 200 || typeof pos !== 'object') {
            return;
          }
          $scope.updateTags.position = {};
          $scope.updateTags.position.title = pos.data.title;
          $scope.updateTags.position.active = pos.data.active;
          $scope.updateTags.position.employer = $scope.clientId;
          $scope.updateTags.position.handbook_contact = pos.data.handbook_contact;
          $scope.updateTags.position.enabled = pos.data.enabled;
          return Users.get(pos.data._links.employee.href).then(function(res) {
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
            Users.get(_URL.detail + $scope.userId + '/functions').then(function(tag) {
              if (tag.data._embedded.items.length > 0) {
                return $scope.user.employee_function = $filter('filter')(tag.data._embedded.items, {
                  employee_function: true
                });
              }
            }, function(error) {
              return console.log(error);
            });
            Users.get(_URL.detail + $scope.userId + '/classes').then(function(tag) {
              if (tag.data._embedded.items.length > 0) {
                return $scope.user.employee_class = $filter('filter')(tag.data._embedded.items, {
                  employee_class: true
                });
              }
            }, function(error) {
              return console.log(error);
            });
          }, function(error) {
            return console.log(error);
          });
        }, function(error) {
          return console.log(error);
        });
      };
      _searchUserbyEntry = function(entry, searchVal, callback) {
        var get_result;
        if (typeof callback !== 'function') {
          return;
        }
        get_result = null;
        return Users.get(_URL.list + '?search=user.' + entry + ':' + searchVal).then(function(res) {
          if (res.status === 200 && typeof res === 'object') {
            get_result = res.data;
            callback(get_result);
          }
          return get_result;
        }, function(error) {
          callback(error);
          return console.log(error);
        });
      };
      $scope.isDisable = true;
      $scope.updateUser = function() {
        var birthday, date_added, newData, numTag, user_code;
        angular.forEach($scope.frm_updateuser.$error.required, function(field) {
          return field.$dirty = true;
        });
        if ($scope.frm_updateuser.$error.required || $scope.frm_updateuser.$invalid) {
          return false;
        }
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
            "roles":roles,
            "first_name": $scope.user.first_name,
            "last_name": $scope.user.last_name,
            "username": $scope.user.username,
            "email": $scope.user.email,
            "code": $scope.user.code,
            "enabled": true,
            "mobile_no": $scope.user.mobile_no || '',
            "office_no": $scope.user.office_no || '',
            "date_added": date_added,
            "four_digit_pin": $scope.user.four_digit_pin || ''
          }
        };
        var isHr = $scope.user.roles=='ROLE_HR_ADMIN' ? true:false;
        $scope.updateTags.position = {
          "title": "Position of " + $scope.user.username,
          "employee": $scope.user.id,
          "enabled": $scope.updateTags.position.enabled,
          "employer": $scope.clientId,
          "handbook_contact": $scope.user.position_data.handbook_contact,
          "hr_admin":isHr
        };
        $scope.updateTags.position.employee_classes = {};
        $scope.updateTags.position.employee_functions = {};
        numTag = 1;
        angular.forEach($scope.user.employee_class, function(tag) {
          var keyTag;
          keyTag = "tag" + numTag;
          $scope.updateTags.position.employee_classes[keyTag] = {};
          $scope.updateTags.position.employee_classes[keyTag].name = tag.name;
          $scope.updateTags.position.employee_classes[keyTag].enabled = true;
          $scope.updateTags.position.employee_classes[keyTag].employee_class = 1;
          $scope.updateTags.position.employee_classes[keyTag].employee_function = 0;
          return numTag++;
        });
        angular.forEach($scope.user.employee_function, function(tag) {
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
        return Users.put(_URL.list + '/' + $scope.user.id, newData).then(function(res) {
          if (res.status === 204) {
            Users.put(_URL.detail + $scope.userId, $scope.updateTags).then(function(res) {
              if (res.status === 204) {
                $scope.infoUpdated = 'Updated user successfully!';
                $timeout(function() {
                  return $scope.infoUpdated = null;
                }, 2000);
              }
            }, function(error) {
              return $scope.infoUpdated = error.status + ': Error update tags, refresh & try again!';
            });
          }
        }, function(error) {
          var checkError;
          checkError = function(datajson) {
            if (typeof datajson === 'object' && datajson._embedded.items.length) {
              return $scope.infoUpdated = error.status + ': Verification code existed, refresh & try again!';
            } else {
              return $scope.infoUpdated = error.status + ': Error API, refresh & try again!';
            }
          };
          return _searchUserbyEntry('code', newData.user.code, checkError);
        });
      };
      $scope.openDatepicker = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        return $scope.datepickerOpened = true;
      };
      $scope.tags = {};
      $scope.tags.employee_class = [];
      $scope.tags.employee_function = [];
      _getTags = function() {
        return Users.get(_URL.tags).then(function(res) {
          if (res.status !== 200 || typeof res !== 'object') {
            return;
          }
          angular.forEach(res.data._embedded.items, function(tag) {
            if (tag.employee_class && tag.active) {
              $scope.tags.employee_class.push(tag);
            }
            if (tag.employee_function && tag.active) {
              return $scope.tags.employee_function.push(tag);
            }
          });
        }, function(error) {
          return console.log(error);
        });
      };
      _getTags();
      $scope.tags.getEmployeeClass = function(query) {
        var deferred;
        deferred = $q.defer();
        deferred.resolve($scope.tags.employee_class);
        return deferred.promise;
      };
      $scope.tags.getEmployeeFunction = function(query) {
        var deferred;
        deferred = $q.defer();
        deferred.resolve($scope.tags.employee_function);
        return deferred.promise;
      };
      $scope.deleteUser = function() {
        var r;
        r = confirm("Do you want to delete this user \"" + $scope.user.email + "\"?");
        if (r === true) {
          Users["delete"](_URL.detail + $scope.user.id).then(function(res) {
            if (typeof res === 'object' && res.status === 204) {
              $scope.infoUpdated = 'Deleted user successfully!';
              $timeout(function() {
                var clientId;
                clientId = $routeParams.clientId;
                return $location.path('/clients/' + clientId + '/user');
              }, 300);
            }
          }, function(error) {
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
    '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', 'UserService', 'Users', '$timeout', 'ContactService', 'php', function($scope, $filter, fetchTabData, $location, $routeParams, config, $q, UserService, Users, $timeout, ContactService, php) {
      var _URL, _getTags, _insertUser, _searchUserbyEntry;
      $scope.clientId = $routeParams.clientId;
      $scope.isExcel = false;
      $scope.user.handbook_contact = true;
      $scope.user.enabled = true;
      _URL = {
        detail: config.path.baseURL + config.path.users,
        tags: config.path.baseURL + '/tags'
      };
      _searchUserbyEntry = function(entry, searchVal, callback) {
        var get_result;
        if (typeof callback !== 'function') {
          return;
        }
        get_result = null;
        return Users.get(_URL.detail + '?search=user.' + entry + ':' + searchVal).then(function(res) {
          if (res.status === 200 && typeof res === 'object') {
            get_result = res.data;
            callback(get_result);
          }
          return get_result;
        }, function(error) {
          callback(error);
          return console.log(error);
        });
      };
      _insertUser = function(user) {
        var newData;
        newData = {
          "user": user
        };
        return Users.post(_URL.detail, newData).then(function(res) {
          if (typeof res === 'object' && res.status === 201) {
            return Users.get(_URL.detail + '/' + user.email.trim()).then(function(res) {
              var newContact, numTag;
              $scope.infoUpdated = 'Created New';
              if (res.status === 200 && typeof res === 'object') {
                var isHr = res.data.roles[0]=='ROLE_HR_ADMIN' ? true:false;
                newContact = {
                  "position": {
                    "title": "Position of " + user.username,
                    "employee": res.data.id,
                    "enabled": $scope.user.enabled,
                    "employer": $scope.clientId,
                    "handbook_contact": $scope.user.handbook_contact,
                    "email_address": $scope.user.email,
                    "mobile_phone": $scope.user.mobile_no || '',
                    "office_phone": $scope.user.office_no || '',
                    "hr_admin":isHr
                  }
                };
                newContact.position.employee_classes = {};
                newContact.position.employee_functions = {};
                numTag = 1;
                if($scope.user_tags != undefined) {
                  angular.forEach($scope.user_tags.employee_class, function (tag) {
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
                if($scope.user_tags != undefined) {
                  angular.forEach($scope.user_tags.employee_function, function (tag) {
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
                }, newContact, function(res) {
                  if (typeof res === 'object' && res.code === 201) {
                    // return $timeout(function() {
                      return $location.path('/clients/' + $scope.clientId + '/user');
                    // }, 500);
                  }
                });
              }
            }, function(error) {
              console.log(error);
              return alert('API error connection: Not yet create user for this client');
            });
          }
        }, function(error) {
          var checkError;
          checkError = function(datajson) {
            if (typeof datajson === 'object' && datajson._embedded.items.length) {
              return $scope.infoUpdated = error.status + ': Verification code existed, refresh & try again!';
            } else if (error.data.errors.children.email) {

              //-------------------------------------------------------------------------
              return Users.get(_URL.detail + '/' + user.email.trim()).then(function(res) {
                var newContact, numTag;
                $scope.infoUpdated = 'Created New';
                if (res.status === 200 && typeof res === 'object') {
                  var isHr = res.data.roles[0]=='ROLE_HR_ADMIN' ? true:false;
                  newContact = {
                    "position": {
                      "title": "Position of " + user.username,
                      "employee": res.data.id,
                      "enabled": $scope.user.enabled,
                      "employer": $scope.clientId,
                      "handbook_contact": $scope.user.handbook_contact,
                      "email_address": $scope.user.email,
                      "mobile_phone": $scope.user.mobile_no || '',
                      "office_phone": $scope.user.office_no || '',
                      "hr_admin":isHr 
                    }
                  };
                  newContact.position.employee_classes = {};
                  newContact.position.employee_functions = {};
                  numTag = 1;
                  if($scope.user_tags != undefined) {
                    angular.forEach($scope.user_tags.employee_class, function (tag) {
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
                  if($scope.user_tags != undefined) {
                    angular.forEach($scope.user_tags.employee_function, function (tag) {
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
                  }, newContact, function(res) {
                    if (typeof res === 'object' && res.code === 201) {
                      return $timeout(function() {
                        return $location.path('/clients/' + $scope.clientId + '/user');
                      }, 500);
                    }
                  },function(error){
                    return $scope.infoUpdated = error.status + ': Email is already used.';
                  });
                }
              }, function(error) {
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
      $scope.openDatepicker = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        return $scope.datepickerOpened = true;
      };
      $scope.tags = {};
      $scope.tags.employee_class = [];
      $scope.tags.employee_function = [];
      _getTags = function() {
        return Users.get(_URL.tags).then(function(res) {
          if (res.status !== 200 || typeof res !== 'object') {
            return;
          }
          angular.forEach(res.data._embedded.items, function(tag) {
            if (tag.employee_class && tag.active) {
              $scope.tags.employee_class.push(tag);
            }
            if (tag.employee_function && tag.active) {
              return $scope.tags.employee_function.push(tag);
            }
          });
        }, function(error) {
          return console.log(error);
        });
      };
      _getTags();
      $scope.tags.getEmployeeClass = function(query) {
        var deferred;
        deferred = $q.defer();
        deferred.resolve($scope.tags.employee_class);
        return deferred.promise;
      };
      $scope.tags.getEmployeeFunction = function(query) {
        var deferred;
        deferred = $q.defer();
        deferred.resolve($scope.tags.employee_function);
        return deferred.promise;
      };
      $scope.submitCreateUser = function() {
        var birthday, user;
        angular.forEach($scope.frm_adduser.$error.required, function(field) {
          return field.$dirty = true;
        });
        if ($scope.frm_adduser.$error.required) {
          return false;
        }
        $scope.isExcel = false;

        var code = $scope.user.code == undefined || $scope.user.code == ""  ? php.randomString(6, 'a#') : $scope.user.code;
        var roles = [];
        roles.push($scope.user.roles);
        user = {
          "roles":roles,
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
      return $scope.createUserExcel = function() {
        var birthday, insertUser, user;
        $scope.isExcel = true;
        user = $scope.jsonResult.data.json;
        if (user.username === void 0 || user.username === null || user.username === "") {
          $scope.infoUpdated = "Missing username.";
          return;
        }
        if (user.first_name === void 0 || user.first_name === null || user.first_name === "") {
          $scope.infoUpdated = "Missing first_name.";
          return;
        }
        if (user.email === void 0 || user.email === null || user.email === "") {
          $scope.infoUpdated = "Missing email.";
          return;
        }
        if (user.plain_password === void 0 || user.plain_password === null || user.plain_password === "") {
          $scope.infoUpdated = "Missing password.";
          return;
        }
        if (user.birthday === void 0 || user.birthday === null || user.birthday === "") {
          $scope.infoUpdated = "Missing birthday.";
          return;
        }
        insertUser = {
          "first_name": user.first_name,
          "last_name": user.last_name,
          "username": user.username,
          "email": user.email,
          "enabled": true,
          "plain_password": user.plain_password,
          "ssn": null,
          "code": php.randomString(6, 'a#'),
          "mobile_no": user.mobile_no || '',
          "office_no": user.office_no || '',
          "date_added": $filter('date')(new Date(), 'yyyy-MM-ddT00:00:00+0000')
        };
        birthday = user.birthday || '';
        if (birthday !== '') {
          birthday = $filter('date')(new Date(birthday), 'yyyy-MM-ddT00:00:00+0000');
          insertUser.birthday = birthday;
        }
        return _insertUser(insertUser);
      };
    }
  ]);

}).call(this);
