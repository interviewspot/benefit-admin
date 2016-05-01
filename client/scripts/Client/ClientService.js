(function() {
  'use strict';

  /**
    * @ngdoc service
    * @name transformApp.client
    * @description
    * # client
    * Service in the transformApp.
   */
  angular.module('app.client.services', []).factory('Clients', [
    '$http', '$q', '$resource', function($http, $q, $resource) {
      return {
        get: function(url) {
          var d;
          d = $q.defer();
          $http({
            method: 'GET',
            url: url
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        post: function(url, data) {
          var d;
          d = $q.defer();
          $http({
            method: 'POST',
            url: url,
            data: data
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        put: function(url, data) {
          var d;
          d = $q.defer();
          $http({
            method: 'PUT',
            url: url,
            data: data
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        "delete": function(url) {
          var d;
          d = $q.defer();
          $http({
            method: 'DELETE',
            url: url
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        }
      };
    }
  ]).factory('clientService', [
    '$resource', 'config', function($resource, config) {
      var service;
      service = $resource(config.path.baseURL + config.path.client, {}, {
        query: {
          method: "GET",
          action: config.path.baseURL + config.path.clients
        },
        update: {
          method: "PUT",
          action: config.path.baseURL + config.path.client
        }
      });
      return service;
    }
  ]).factory('fetchTabData', [
    '$http', '$q', '$resource', function($http, $q, $resource) {
      return {
        tabFetchDataByIndex: function(tabConfig) {
          var d;
          d = $q.defer();
          if (!tabConfig && typeof tabConfig !== 'object') {
            return;
          }
          $http({
            method: 'GET',
            url: tabConfig.baseUrl
          }).then(function(res) {
            return d.resolve(res);
          }, function(error) {
            return d.reject(error);
          });
          return d.promise;
        },
        fetchMainData: function(tabConfig) {
          var Clients, d;
          d = $q.defer();
          Clients = $resource('https://api.sg-benefits.com/organisations', {}, {
            get: {
              method: "GET",
              headers: {
                'x-username': 'kenneth.yap@ap.magenta-consulting.com',
                'x-password': 'p@ssword'
              }
            }
          });
          Clients.get({}, function(data, getResponseHeaders) {
            if (data) {
              return d.resolve(data);
            } else {
              return d.reject(error);
            }
          });
          return d.promise;
        },
        fetchClient: function(id) {
          var Client, d;
          d = $q.defer();
          Client = $resource('https://api.sg-benefits.com/organisations/' + id, {}, {
            get: {
              method: "GET",
              headers: {
                'x-username': 'kenneth.yap@ap.magenta-consulting.com',
                'x-password': 'p@ssword'
              }
            }
          });
          Client.get({}, function(data, getResponseHeaders) {
            if (data) {
              return d.resolve(data);
            } else {
              return d.reject(error);
            }
          });
          return d.promise;
        },
        fetchUrl: function(linkURL) {
          var Resource, d;
          d = $q.defer();
          Resource = $resource(linkURL, {}, {
            get: {
              method: "GET",
              headers: {
                'x-username': 'kenneth.yap@ap.magenta-consulting.com',
                'x-password': 'p@ssword'
              }
            }
          });
          Resource.get({}, function(data, getResponseHeaders) {
            if (data) {
              return d.resolve(data);
            } else {
              return d.reject(error);
            }
          });
          return d.promise;
        }
      };
    }
  ]).factory('Companies', [
    '$http', '$q', '$resource', function($http, $q, $resource) {
      return {
        get: function(url) {
          var d;
          d = $q.defer();
          $http({
            method: 'GET',
            url: url
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        post: function(url, data) {
          var d;
          d = $q.defer();
          $http({
            method: 'POST',
            url: url,
            data: data
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        }
      };
    }
  ]).factory('ClientAPI', [
    '$http', '$q', '$resource', function($http, $q, $resource) {
      return {
        go: function(method, url) {
          var d;
          d = $q.defer();
          $http({
            method: method,
            url: url
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        }
      };
    }
  ]).factory('Images', [
    '$http', '$q', '$resource', function($http, $q, $resource) {
      return {
        get: function(url) {
          var d;
          d = $q.defer();
          $http({
            method: 'GET',
            url: url
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        "delete": function(url) {
          var d;
          d = $q.defer();
          $http({
            method: 'DELETE',
            url: url
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        },
        update: function(url, data) {
          var d;
          d = $q.defer();
          $http({
            method: 'POST',
            url: url,
            data: data
          }).then(function(res) {
            d.resolve(res);
          }, function(error) {
            d.reject(error);
          });
          return d.promise;
        }
      };
    }
  ]).factory('fakeData', [
    '$http', '$q', function($http, $q) {
      return {
        clients_data: {
          clients_list: [
            {
              'id': 1,
              'company': 'Magenta Pte Ltd',
              'status': 'live',
              'industry': 'HR Advisory',
              'user': 35,
              'est_savings': '$2,500',
              'cs': 'Astrid'
            }
          ],
          clients_tab_company: {
            'id': 1,
            'company_name': 'Magenta Consulting Pte Ltd',
            'company_no': '199452264G',
            'address': '8 Burn Road',
            'unit_number': '#12-11',
            'building_name': 'Trivex',
            'postal_code': '369977',
            'business_type': 'HR Consultancy, Corporate Services',
            'office_number': '65587895',
            'adm_email': 'Kenneth@magenta-consultancy.com',
            'adm_no': '96854457',
            'client_since': '29 Jan 2014',
            'package_type': 'Basic - $10/User/Month',
            'about_company': 'Magenta is the colour of the highest order, connected with spirituality, mediation, and letting go. It is an agent for change, for the clearing out of old attitudes and obsessions, and for making a break with the past. Consistent with the qualities associated with the colour ‘Magenta’, the Human Resource Consulting Services of Magenta Consulting Services is delivered in the highest order possible. We are your agent for change – for the enhancement of the present and a lead into the future – via our innovative approach to the human capital solutions we offer.kdf',
            'logo': 'images/logo-demo.png'
          },
          clients_tab_user_list: [
            {
              'id': 1,
              'data_add': '29 June 2015 3:45pm',
              'firstname': 'Astrid',
              'lastname': 'Tan',
              'email': 'a.magenta@magenta.com',
              'contact_no': '9787264',
              'veri_code': 'Awre5442d',
              'employ_cls': 'Management'
            }
          ],
          clients_tab_user_uploads: [
            {
              'id': 1,
              'firstname': 'Vera',
              'lastname': 'Tan',
              'email': 'a.magenta@magenta.com',
              'contact_no': '9879878',
              'employ_cls': 'Executive',
              'funct': 'Sales',
              'birthday': '25/03/81',
              'nric': 'Null'
            }
          ],
          clients_user_detail: {
            "id": 1,
            "firstname": "Joan",
            "lastname": "Yan",
            "email": "Joan.yan@mint.com",
            "contact": "998554565",
            "employ_cls": "Workmen",
            "function": "Waitress",
            "birthday": "03 May 1990",
            "nric": "13 Jun 2016",
            "date_add": "12 Jun 2015",
            "date_end": "13 Jun 2016",
            "app_status": "De-activated",
            "veri_code": "XXEOOKm1923",
            "redemptions": "25",
            "est_saving": "s$600",
            "card_id": "3325-44556-45"
          },
          clients_user_redemptions_list: [
            {
              "id": 1,
              "date": "4 Sep 2015 3:45pm",
              "merchant": "Long Long ago far away bar",
              "item": "Happy Hour",
              "location": "99 Hong Kong Road",
              "category": "F&B",
              "est_save": "s$20",
              "ref": "244eefee"
            }
          ],
          clients_user_upload_detail: [
            {
              'id': 1,
              'firstname': 'Vera',
              'lastname': 'Tan',
              'email': 'a.magenta@magenta.com',
              'contact_no': '9879878',
              'veri_code': 'E#vfr4f5',
              'employ_cls': 'Executive',
              'funct': 'Sales',
              'birthday': '25/03/81',
              'nric': 'Null'
            }
          ],
          clients_tab_handbook_list: [
            {
              'id': 'chk_hb_1',
              'version': '1.4.1',
              'last_modified': '12 Jun 2015',
              'language': 'English',
              'public': true
            }
          ],
          clients_tab_handbook_info: {
            "id": 1,
            "company_name": "Magenta Consulting Pte Ltd",
            "company_no": "199452264G",
            "address": "8 Burn Road",
            "unit_number": "#12-11",
            "building_name": "Trivex",
            "postal_code": "369977",
            "handbook_ttl": "Magenta Consulting Employee Handbook",
            "version": "1.4",
            "year": "2015",
            "language": "English"
          },
          clients_tab_handbook_general: {
            "id": 1,
            "logo": "../images/logo-demo.png",
            "content": "We have specially prepared this Handbook to explain and help you better understand Magenta’s Human Resource policies, compensation and benefits programs, as well as our corporate rules and regulations."
          },
          clients_tab_handbook_section: {
            "id": 1,
            "section_title": "Forward",
            "status": "Active/Disabled",
            "section_no": 1,
            "content": "Can be left blank if nothing to be written in this section"
          }
        }
      };
    }
  ]).directive('uploadFile', [
    'Upload', function(Upload) {
      var controller, link;
      controller = [
        '$scope', '$http', '$timeout', function($scope, $http, $timeout) {
          var defaultLabel;
          defaultLabel = $scope.label.toString();
          $scope.fileName = '';
          $scope.progressPercentage = 0;
          $scope.uniqueID = new Date().getTime();
          return $scope.$watch('file', function(nv) {
            if (nv) {
              return Upload.upload({
                method: 'POST',
                url: $scope.uploadUrl,
                data: {
                  binaryContent: nv
                },
                headers: {
                  "x-username": 'kenneth.yap@ap.magenta-consulting.com',
                  "x-password": 'p@ssword',
                  "Content-Type": nv.type !== '' ? nv.type : 'application/octet-stream'
                }
              }).then(function(res) {
                $scope.result = res.data;
                $scope.result.logo_id = res.headers().location.split('/')[2];
                return $scope.progressPercentage = 0;
              }, function(error) {
                console.error(error);
                $scope.progressPercentage = 0;
                $scope.label = 'Error : ' + error.status;
                $scope.result = null;
                return $timeout(function() {
                  return $scope.label = defaultLabel;
                }, 3000);
              }, function(e) {
                $scope.progressPercentage = parseInt(100.0 * e.loaded / e.total);
                return console.info('Progress ' + $scope.progressPercentage);
              });
            }
          });
        }
      ];
      link = function(scope, element, attribute) {
        var inputFile;
        inputFile = $(element.find('input'));
        return inputFile.on('change', function(e) {
          if (this.files && this.files.length > 1) {
            scope.fileName = (this.getAttribute('data-multiple-caption') || '').replace('{count}', this.files.length);
          } else {
            scope.fileName = e.target.value.split('\\').pop();
          }
          if (scope.fileName) {
            return scope.label = scope.fileName;
          } else {
            return scope.label = 'Upload New Image';
          }
        });
      };
      return {
        'restrict': 'E',
        'scope': {
          'uploadUrl': '=uploadUrl',
          'color': '=ngProgressColor',
          'label': '=ngLabel',
          'result': '=ngUploadresponse'
        },
        'templateUrl': 'views/directives/uploadFile.html',
        'controller': controller,
        'link': link
      };
    }
  ]);

}).call(this);
