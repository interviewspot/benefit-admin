angular.module('app.constant', [])
.factory('config', ->
	return {
		path : {
            'baseURL' : 'https://api.sg-benefits.com'
            'clients'   : '/organisations'
            'client'      : '/organisations/:org_id'
            'handbooks'  : '/organisations/:org_id/handbooks'
            'handbook': '/organisations/:org_id/handbooks/:hand_id'
        }
	}
)	
