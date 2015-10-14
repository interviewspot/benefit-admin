/*
 * jQuery File Upload Plugin Angular JS Example
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2013, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * http://www.opensource.org/licenses/MIT
 */

/* jshint nomen:false */
/* global window, angular */

(function () {
    'use strict';

    var isOnGitHub = window.location.hostname === 'blueimp.github.io',
    // url = isOnGitHub ? '//jquery-file-upload.appspot.com/' : 'server/php/';
    // url = 'http://localhost/projects/apps/api/web/app_dev.php/api/providers/sonata.media.provider.image/media.json';
    url = 'https://api.sg-benefits.com/api/providers/sonata.media.provider.image/media';
    var myapp = angular.module('demo', [
        'blueimp.fileupload'
    ])
        .config([
            '$httpProvider', 'fileUploadProvider',
            function ($httpProvider, fileUploadProvider) {


                // delete $httpProvider.defaults.headers.common['X-Requested-With'];
                // // $httpProvider.defaults.headers.common = {
                // //     'x-username' : 'kenneth.yap@ap.magenta-consulting.com',
                // //     'x-password' : 'p@ssword'
                // // };

                // $httpProvider.defaults.headers.common['x-username'] = 'kenneth.yap@ap.magenta-consulting.com';
                // $httpProvider.defaults.headers.common['x-password'] = 'p@ssword';
                // //$httpProvider.defaults.headers.common['x-a'] = 'p@s';

                // fileUploadProvider.defaults.redirect = window.location.href.replace(
                //     /\/[^\/]*$/,
                //     '/cors/result.html?%s'
                // );
                // // if (isOnGitHub) {
                // //     // Demo settings:
                // //     angular.extend(fileUploadProvider.defaults, {
                // //         // Enable image resizing, except for Android and Opera,
                // //         // which actually support image resizing, but fail to
                // //         // send Blob objects via XHR requests:

                // //         disableImageResize: /Android(?!.*Chrome)|Opera/
                // //             .test(window.navigator.userAgent),
                // //         maxFileSize: 999000,
                // //         acceptFileTypes: /(\.|\/)(gif|jpe?g|png)$/i,
                // //         'x-username' : 'kenneth.yap@ap.magenta-consulting.com'
                // //     });
                // // }
            }
        ])

        .controller('DemoFileUploadController', [
            '$scope', '$http', '$filter', '$window',
            function ($scope, $http) {
                // SET OPTION FOR UPLOAD
                $scope.options = {
                    url : url,
                    headers: {
                        "x-username" : 'kenneth.yap@ap.magenta-consulting.com',
                        "x-password" : 'p@ssword'
                    }
                };

                // LOAD FILE
                if (!isOnGitHub) {
                    $scope.loadingFiles = true;
                    $http.get(url)
                        .then(
                        function (response) {
                            $scope.loadingFiles = false;
                            $scope.queue = response.data.files || [];
                        },
                        function () {
                            $scope.loadingFiles = false;
                        }
                    );
                }
            }
        ])

        .controller('FileDestroyController', [
            '$scope', '$http',
            function ($scope, $http) {
                var file = $scope.file,
                    state;
                if (file.url) {
                    file.$state = function () {
                        return state;
                    };
                    file.$destroy = function () {
                        state = 'pending';
                        return $http({
                            url: file.deleteUrl,
                            method: file.deleteType
                        }).then(
                            function () {
                                state = 'resolved';
                                $scope.clear(file);
                            },
                            function () {
                                state = 'rejected';
                            }
                        );
                    };
                } else if (!file.$cancel && !file._index) {
                    file.$cancel = function () {
                        $scope.clear(file);
                    };
                }
            }
        ]);

}());
