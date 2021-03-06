(function() {
  'use strict';
  angular.module('app.directives', []).directive('imgHolder', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, ele, attrs) {
          return Holder.run({
            images: ele[0]
          });
        }
      };
    }
  ]).directive('customPage', function() {
    return {
      restrict: "A",
      controller: [
        '$scope', '$element', '$location', function($scope, $element, $location) {
          var addBg, path;
          path = function() {
            return $location.path();
          };
          addBg = function(path) {
            $element.removeClass('body-wide body-lock');
            switch (path) {
              case '/404':
              case '/498':
              case '/pages/404':
              case '/pages/500':
              case '/pages/signin':
              case '/pages/signup':
              case '/pages/forgot-password':
                return $element.addClass('body-wide');
              case '/pages/lock-screen':
                return $element.addClass('body-wide body-lock');
            }
          };
          addBg($location.path());
          return $scope.$watch(path, function(newVal, oldVal) {
            if (newVal === oldVal) {
              return;
            }
            return addBg($location.path());
          });
        }
      ]
    };
  }).directive('uiColorSwitch', [
    function() {
      return {
        restrict: 'A',
        link: function(scope, ele, attrs) {
          return ele.find('.color-option').on('click', function(event) {
            var $this, hrefUrl, style;
            $this = $(this);
            hrefUrl = void 0;
            style = $this.data('style');
            if (style === 'loulou') {
              hrefUrl = 'styles/main.css';
              $('link[href^="styles/main"]').attr('href', hrefUrl);
            } else if (style) {
              style = '-' + style;
              hrefUrl = 'styles/main' + style + '.css';
              $('link[href^="styles/main"]').attr('href', hrefUrl);
            } else {
              return false;
            }
            return event.preventDefault();
          });
        }
      };
    }
  ]).directive('goBack', [
    function() {
      return {
        restrict: "A",
        controller: [
          '$scope', '$element', '$window', function($scope, $element, $window) {
            return $element.on('click', function() {
              return $window.history.back();
            });
          }
        ]
      };
    }
  ]).directive('tinyeditor', [
    function() {
      return {
        restrict: 'AE',
        link: function(scope, ele, attrs) {
          return tinymce.init({
            selector: '#' + $(ele).attr('id'),
            height: 300,
            plugins: ["autolink link image lists charmap hr anchor", "searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking", "table template textcolor"],
            menubar: "table tools",
            toolbar: "styleselect | bold italic | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | link image | print preview media fullpage | forecolor backcolor"
          });
        }
      };
    }
  ]).directive('deleteitem', [
    function() {
      return {
        restrict: 'AE',
        link: function(scope, ele, atts) {
          var $this_e;
          $this_e = $(ele);
          return $this_e.on('click', function() {
            var $a_del, $tr, aconfirm;
            $a_del = $(this);
            $tr = $a_del.closest('tr');
            aconfirm = confirm("Are you sure ?");
            if (aconfirm === true) {
              return $tr.remove();
            }
          });
        }
      };
    }
  ]).directive('deletecontact', [
    function() {
      return {
        restrict: 'AE',
        link: function(scope, ele, atts) {
          var $this_e;
          $this_e = $(ele);
          return $this_e.on('click', function() {
            var $a_del, $tr, aconfirm;
            $a_del = $(this);
            $tr = $a_del.closest('.ctc-content');
            aconfirm = confirm("Are you sure ?");
            if (aconfirm === true) {
              return $tr.remove();
            }
          });
        }
      };
    }
  ]).directive('sortIcon', [
      function () {
        return {
          restrict: 'E',
          templateUrl: '../../views/directives/sortIconTemplate.html',
          scope: {
            reverse: '=',
            sortKey: '='
          },
          link: function(scope, element, attrs) {

            scope.sortKeyword = attrs.sortKeyword;
          }
        };
      }
  ]);

}).call(this);
