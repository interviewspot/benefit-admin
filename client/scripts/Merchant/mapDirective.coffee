'use strict'

angular.module('app.maps.directives', [])

.directive('ngGmap', [ ->
    # MAP Fn -----------------------------------------------
    # 1. INIT MAP
    # 1.1 FUNCTION INIT MAP
    # 1.2 GET ADDRESS 
    # 1.3 SHOW LOCATION INTO MAP
    # ----------------------------
    
    # 1.1 FUNCTION INIT MAP
    geocoder = new google.maps.Geocoder()
    map = undefined
    latLng = undefined
    marker = undefined
    infoWindow = undefined
    _scope = null
    map_fn = 
        _scope  : null
        initMap : (mapID, lat, lng, hideinfo, scope) ->
            #_scope = scope

            myOptions = 
                zoom: 12
                panControl: false
                streetViewControl: false
                mapTypeId: google.maps.MapTypeId.ROADMAP
                mapTypeControl: false

            map = new google.maps.Map(document.getElementById(mapID), myOptions);

            latLng = new (google.maps.LatLng)(lat, lng)

            map.setCenter latLng

            marker = new (google.maps.Marker)(
                position: latLng
                map: map
                draggable: true
                animation: google.maps.Animation.DROP)

            infoWindow = new (google.maps.InfoWindow)(content: '<div id="iw"><strong>Instructions:</strong><br /><br />Click and drag this red marker anywhere to know the approximate postal address of that location.</div>')
            if hideinfo
                map_fn.geocode latLng,scope
            else
                infoWindow.open map, marker

            google.maps.event.addListener marker, 'dragstart', (e) ->
                infoWindow.close()
                return

            google.maps.event.addListener marker, 'dragend', (e) ->
                point = marker.getPosition()
                map.panTo point
                #console.log scope
                map_fn.geocode point,scope
                return
            return
        ,
        # 1.2 GET ADDRESS 
        showAddress : (val, scope) ->
          infoWindow.close()
          geocoder.geocode { 'address': val }, (results, status) ->
            if status == google.maps.GeocoderStatus.OK
              marker.setPosition results[0].geometry.location
              map_fn.geocode results[0].geometry.location,scope
            else
              alert 'Sorry but Google Maps could not find this location.'
            return
          return
        ,

        # 1.3 SHOW LOCATION INTO MAP
        geocode : (position, scope) ->
          geocoder.geocode { latLng: position }, (responses) ->
            html = ''
            if responses and responses.length > 0
              html += '<h3>Postal Address</h3><hr/>' + responses[0].formatted_address
            else
              html += 'Sorry but Google Maps could not determine the approximate postal address of this location.'
            html += '<hr />' + 'Latitude : ' + marker.getPosition().lat() + '<br/>Longitude: ' + marker.getPosition().lng()
            map.panTo marker.getPosition()
            infoWindow.setContent '<div id=\'iw\'>' + html + '</div>'
            infoWindow.open map, marker

            # set lat long for input location
            $('.txt-location').val( marker.getPosition().lat() + ' , ' + marker.getPosition().lng() )
            console.log scope
            scope.result = {
                long: marker.getPosition().lng()
                lat: marker.getPosition().lat()
            }
            return

    # 1. INIT MAP
    gmapLink = (scope, element, attrs) ->
        # init map
        #scope.result = null
        #console.log "ssssss"
        #console.log scope
        map_id  = $(element).find('.load-map').attr 'id'
        map_fn.initMap map_id, 41.85, -87.65, false, scope
        # get location from address
        address_val = $(element).closest('.col-md-6').siblings('.col-md-6').find('.txt-address').val()
        map_fn.showAddress address_val,scope
        # get address
        $('.get_address').on 'click' , ()->
            add_val = $(this).siblings('.txt-address').val()
            map_fn.showAddress add_val,scope
        return

    gmapCtrl = [
        '$scope', '$http', '$timeout'
        ,($scope, $http, $timeout)->
            $scope.$watch 'result', (nv)->
                #$scope.result = nv

    ] # END of controller
    # ------------------------------------------
    # *
    # RETURN DIRECTIVE
    # - SETUP VAR
    return {
        restrict: 'E',
        scope   : {
            data   : '=',
            result : '=ngResultmap'
        },
        templateUrl: 'views/merchant/detail_outlets/ng_gmap.html',
        controller : gmapCtrl,
        link: gmapLink
    };
])
