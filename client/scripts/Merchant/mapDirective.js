(function() {
  'use strict';
  angular.module('app.maps.directives', []).directive('ngGmap', [
    function() {
      var geocoder, gmapCtrl, gmapLink, infoWindow, latLng, map, map_fn, marker, _scope;
      geocoder = new google.maps.Geocoder();
      map = void 0;
      latLng = void 0;
      marker = void 0;
      infoWindow = void 0;
      _scope = null;
      map_fn = {
        initMap: function(mapID, lat, lng, hideinfo, scope) {
          var myOptions;
          myOptions = {
            zoom: 12,
            panControl: false,
            streetViewControl: false,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            mapTypeControl: false
          };
          map = new google.maps.Map(document.getElementById(mapID), myOptions);
          latLng = new google.maps.LatLng(lat, lng);
          map.setCenter(latLng);
          marker = new google.maps.Marker({
            position: latLng,
            map: map,
            draggable: true,
            animation: google.maps.Animation.DROP
          });
          infoWindow = new google.maps.InfoWindow({
            content: '<div id="iw"><strong>Instructions:</strong><br /><br />Click and drag this red marker anywhere to know the approximate postal address of that location.</div>'
          });
          if (hideinfo) {
            map_fn.geocode(latLng, scope);
          } else {
            infoWindow.open(map, marker);
          }
          google.maps.event.addListener(marker, 'dragstart', function(e) {
            infoWindow.close();
          });
          google.maps.event.addListener(marker, 'dragend', function(e) {
            var point;
            point = marker.getPosition();
            map.panTo(point);
            map_fn.geocode(point, scope);
          });
        },
        showAddress: function(val, scope) {
          infoWindow.close();
          geocoder.geocode({
            'address': val
          }, function(results, status) {
            if (status === google.maps.GeocoderStatus.OK) {
              marker.setPosition(results[0].geometry.location);
              map_fn.geocode(results[0].geometry.location, scope);
            } else {
              console.log('Sorry but Google Maps could not find this location.');
            }
          });
        },
        geocode: function(position, scope) {
          var aLatlng;
          if (typeof position.lat === 'number') {
            aLatlng = new google.maps.LatLng(position.lat, position.lng);
            marker.setPosition(aLatlng);
          }
          return geocoder.geocode({
            latLng: position
          }, function(responses) {
            var html;
            html = '';
            if (responses && responses.length > 0) {
              html += '<h3>Postal Address</h3><hr/>' + responses[0].formatted_address;
            } else {
              html += 'Sorry but Google Maps could not determine the approximate postal address of this location.';
            }
            html += '<hr />' + 'Latitude : ' + marker.getPosition().lat() + '<br/>Longitude: ' + marker.getPosition().lng();
            map.panTo(marker.getPosition());
            infoWindow.setContent('<div id=\'iw\'>' + html + '</div>');
            infoWindow.open(map, marker);
            $('.txt-location').val(marker.getPosition().lat() + ' , ' + marker.getPosition().lng());
            scope.$apply(function() {
              return scope.result = {
                long: marker.getPosition().lng(),
                lat: marker.getPosition().lat()
              };
            });
          });
        }
      };
      gmapLink = function(scope, element, attrs) {
        var address_val, map_id, nlat, nlog;
        if (scope.data === void 0) {
          nlat = 41.85;
          nlog = -87.65;
        } else {
          nlat = scope.data.geo_lat;
          nlog = scope.data.geo_lng;
        }
        map_id = $(element).find('.load-map').attr('id');
        map_fn.initMap(map_id, nlat, nlog, false, scope);
        address_val = $(element).closest('.col-md-6').siblings('.col-md-6').find('.txt-address').val();
        scope.$watch('data', function(nv) {
          var geo_position;
          if (nv) {
            console.log('nv');
            console.log(nv);
            geo_position = {
              lat: nv.geo_lat,
              lng: nv.geo_lng
            };
            return map_fn.geocode(geo_position, scope);
          }
        });
        map_fn.showAddress(address_val, scope);
        $('.get_address').on('click', function() {
          var add_val;
          add_val = $(this).siblings('.txt-address').val();
          return map_fn.showAddress(add_val, scope);
        });
      };
      gmapCtrl = [
        '$scope', '$http', '$timeout', function($scope, $http, $timeout) {
          $scope.result = {};
          $scope.$watch('result', function(nv) {
            if (nv) {
              return $scope.result = nv;
            }
          });
        }
      ];
      return {
        restrict: 'E',
        scope: {
          data: '=',
          result: '=ngResultmap'
        },
        templateUrl: 'views/merchant/detail_outlets/ng_gmap.html',
        controller: gmapCtrl,
        link: gmapLink
      };
    }
  ]);

}).call(this);
