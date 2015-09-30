angular.module('app.constant', [])
.factory('config', ->
	return {
		path : {
            'baseURL'    			: 'https://api.sg-benefits.com'
            'clients'    			: '/organisations'
            'client'     			: '/organisations/:org_id'
            'handbooks'  			: '/organisations/:org_id/handbooks'
            'handbook'   			: '/organisations/:org_id/handbooks/:hand_id'
            'sections'   			: '/organisations/:org_id/handbooks/:hand_id/sections'
            'section'    			: '/organisations/:org_id/handbooks/:hand_id/sections/:section_id'
            'section_children'  	: '/organisations/:org_id/handbooks/:hand_id/sections/children'
            'section_parent'    	: '/organisations/:org_id/handbooks/:hand_id/sections/parent'
        }
	}
)	
