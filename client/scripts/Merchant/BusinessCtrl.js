(function() {
  'use strict';
  angular.module('app.businesses', []).controller('BusinessesCtrl', [
    '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', '$modal', 'Businesses', 'fetchContact', '$timeout', 'authHandler', function($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, Businesses, fetchContact, $timeout, authHandler) {
      var _URL_businesses, _getBusinesses;
      authHandler.checkLoggedIn();
      $scope.clientId = $routeParams.clientId;
      _URL_businesses = {
        list: config.path.baseURL + config.path.businesses.replace(":org_id", $routeParams.clientId),
        post: config.path.baseURL + '/businesses'
      };
      $scope.getTime = function(ndate) {
        var dateAsDateObject;
        dateAsDateObject = new Date(Date.parse(ndate));
        return dateAsDateObject.getTime();
      };
      _getBusinesses = function(limit, goPage) {
        return Businesses.get(_URL_businesses.list + '?limit=' + limit + '&page=' + goPage).then(function(res) {
          if (res.data._embedded.items.length) {
            $scope.businesses = res.data;
          }
        });
      };
      $scope.numPerPageOpt = [3, 5, 10, 20];
      $scope.numPerPage = $scope.numPerPageOpt[2];
      $scope.currentPage = 1;
      $scope.filteredUsers = [];
      $scope.currentPageUsers = [];
      $scope.onNPPChange = function() {
        return _getBusinesses($scope.numPerPage, $scope.currentPage);
      };
      $scope.gotoPage = function(page) {
        return _getBusinesses($scope.numPerPage, $scope.currentPage);
      };
      $scope.removeBusiness = function(business) {
        var deleteUrl, r;
        r = confirm("Do you want to delete this user \"" + business.name + "\"?");
        if (r === true) {
          deleteUrl = _URL_businesses.post + '/';
          Businesses["delete"](deleteUrl + business.id).then(function(res) {
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
      $scope.submitNewBusiness = function() {
        var new_data;
        angular.forEach($scope.frm_create_business.$error.required, function(field) {
          return field.$dirty = true;
        });
        if ($scope.frm_create_business.$error.required || !$scope.frm_create_business.$valid) {
          return false;
        }
        new_data = {
          business: {
            name: $scope.bus.name,
            merchant_code: $scope.bus.merchant_code,
            owner: $scope.clientId
          }
        };
        Businesses.post(_URL_businesses.post, new_data).then(function(res) {
          if (typeof res === 'object' && res.status === 201) {
            $timeout(function() {
              return location.reload();
            }, 300);
          }
        }, function(error) {
          return alert(error.status + ' : Try later and new company code');
        });
      };
      _getBusinesses($scope.numPerPage, $scope.currentPage);
    }
  ]).controller('BusinessCtrl', [
    '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', '$modal', 'Businesses', '$timeout', 'authHandler', function($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, Businesses, $timeout, authHandler) {
      var _URL, _getBusiness, _getTags, _getTypes;
      $scope.clientId = $routeParams.clientId;
      $scope.businessId = $routeParams.businessId ? $routeParams.businessId.trim() : false;
      if (!$scope.businessId) {
        location.href = '#/merchant/' + $scope.clientId + '/business';
        return;
      }
      authHandler.checkLoggedIn();
      _URL = {
        detail: config.path.baseURL + '/businesses/' + $scope.businessId,
        post_promotions: config.path.baseURL + '/promotions',
        types: config.path.baseURL + '/promotion/types',
        tags: config.path.baseURL + '/tags'
      };
      _getBusiness = function() {
        return Businesses.get(_URL.detail).then(function(bus) {
          if (bus.status !== 200 || typeof bus !== 'object') {
            return;
          }
          $scope.business = bus.data;
          if (bus.data._links.promotions) {
            Businesses.get(bus.data._links.promotions.href).then(function(pro) {
              if (pro.status !== 200 || typeof pro !== 'object') {
                return;
              }
              return $scope.business.promotions = pro.data;
            }, function(error) {
              return console.log(error);
            });
          }
          if (bus.data._links.outlets) {
            Businesses.get(bus.data._links.outlets.href).then(function(res) {
              if (res.status !== 200 || typeof res !== 'object') {
                return;
              }
              return $scope.business.outlets = res.data;
            }, function(error) {
              return console.log(error);
            });
          }
          if (bus.data._links.types) {
            Businesses.get(bus.data._links.types.href).then(function(types) {
              if (types.data._embedded.items.length > 0) {
                return $scope.business.types = types.data._embedded.items;
              } else {
                return $scope.business.types = [];
              }
            }, function(error) {
              return console.log(error);
            });
          }
          if (bus.data._links.types) {
            return Businesses.get(bus.data._links.tags.href).then(function(tags) {
              if (tags.data._embedded.items.length > 0) {
                return $scope.business.tags = tags.data._embedded.items;
              } else {
                return $scope.business.tags = [];
              }
            }, function(error) {
              return console.log(error);
            });
          }
        }, function(error) {
          return console.log(error);
        });
      };
      $scope.tags = {};
      $scope.tags.business_type = [];
      $scope.tags.business_category = [];
      _getTags = function() {
        return Businesses.get(_URL.tags).then(function(res) {
          if (res.status !== 200 || typeof res !== 'object') {
            return;
          }
          angular.forEach(res.data._embedded.items, function(tag) {
            if (tag.business_type && tag.enabled) {
              $scope.tags.business_type.push(tag);
            }
            if (tag.business_category && tag.enabled) {
              return $scope.tags.business_category.push(tag);
            }
          });
        }, function(error) {
          return console.log(error);
        });
      };
      _getTags();
      $scope.tags.getBusinessType = function(query) {
        var deferred;
        deferred = $q.defer();
        deferred.resolve($scope.tags.business_type);
        return deferred.promise;
      };
      $scope.tags.getBusinessCategory = function(query) {
        var deferred;
        deferred = $q.defer();
        deferred.resolve($scope.tags.business_category);
        return deferred.promise;
      };
      $scope.isDisable = true;
      $scope.updateBusiness = function() {
        var new_data, numTag, numType;
        angular.forEach($scope.frm_update_business.$error.required, function(field) {
          return field.$dirty = true;
        });
        if ($scope.frm_update_business.$error.required || !$scope.frm_update_business.$valid) {
          return false;
        }
        new_data = {
          business: {
            name: $scope.business.name,
            merchant_code: $scope.business.merchant_code,
            owner: $scope.clientId,
            enabled: true
          }
        };
        numType = 1;
        new_data.business.types = {};
        angular.forEach($scope.business.types, function(tag) {
          var keyType;
          keyType = "types" + numType;
          new_data.business.types[keyType] = {};
          new_data.business.types[keyType].name = tag.name;
          new_data.business.types[keyType].enabled = true;
          new_data.business.types[keyType].business_type = 1;
          new_data.business.types[keyType].business_category = 0;
          return numType++;
        });
        numTag = 1;
        new_data.business.tags = {};
        angular.forEach($scope.business.tags, function(tag) {
          var keyTag;
          keyTag = "tag" + numTag;
          new_data.business.tags[keyTag] = {};
          new_data.business.tags[keyTag].name = tag.name;
          new_data.business.tags[keyTag].enabled = true;
          new_data.business.tags[keyTag].business_type = 0;
          new_data.business.tags[keyTag].business_category = 1;
          return numTag++;
        });
        console.log(new_data);
        Businesses.put(_URL.detail, new_data).then(function(res) {
          if (typeof res === 'object' && res.status === 204) {
            return $scope.infoUpdated = "Update Successfully!";
          }
        }, function(error) {
          return alert(error.status + ' : Error, refresh & try again !');
        });
      };
      $scope.deleteBusiness = function() {
        var r;
        r = confirm("Do you want to delete this business \"" + $scope.business.name + "\"?");
        if (r === true) {
          Businesses["delete"](_URL.detail).then(function(res) {
            if (typeof res === 'object' && res.status === 204) {
              $scope.infoUpdated = 'Deleted business successfully!';
              $timeout(function() {
                var clientId;
                clientId = $routeParams.clientId;
                return $location.path('/merchant/' + clientId + '/business');
              }, 300);
            }
          }, function(error) {
            return $scope.infoUpdated = error.status + ': Error, refresh & try again !';
          });
        }
      };
      $scope.submitNewOutlet = function() {
        var new_data;
        angular.forEach($scope.frm_create_outlet.$error.required, function(field) {
          return field.$dirty = true;
        });
        if ($scope.frm_create_outlet.$error.required || !$scope.frm_create_outlet.$valid) {
          return false;
        }
        new_data = {
          outlet: {
            name: $scope.out.name,
            contact_no: $scope.out.contact_no,
            business: $scope.businessId
          }
        };
        Businesses.post($scope.business._links.self.href + '/outlets', new_data).then(function(res) {
          if (typeof res === 'object' && res.status === 201) {
            $timeout(function() {
              return location.reload();
            }, 300);
          }
        }, function(error) {
          return alert(error.status + ' : Try again later');
        });
      };
      $scope.removeOutlet = function(outlet) {
        var r;
        r = confirm("Do you want to delete this outlet \"" + outlet.name + "\"?");
        if (r === true) {
          Businesses["delete"](outlet._links.self.href).then(function(res) {
            if (typeof res === 'object' && res.status === 204) {
              $timeout(function() {
                return window.location.reload();
              }, 300);
            }
          }, function(error) {
            return alert(error.status + ': Error, refresh & try again !');
          });
        }
      };
      $scope.submitNewPromotion = function() {
        var effective_from, expire_on, new_data;
        angular.forEach($scope.frm_create_promotion.$error.required, function(field) {
          return field.$dirty = true;
        });
        if ($scope.frm_create_promotion.$error.required || !$scope.frm_create_promotion.$valid) {
          return false;
        }
        new_data = {
          promotion: {
            title: $scope.promotion.title,
            estimated_value: $scope.promotion.estimated_value,
            discount_amount: $scope.promotion.discount_amount || 0,
            offer_limit: $scope.promotion.offer_limit || 0,
            weekly_limit: $scope.promotion.weekly_limit || 0,
            monthly_limit: $scope.promotion.monthly_limit || 0,
            yearly_limit: $scope.promotion.yearly_limit || 0,
            organisation_limit: $scope.promotion.organisation_limit || 0,
            user_limit: $scope.promotion.user_limit,
            enabled: $scope.promotion.enabled,
            type: $scope.promotion.type,
            business: $scope.businessId,
            every_outlet_included: true
          }
        };
        effective_from = $scope.promotion.effective_from || '';
        if (effective_from !== '') {
          effective_from = $filter('date')(new Date(effective_from), 'yyyy-MM-ddT00:00:00+0000');
          new_data.promotion.effective_from = effective_from;
        }
        expire_on = $scope.promotion.expire_on || '';
        if (expire_on !== '') {
          expire_on = $filter('date')(new Date(expire_on), 'yyyy-MM-ddT00:00:00+0000');
          new_data.promotion.expire_on = expire_on;
        }
        Businesses.post(_URL.post_promotions, new_data).then(function(res) {
          if (typeof res === 'object' && res.status === 201) {
            $timeout(function() {
              return location.reload();
            }, 300);
          }
        }, function(error) {
          return alert(error.status + ' : Try again later');
        });
      };
      $scope.openStartDatepicker = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        return $scope.datepickerStartOpened = true;
      };
      $scope.openEndDatepicker = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        return $scope.datepickerEndOpened = true;
      };
      _getTypes = function() {
        return Businesses.get(_URL.types).then(function(res) {
          if (res.status !== 200 || typeof res !== 'object') {
            return;
          }
          if (res.data._embedded.items.length > 0) {
            return $scope.promotionTypes = res.data._embedded.items;
          } else {
            return $scope.promotionTypes = [];
          }
        }, function(error) {
          return console.log(error);
        });
      };
      _getTypes();
      $scope.removePromotion = function(promotion) {
        var r;
        r = confirm("Do you want to delete this promotion \"" + promotion.title + "\"?");
        if (r === true) {
          Businesses["delete"](promotion._links.self.href).then(function(res) {
            if (typeof res === 'object' && res.status === 204) {
              $timeout(function() {
                return window.location.reload();
              }, 300);
            }
          }, function(error) {
            return alert(error.status + ': Error, refresh & try again !');
          });
        }
      };
      return _getBusiness();
    }
  ]).controller('OutletCtrl', [
    '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', '$modal', 'Businesses', '$timeout', 'authHandler', function($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, Businesses, $timeout, authHandler) {
      var _URL, _getOutlet, _post_address, _post_location, _put_address;
      $scope.clientId = $routeParams.clientId;
      $scope.businessId = $routeParams.businessId ? $routeParams.businessId.trim() : false;
      $scope.outletId = $routeParams.outletId ? $routeParams.outletId.trim() : false;
      if (!$scope.businessId) {
        location.href = '#/merchant/' + $scope.clientId + '/business';
        return;
      }
      if (!$scope.outletId) {
        location.href = '#/merchant/' + $scope.clientId + '/business/' + $scope.businessId;
        return;
      }
      authHandler.checkLoggedIn();
      _URL = {
        detail: config.path.baseURL + '/businesses/' + $scope.businessId + '/outlets/' + $scope.outletId,
        address_post: config.path.baseURL + '/addresses'
      };
      _getOutlet = function() {
        return Businesses.get(_URL.detail).then(function(out) {
          if (out.status !== 200 || typeof out !== 'object') {
            return;
          }
          $scope.outlet = out.data;
          $scope.outlet.address_text = "";
          if (out.data._links.location) {
            return Businesses.get(out.data._links.location.href).then(function(loc) {
              if (loc.status !== 200 || typeof loc !== 'object') {
                return;
              }
              $scope.outlet.location = loc.data;
              console.log(loc.data);
              $scope.outlet.location_latlng = loc.data.geo_lat + " , " + loc.data.geo_lng;
              if (loc.data._links.addresses) {
                Businesses.get(loc.data._links.addresses.href).then(function(add) {
                  if (add.status !== 200 || typeof add !== 'object') {
                    return;
                  }
                  $scope.outlet.location.address = add.data._embedded.items[0];
                  return $scope.outlet.address_text = add.data._embedded.items[0].value;
                }, function(error) {
                  return console.log(error);
                });
              }
              return console.log($scope.outlet);
            }, function(error) {
              return console.log(error);
            });
          }
        }, function(error) {
          return console.log(error);
        });
      };
      $scope.isDisable = true;
      $scope.updateOutlet = function() {
        var new_data, new_location;
        angular.forEach($scope.frm_update_outlet.$error.required, function(field) {
          return field.$dirty = true;
        });
        if ($scope.frm_update_outlet.$error.required || !$scope.frm_update_outlet.$valid) {
          return false;
        }
        console.log($scope.resultmap);
        new_data = {
          outlet: {
            name: $scope.outlet.name,
            contact_no: $scope.outlet.contact_no
          }
        };
        $scope.send_data = new_data;
        if ($scope.outlet.location) {
          new_data = {
            outlet: {
              name: $scope.outlet.name,
              contact_no: $scope.outlet.contact_no,
              business: $scope.businessId,
              location: $scope.outlet.location.id
            }
          };
          new_location = {
            location: {
              name: $scope.outlet.location.name,
              geo_lat: $scope.resultmap.lat,
              geo_lng: $scope.resultmap.long,
              enabled: 1
            }
          };
          console.log(new_location);
          Businesses.put(_URL.detail, new_data).then(function(res) {
            if (typeof res === 'object' && res.status === 204) {
              if (new_location) {
                return Businesses.put($scope.outlet.location._links.self.href, new_location).then(function(loc) {
                  if (typeof loc === 'object' && loc.status === 204) {
                    if ($scope.outlet.location._links.addresses) {
                      _put_address($scope.outlet.location, $scope.outlet.location.address);
                    } else {
                      _post_address($scope.outlet.location.id, $scope.outlet.address_text);
                    }
                    return $scope.infoUpdated = "Update Successfully!";
                  }
                });
              } else {
                return $scope.infoUpdated = "Update Successfully!";
              }
            }
          }, function(error) {
            return alert(error.status + ' : Error, refresh & try again !');
          });
        } else {
          new_location = {
            location: {
              name: $scope.outlet.address_text,
              geo_lat: $scope.resultmap.lat,
              geo_lng: $scope.resultmap.long,
              enabled: 1
            }
          };
          return $q.all([_post_location(new_location, $scope.outlet)]).then(function(data) {
            new_data = {
              outlet: {
                name: $scope.outlet.name,
                contact_no: $scope.outlet.contact_no,
                business: $scope.businessId,
                location: data[0]
              }
            };
            _post_address(data[0], $scope.outlet.address_text);
            return Businesses.put(_URL.detail, new_data).then(function(res) {
              if (typeof res === 'object' && res.status === 204) {
                return $scope.infoUpdated = "Update Successfully!";
              }
            }, function(error) {
              return alert(error.status + ' : Error, refresh & try again !');
            });
          });
        }
      };
      _post_location = function(location, outlet) {
        var deferred;
        deferred = $q.defer();
        if (outlet._links['location.post']) {
          Businesses.post(outlet._links['location.post'].href, location).then(function(loc) {
            var location_id;
            if (typeof loc === 'object' && loc.status === 201) {
              location_id = loc.headers().location.split('/')[2];
              return deferred.resolve(location_id);
            }
          }, function(error) {
            return alert(error.status + ' : Cannot create location!');
          });
        }
        return deferred.promise;
      };
      _post_address = function(location_id, value) {
        var new_address;
        new_address = {
          address: {
            value: value,
            location: location_id
          }
        };
        console.log(new_address);
        if (location_id) {
          return Businesses.post(_URL.address_post, new_address).then(function(add) {}, function(error) {
            return alert(error.status + ' : Cannot create address !');
          });
        }
      };
      _put_address = function(location, address) {
        var new_address;
        new_address = {
          address: {
            value: $scope.outlet.address_text,
            location: location.id
          }
        };
        console.log(new_address);
        if (address._links.self) {
          return Businesses.put(address._links.self.href, new_address).then(function(add) {}, function(error) {
            return alert(error.status + ' : Cannot update address !');
          });
        }
      };
      $scope.deleteOutlet = function() {
        var r;
        r = confirm("Do you want to delete this outlet \"" + $scope.outlet.name + "\"?");
        if (r === true) {
          Businesses["delete"]($scope.outlet._links.self.href).then(function(res) {
            if (typeof res === 'object' && res.status === 204) {
              $scope.infoUpdated = 'Deleted business successfully!';
              $timeout(function() {
                var businessId, clientId;
                clientId = $routeParams.clientId;
                businessId = $routeParams.businessId;
                return $location.path('/merchant/' + clientId + '/business/' + businessId);
              }, 300);
            }
          }, function(error) {
            return $scope.infoUpdated = error.status + ': Error, refresh & try again !';
          });
        }
      };
      return _getOutlet();
    }
  ]).controller('PromotionCtrl', [
    '$scope', '$filter', 'fetchTabData', '$location', '$routeParams', 'config', '$q', '$modal', 'Businesses', '$timeout', 'authHandler', function($scope, $filter, fetchTabData, $location, $routeParams, config, $q, $modal, Businesses, $timeout, authHandler) {
      var _URL, _getPromotion, _getTypes;
      $scope.clientId = $routeParams.clientId;
      $scope.businessId = $routeParams.businessId ? $routeParams.businessId.trim() : false;
      $scope.promotionId = $routeParams.promotionId ? $routeParams.promotionId.trim() : false;
      if (!$scope.businessId) {
        location.href = '#/merchant/' + $scope.clientId + '/business';
        return;
      }
      if (!$scope.promotionId) {
        location.href = '#/merchant/' + $scope.clientId + '/business/' + $scope.businessId;
        return;
      }
      authHandler.checkLoggedIn();
      _URL = {
        detail: config.path.baseURL + '/promotions/' + $scope.promotionId,
        types: config.path.baseURL + '/promotion/types',
        outlets: config.path.baseURL + '/businesses/' + $scope.businessId + '/outlets'
      };
      _getPromotion = function() {
        return Businesses.get(_URL.detail).then(function(pro) {
          if (pro.status !== 200 || typeof pro !== 'object') {
            return;
          }
          $scope.promotion = pro.data;
          if (pro.data._links.type) {
            Businesses.get(pro.data._links.type.href).then(function(type) {
              if (type.status !== 200 || typeof type !== 'object') {
                return;
              }
              return $scope.promotion.type = type.data.id;
            }, function(error) {
              return console.log(error);
            });
          }
          if (pro.data._links.retail_outlets) {
            return Businesses.get(pro.data._links.retail_outlets.href).then(function(out) {
              if (out.status !== 200 || typeof out !== 'object') {
                return;
              }
              return $scope.promotion.outlets = out.data._embedded.items;
            }, function(error) {
              return console.log(error);
            });
          }
        }, function(error) {
          return console.log(error);
        });
      };
      $scope.openStartDatepicker = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        return $scope.datepickerStartOpened = true;
      };
      $scope.openEndDatepicker = function($event) {
        $event.preventDefault();
        $event.stopPropagation();
        return $scope.datepickerEndOpened = true;
      };
      _getTypes = function() {
        return Businesses.get(_URL.types).then(function(res) {
          if (res.status !== 200 || typeof res !== 'object') {
            return;
          }
          if (res.data._embedded.items.length > 0) {
            return $scope.promotionTypes = res.data._embedded.items;
          } else {
            return $scope.promotionTypes = [];
          }
        }, function(error) {
          return console.log(error);
        });
      };
      _getTypes();
      $scope.isDisable = true;
      $scope.updatePromotion = function() {
        var effective_from, expire_on, new_data;
        angular.forEach($scope.frm_update_promotion.$error.required, function(field) {
          return field.$dirty = true;
        });
        if ($scope.frm_update_promotion.$error.required || !$scope.frm_update_promotion.$valid) {
          return false;
        }
        new_data = {
          promotion: {
            title: $scope.promotion.title,
            discount_amount: $scope.promotion.discount_amount || 0,
            estimated_value: $scope.promotion.estimated_value,
            offer_limit: $scope.promotion.offer_limit || 0,
            weekly_limit: $scope.promotion.weekly_limit || 0,
            monthly_limit: $scope.promotion.monthly_limit || 0,
            yearly_limit: $scope.promotion.yearly_limit || 0,
            organisation_limit: $scope.promotion.organisation_limit || 0,
            user_limit: $scope.promotion.user_limit,
            enabled: $scope.promotion.enabled,
            type: $scope.promotion.type,
            business: $scope.businessId
          }
        };
        effective_from = $scope.promotion.effective_from || '';
        if (effective_from !== '') {
          effective_from = $filter('date')(new Date(effective_from), 'yyyy-MM-ddT00:00:00+0000');
          new_data.promotion.effective_from = effective_from;
        }
        expire_on = $scope.promotion.expire_on || '';
        if (expire_on !== '') {
          expire_on = $filter('date')(new Date(expire_on), 'yyyy-MM-ddT00:00:00+0000');
          new_data.promotion.expire_on = expire_on;
        }
        Businesses.put($scope.promotion._links.self.href, new_data).then(function(res) {
          if (typeof res === 'object' && res.status === 204) {
            return $scope.infoUpdated = "Update Successfully!";
          }
        }, function(error) {
          return alert(error.status + ' : Error, refresh & try again !');
        });
      };
      $scope.deletePromotion = function() {
        var r;
        r = confirm("Do you want to delete this promotion \"" + $scope.promotion.title + "\"?");
        if (r === true) {
          Businesses["delete"]($scope.promotion._links.self.href).then(function(res) {
            if (typeof res === 'object' && res.status === 204) {
              $scope.infoUpdated = 'Deleted promotion successfully!';
              $timeout(function() {
                var businessId, clientId;
                clientId = $routeParams.clientId;
                businessId = $routeParams.businessId;
                return $location.path('/merchant/' + clientId + '/business/' + businessId);
              }, 300);
            }
          }, function(error) {
            return $scope.infoUpdated = error.status + ': Error, refresh & try again !';
          });
        }
      };
      $scope.getOutlets = function(query) {
        return Businesses.get(_URL.outlets + "?limit=99999").then(function(res) {
          if (res.status !== 200 || typeof res !== 'object') {
            return [];
          }
          if (res.data._embedded.items.length > 0) {
            return res.data._embedded.items;
          } else {
            return [];
          }
        }, function(error) {
          return console.log(error);
        });
      };
      $scope.insertNewOutlet = function() {
        var new_data;
        angular.forEach($scope.frm_create_outlet.$error.required, function(field) {
          return field.$dirty = true;
        });
        if ($scope.frm_create_outlet.$error.required || !$scope.frm_create_outlet.$valid) {
          return false;
        }
        if ($scope.outlets.chosenList.length <= 0) {
          $scope.displayError = true;
          return false;
        }
        new_data = {
          promotion: {
            title: $scope.promotion.title,
            discount_amount: $scope.promotion.discount_amount || 0,
            estimated_value: $scope.promotion.estimated_value,
            offer_limit: $scope.promotion.offer_limit || 0,
            weekly_limit: $scope.promotion.weekly_limit || 0,
            monthly_limit: $scope.promotion.monthly_limit || 0,
            yearly_limit: $scope.promotion.yearly_limit || 0,
            organisation_limit: $scope.promotion.organisation_limit || 0,
            user_limit: $scope.promotion.user_limit,
            effective_from: $scope.promotion.effective_from,
            expire_on: $scope.promotion.expire_on,
            enabled: $scope.promotion.enabled,
            type: $scope.promotion.type,
            business: $scope.businessId
          }
        };
        new_data.promotion.retail_outlets = [];
        if ($scope.promotion.outlets !== void 0 && $scope.promotion.outlets.length > 0) {
          angular.forEach($scope.promotion.outlets, function(outlet) {
            return new_data.promotion.retail_outlets.push(outlet.id);
          });
        }
        angular.forEach($scope.outlets.chosenList, function(outlet) {
          if (new_data.promotion.retail_outlets.indexOf(outlet.id) === -1) {
            return new_data.promotion.retail_outlets.push(outlet.id);
          }
        });
        $scope.insertData = new_data;
        Businesses.put($scope.promotion._links.self.href, new_data).then(function(res) {
          if (typeof res === 'object' && res.status === 204) {
            $scope.infoUpdated = "Update Successfully!";
            return $timeout(function() {
              return location.reload();
            }, 300);
          }
        }, function(error) {
          return alert(error.status + ' : Error, refresh & try again !');
        });
      };
      $scope.removeOutlet = function(outlet) {
        var new_data, r;
        r = confirm("Do you want to remove this outlet \"" + outlet.name + "\"?");
        if (r === true) {
          new_data = {
            promotion: {
              title: $scope.promotion.title,
              discount_amount: $scope.promotion.discount_amount || 0,
              estimated_value: $scope.promotion.estimated_value,
              offer_limit: $scope.promotion.offer_limit || 0,
              weekly_limit: $scope.promotion.weekly_limit || 0,
              monthly_limit: $scope.promotion.monthly_limit || 0,
              yearly_limit: $scope.promotion.yearly_limit || 0,
              organisation_limit: $scope.promotion.organisation_limit || 0,
              user_limit: $scope.promotion.user_limit,
              effective_from: $scope.promotion.effective_from,
              expire_on: $scope.promotion.expire_on,
              enabled: $scope.promotion.enabled,
              type: $scope.promotion.type,
              business: $scope.businessId
            }
          };
          new_data.promotion.retail_outlets = [];
          if ($scope.promotion.outlets.length > 0) {
            angular.forEach($scope.promotion.outlets, function(out) {
              if (out.id !== outlet.id) {
                return new_data.promotion.retail_outlets.push(out.id);
              }
            });
          }
          Businesses.put($scope.promotion._links.self.href, new_data).then(function(res) {
            if (typeof res === 'object' && res.status === 204) {
              $scope.infoUpdated = "Delete Successfully!";
              return $timeout(function() {
                return location.reload();
              }, 300);
            }
          }, function(error) {
            return alert(error.status + ' : Error, refresh & try again !');
          });
        }
      };
      return _getPromotion();
    }
  ]);

}).call(this);
