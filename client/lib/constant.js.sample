(function() {
    angular.module('app.constant', []).factory('config', [
        '$resource', '$rootScope', function($resource, $rootScope) {
            return {
                path: {
                    'baseURL': 'https://api.sg-benefits.com',
                    'clients': '/organisations',
                    'client': '/organisations/:org_id',
                    'handbooks': '/organisations/:org_id/handbooks',
                    'handbook': '/organisations/:org_id/handbooks/:hand_id',
                    'sections': '/organisations/:org_id/handbooks/:hand_id/sections',
                    'section': '/organisations/:org_id/handbooks/:hand_id/sections/:section_id',
                    'section_children': '/organisations/:org_id/handbooks/:hand_id/sections/:section_id/children',
                    'section_parent': '/organisations/:org_id/handbooks/:hand_id/sections/parent',
                    'contacts': '/organisations/:org_id/positions',
                    'contact': '/organisations/:org_id/positions/:position_id',
                    'users': '/users',
                    'upload': '/api/providers/sonata.media.provider.',
                    'businesses': '/organisations/:org_id/businesses'
                }
            };
        }
    ]);

}).call(this);