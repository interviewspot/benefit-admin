(function() {
  'use strict';
  angular.module('app.contacts', []).controller('ContactCtrl', [
    '$scope', '$filter', 'fetchTabData', 'fakeData', '$location', '$routeParams', 'ContactService', 'fetchContact', 'SearchUsers', 'fetchUsers', 'config', '$q', '$modal', 'authHandler', function($scope, $filter, fetchTabData, fakeData, $location, $routeParams, ContactService, fetchContact, SearchUsers, fetchUsers, config, $q, $modal, authHandler) {
      var _URL;
      _URL = {
        list: config.path.baseURL + config.path.contacts.replace(":org_id", $routeParams.clientId) + '?search=position.handbookContact:1,position.enabled:1'
      };
      authHandler.checkLoggedIn();
      $scope.loadContactList = function() {
        return fetchContact.get(_URL.list).then(function(res) {
          console.log(_URL.list);
          if (res.data._embedded.items.length) {
            $scope.contacts = [];
            angular.forEach(res.data._embedded.items, function(item, i) {
              $scope.contacts[i] = {};
              return (function(itemInstance) {
                return fetchContact.get(itemInstance._links.employee.href).then(function(res) {
                  $scope.contacts[i]['position'] = itemInstance;
                  $scope.contacts[i]['user'] = res.data;
                  $scope.contacts[i]['alphabet'] = res.data.first_name ? res.data.first_name.charAt(0).toLowerCase() : res.data.username.charAt(0).toLowerCase();
                  console.log($scope.contacts[i]['position']);
                  return fetchContact.get(itemInstance._links.tags.href).then(function(res) {
                    return $scope.contacts[i]['tags'] = res.data;
                  });
                });
              })(item);
            });
          }
        });
      };
      if ($routeParams.clientId) {
        $scope.loadContactList();
      }
      $scope.contact = {
        email: '',
        title: ''
      };
      $scope.srch_users = {
        'email': 0
      };
      $scope.searchMail = function(term) {
        var d, q, results;
        d = $q.defer();
        q = term.toLowerCase().trim();
        results = {};
        fetchUsers.get(config.path.baseURL + config.path.users + '?search=user.email:%' + q + '%').then(function(res) {
          var i, item, users, _i, _ref;
          if (res.data._embedded) {
            $scope.srch_users = {};
            users = res.data._embedded.items;
            for (i = _i = 0, _ref = users.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
              item = users[i];
              results[item.email] = item.id;
            }
            $scope.srch_users = results;
            return d.resolve(results);
          } else {

          }
        }, function() {
          return d.resolve(results);
        });
        return d.promise;
      };
      $scope.selectedUser = null;
      $scope.createContact = function() {
        var newContact;
        angular.forEach($scope.frm_contact.$error.required, function(field) {
          return field.$dirty = true;
        });
        if ($scope.frm_contact.$error.required) {
          return false;
        }
        newContact = {
          "position": {
            "title": $scope.contact.title,
            "employee": $scope.srch_users[$scope.contact.email],
            "enabled": true,
            "employer": $routeParams.clientId,
            "handbook_contact": true
          }
        };
        return ContactService.save({
          org_id: $routeParams.clientId
        }, newContact, function(res) {
          return $scope.loadContactList();
        });
      };
      $scope.editContact = function(contact) {
        var modalInstance;
        $scope.editcontact = contact;
        return modalInstance = $modal.open({
          templateUrl: 'views/handbooks/contact_form.html',
          controller: 'ContactFormCtrl',
          resolve: {
            contact: function() {
              return contact;
            }
          },
          scope: $scope
        });
      };
      $scope.deleteContact = function(contact) {
        var r;
        r = confirm("Do you want to delete \"" + contact.position.title + "\"?");
        if (r === true) {
          return fetchContact["delete"](contact.position._links.self.href).then(function(res) {
            return $scope.loadContactList();
          });
        }
      };
      $scope.totalSelected = 0;
      $scope.contactSelect = function() {
        var i, item, _ref, _results;
        $scope.totalSelected = 0;
        _ref = $scope.contacts;
        _results = [];
        for (i in _ref) {
          item = _ref[i];
          if (item.checked === true) {
            _results.push($scope.totalSelected++);
          } else {
            _results.push(void 0);
          }
        }
        return _results;
      };
      $scope.deleteSelectedContacts = function() {
        var count, i, item, r, _ref, _results;
        r = confirm("Do you want to delete all selected contacts ?");
        count = 0;
        if (r === true) {
          _ref = $scope.contacts;
          _results = [];
          for (i in _ref) {
            item = _ref[i];
            if (item.checked === true) {
              _results.push(fetchContact["delete"](item.position._links.self.href).then(function(res) {
                count++;
                if (count === $scope.totalSelected) {
                  return $scope.loadContactList();
                }
              }));
            } else {
              _results.push(void 0);
            }
          }
          return _results;
        }
      };
    }
  ]).controller('ContactFormCtrl', [
    '$scope', '$routeParams', 'fetchContact', 'config', '$modalInstance', 'fetchUsers', '$q', 'contact', 'authHandler', function($scope, $routeParams, fetchContact, config, $modalInstance, fetchUsers, $q, contact, authHandler) {
      authHandler.checkLoggedIn();
      $scope.contact = contact;
      $scope.srch_users = {
        'email': 0
      };
      $scope.searchMail = function(term) {
        var d, q, results;
        d = $q.defer();
        q = term.toLowerCase().trim();
        results = {};
        fetchUsers.get(config.path.baseURL + config.path.users + '?search=user.email:%' + q + '%').then(function(res) {
          var i, item, users, _i, _ref;
          if (res.data._embedded) {
            $scope.srch_users = {};
            users = res.data._embedded.items;
            for (i = _i = 0, _ref = users.length; 0 <= _ref ? _i < _ref : _i > _ref; i = 0 <= _ref ? ++_i : --_i) {
              item = users[i];
              results[item.email] = item.id;
            }
            $scope.srch_users = results;
            return d.resolve(results);
          } else {

          }
        }, function() {
          return d.resolve(results);
        });
        return d.promise;
      };
      $scope.save = function() {
        var updateContact;
        console.log($scope.srch_users);
        updateContact = {
          "position": {
            "title": contact.position.title,
            "employee": $scope.srch_users[$scope.contact.user.email],
            "enabled": true,
            "employer": $routeParams.clientId,
            "handbook_contact": true
          }
        };
        return fetchContact.update(contact.position._links.self.href, updateContact).then(function(res) {
          $scope.loadContactList();
          return $modalInstance.close();
        }, function(error) {
          return alert(error.status + ' : Wrong email! Try again.');
        });
      };
      return $scope.cancel = function() {
        return $modalInstance.dismiss('cancel');
      };
    }
  ]).directive('keyboardPoster', function($parse, $timeout) {
    var DELAY_TIME_BEFORE_POSTING;
    DELAY_TIME_BEFORE_POSTING = 1000;
    return function(scope, elem, attrs) {
      var currentTimeout, element;
      element = angular.element(elem)[0];
      currentTimeout = null;
      element.oninput = function() {
        var model, poster;
        model = $parse(attrs.postFunction);
        poster = model(scope);
        if (currentTimeout) {
          $timeout.cancel(currentTimeout);
        }
        currentTimeout = $timeout(function() {
          poster(angular.element(element).val());
        }, DELAY_TIME_BEFORE_POSTING);
      };
    };
  });

}).call(this);
