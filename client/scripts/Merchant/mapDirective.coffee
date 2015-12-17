'use strict'

angular.module('app.maps.directives', [])

.directive('ngGmap', [ ->
    # MAP Fn -----------------------------------------------
    map_fn = {
        directionsDisplay : new google.maps.DirectionsRenderer(),
        directionsService : new google.maps.DirectionsService(),
        initMap : (task, opts, scope) ->
            if typeof opts != 'object'
                console.log 'Error : map_fn needs Options'
                return


            n_map = null
            n_map = new google.maps.Map(document.getElementById(opts.setid), {
                center: opts.center,
                zoom  : opts.zoom
            });
            # TASK SHOW ------------------ */
            # Options :
            # - setid
            # - center
            # - zoom
            if (task == 'show') {
                # Do something in this task
            }
            # TASK SHOW ------------------ */
            # Options :
            # - setid
            # - center
            # - zoom
            # - route
            # --- start
            # --- end
            # --- polyline
            else if task == 'route'
                map_fn.directionsDisplay.setMap(n_map)
                map_fn.directionsDisplay.setOptions({suppressMarkers : true})
                n_map['res_route'] = map_fn.displayRoute(map_fn.directionsService, map_fn.directionsDisplay, n_map, opts.route, scope)
            # TASK SHOW MANY MAKERS ------------------ */
            # get data
            # each data
            # declare new map
            else if task == 'show_markers'
                m_data  =   opts.routes
                i = 0
                while i < m_data.length
                    latLng = new (google.maps.LatLng)(m_data[i].latitude, m_data[i].longitude)
                    image = 'images/marker_end.png'
                    marker = new (google.maps.Marker)(
                        map: n_map
                        position: latLng
                        icon: image
                        id: i)
                    i++
                #for ( i = 0; i < m_data.length; i++)
            return n_map

    }
   # --------------------------------------------------------
   # 1. CTRL
    gmapCtrl = [
      '$scope'
      ($scope) ->
        firstRun = true
        $scope.$watch 'result_map', (nv) ->
            if firstRun
                firstRun = false
                return
            if !nv
                $scope.result =
                    status: 'error'
                    message: 'Error map'
            else
                $scope.result =
                    status: 'OK'
                    data: $scope.result_map
        return
    ]

    # 2. LINK
    uniqueId = 1

    gmapLink = (scope, element, attrs) ->
        console.log 'IN LINK'
        console.log scope
        # SET ID EACH MAP on PAGE
        setID = 'map_' + uniqueId
        $(element).find('.load-map').attr 'id', setID
        uniqueId++
        # INIT MAP
        polyline = new (google.maps.Polyline)(
            strokeColor: '#6e98ab'
            strokeOpacity: 0.9
            strokeWeight: 5)
        setup_data = scope.data
        setup_data['setid'] = setID
        map = undefined
        scope['result_map'] = null
        map_fn.initMap setup_data.task, setup_data, scope
        return
    # ------------------------------------------
    # *
    # RETURN DIRECTIVE
    # - SETUP VAR
    return {
        restrict: 'E',
        scope   : {
            data   : '=',
            result : '=ngResult'
        },
        templateUrl: 'views/merchant/detail_outlets/ng_gmap.html',
        controller : gmapCtrl,
        link: gmapLink
    };
])
