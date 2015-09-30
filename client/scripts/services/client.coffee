'use strict'

###*
 # @ngdoc service
 # @name transformApp.client
 # @description
 # # client
 # Service in the transformApp.
###
angular.module('app.client.services', [])
.factory('clientService', [ '$resource', 'config', ($resource, config) ->
	service = $resource(config.path.baseURL + config.path.client, {}, {
            query:{
                method:"GET",
                action: config.path.baseURL + config.path.clients,
            }
    	}
	)
	return service
])
.factory('fetchTabData', [ '$http', '$q', '$resource', ($http, $q, $resource) ->
    return {
        tabFetchDataByIndex : (tabConfig) ->
            d = $q.defer()

            if !tabConfig && typeof tabConfig != 'object'
                return

            $http({
                method: 'GET',
                url: tabConfig.baseUrl
            })
            .then (res) ->
                d.resolve(res)
            , (error) ->
                d.reject(error)

            d.promise
        fetchMainData: (tabConfig) ->
            d = $q.defer()
            Clients = $resource('https://api.sg-benefits.com/organisations', {}, {
                    get:{
                        method:"GET",
                        headers: { 'x-username': 'kenneth.yap@ap.magenta-consulting.com', 'x-password': 'p@ssword' }
                    }
                }
            )
            Clients.get({}, (data, getResponseHeaders) ->
                if data
                    d.resolve(data)
                else
                    d.reject(error)
            )
            d.promise
        fetchClient: (id) ->
            d = $q.defer()
            Client = $resource('https://api.sg-benefits.com/organisations/' + id, {}, {
                    get:{
                        method:"GET",
                        headers: { 'x-username': 'kenneth.yap@ap.magenta-consulting.com', 'x-password': 'p@ssword' }
                    }
                }
            )
            Client.get({}, (data, getResponseHeaders) ->
                if data
                    d.resolve(data)
                else
                    d.reject(error)
            )
            d.promise
        fetchUrl: (linkURL) ->
            d = $q.defer()
            Resource = $resource(linkURL, {}, {
                    get:{
                        method:"GET",
                        headers: { 'x-username': 'kenneth.yap@ap.magenta-consulting.com', 'x-password': 'p@ssword' }
                    }
                }
            )
            Resource.get({}, (data, getResponseHeaders) ->
                if data
                    d.resolve(data)
                else
                    d.reject(error)
            )
            d.promise
    }
])
.factory('fakeData', [ '$http', '$q', ($http, $q) ->
    return {
        clients_data : {
            clients_list : [
                {
                    'id' : 1
                    'company' : 'Magenta Pte Ltd'
                    'status' : 'live'
                    'industry' : 'HR Advisory'
                    'user' : 35
                    'est_savings' : '$2,500'
                    'cs' : 'Astrid'
                }
            ,
                {
                    'id' : 2
                    'company' : 'BSI Group'
                    'status' : 'live'
                    'industry' : 'Banking'
                    'user' : 245
                    'est_savings' : '$35,000'
                    'cs' : 'Astrid'
                }
            ,
                {
                    'id' : 3
                    'company' : 'Yang Kee'
                    'status' : 'live'
                    'industry' : 'Logistics'
                    'user' : 220
                    'est_savings' : '$15,000'
                    'cs' : 'George'
                }
            ,
                {
                    'id' : 4
                    'company' : 'Fastflow'
                    'status' : 'live'
                    'industry' : 'Logistics'
                    'user' : 125
                    'est_savings' : '$5,000'
                    'cs' : 'Not Assigned'
                }
            ]
            clients_tab_company : {
                'id' : 1
                'company_name' : 'Magenta Consulting Pte Ltd'
                'company_no'   : '199452264G'
                'address'      : '8 Burn Road'
                'unit_number'  : '#12-11'
                'building_name': 'Trivex'
                'postal_code'  : '369977'
                'business_type': 'HR Consultancy, Corporate Services'
                'office_number': '65587895'
                'adm_email'    : 'Kenneth@magenta-consultancy.com'
                'adm_no'       : '96854457'
                'client_since' : '29 Jan 2014'
                'package_type' : 'Basic - $10/User/Month'
                'about_company': 'Magenta is the colour of the highest order, connected with spirituality, mediation, and letting go. It is an agent for change, for the clearing out of old attitudes and obsessions, and for making a break with the past. Consistent with the qualities associated with the colour ‘Magenta’, the Human Resource Consulting Services of Magenta Consulting Services is delivered in the highest order possible. We are your agent for change – for the enhancement of the present and a lead into the future – via our innovative approach to the human capital solutions we offer.kdf'
                'logo'         : 'images/logo-demo.png'
            }
            clients_tab_user_list : [
                {
                    'id' : 1
                    'data_add'  : '29 June 2015 3:45pm'
                    'firstname' : 'Astrid'
                    'lastname'  : 'Tan'
                    'email'     : 'a.magenta@magenta.com'
                    'contact_no': '9787264'
                    'veri_code' : 'Awre5442d'
                    'employ_cls': 'Management'
                }
            ,
                {
                    'id' : 2
                    'data_add'  : '29 July 2013 3:45pm'
                    'firstname' : 'Wayne'
                    'lastname'  : 'Smith'
                    'email'     : 'w.smith@magenta.com'
                    'contact_no': '761387'
                    'veri_code' : 'OgGjhf974h'
                    'employ_cls': 'Management'
                }
            ,
                {
                    'id' : 3
                    'data_add'  : '19 Feb 2014 8:45pm'
                    'firstname' : 'John'
                    'lastname'  : 'Nguyen'
                    'email'     : 'john_nguyen@magenta.com'
                    'contact_no': '123975'
                    'veri_code' : 'P8hdgh3asd'
                    'employ_cls': 'Staff'
                }
            ,
                {
                    'id' : 4
                    'data_add'  : '02 May 2015 14:45pm'
                    'firstname' : 'Martin'
                    'lastname'  : 'Long'
                    'email'     : 'mr.long@magenta.com'
                    'contact_no': '52342322'
                    'veri_code' : '9hfaGF72'
                    'employ_cls': 'Management'
                }
            ,
            {
                    'id' : 5
                    'data_add'  : '29 June 2015 3:45pm'
                    'firstname' : 'Astrid'
                    'lastname'  : 'Tan'
                    'email'     : 'a.magenta@magenta.com'
                    'contact_no': '9787264'
                    'veri_code' : 'Awre5442d'
                    'employ_cls': 'Management'
                }
            ,
                {
                    'id' : 6
                    'data_add'  : '29 July 2013 3:45pm'
                    'firstname' : 'Wayne'
                    'lastname'  : 'Smith'
                    'email'     : 'w.smith@magenta.com'
                    'contact_no': '761387'
                    'veri_code' : 'OgGjhf974h'
                    'employ_cls': 'Management'
                }
            ,
                {
                    'id' : 7
                    'data_add'  : '19 Feb 2014 8:45pm'
                    'firstname' : 'John'
                    'lastname'  : 'Nguyen'
                    'email'     : 'john_nguyen@magenta.com'
                    'contact_no': '123975'
                    'veri_code' : 'P8hdgh3asd'
                    'employ_cls': 'Staff'
                }
            ,
                {
                    'id' : 8
                    'data_add'  : '02 May 2015 14:45pm'
                    'firstname' : 'Martin'
                    'lastname'  : 'Long'
                    'email'     : 'mr.long@magenta.com'
                    'contact_no': '52342322'
                    'veri_code' : '9hfaGF72'
                    'employ_cls': 'Management'
                }
            ]
            clients_tab_user_uploads : [
                {
                    'id' : 1
                    'firstname' : 'Vera'
                    'lastname' : 'Tan'
                    'email' : 'a.magenta@magenta.com'
                    'contact_no' : '9879878'
                    'employ_cls' : 'Executive'
                    'funct' : 'Sales'
                    'birthday' : '25/03/81'
                    'nric' : 'Null'
                }
            ,
                {
                    'id' : 2
                    'firstname' : 'Kenneth'
                    'lastname' : 'Yap'
                    'email' : 'a.magenta@magenta.com'
                    'contact_no' : '936687'
                    'employ_cls' : 'Management'
                    'funct' : 'Marketing'
                    'birthday' : '20/06/85'
                    'nric' : 'Null'
                }
            ,
                {
                    'id' : 3
                    'firstname' : 'Wayne'
                    'lastname' : 'Ng'
                    'email' : 'a.magenta@magenta.com'
                    'contact_no' : '8728763'
                    'employ_cls' : 'Executive'
                    'funct' : 'Sales'
                    'birthday' : '25/03/81'
                    'nric' : 'Null'
                }
            ,
                {
                    'id' : 4
                    'firstname' : 'Linda'
                    'lastname' : 'Leong'
                    'email' : 'a.magenta@magenta.com'
                    'contact_no' : '765127'
                    'employ_cls' : 'Management'
                    'funct' : 'Marketing'
                    'birthday' : '20/06/85'
                    'nric' : 'Null'
                }
            ]
            clients_user_detail : {
                "id" : 1
                "firstname" : "Joan"
                "lastname"  : "Yan"
                "email"     : "Joan.yan@mint.com"
                "contact"   : "998554565"
                "employ_cls": "Workmen"
                "function"  : "Waitress"
                "birthday"  : "03 May 1990"
                "nric"      : "13 Jun 2016"
                "date_add"  : "12 Jun 2015"
                "date_end"  : "13 Jun 2016"
                "app_status": "De-activated"
                "veri_code" : "XXEOOKm1923"
                "redemptions" : "25"
                "est_saving" : "s$600"
                "card_id"   : "3325-44556-45"
            }
            clients_user_redemptions_list : [
                {
                    "id" : 1
                    "date" : "4 Sep 2015 3:45pm"
                    "merchant" : "Long Long ago far away bar"
                    "item" : "Happy Hour"
                    "location" : "99 Hong Kong Road"
                    "category" : "F&B"
                    "est_save" : "s$20"
                    "ref"   : "244eefee"
                }
                {
                    "id" : 2
                    "date" : "24 Jul 2015 5:12pm"
                    "merchant" : "Pollywooks"
                    "item" : "Free Admission"
                    "location" : "Nex Mall, Serangoon"
                    "category" : "Kids"
                    "est_save" : "s$18"
                    "ref"   : "Seff55448"
                }
            ]
            clients_user_upload_detail : [
                {
                    'id' : 1
                    'firstname' : 'Vera'
                    'lastname' : 'Tan'
                    'email' : 'a.magenta@magenta.com'
                    'contact_no' : '9879878'
                    'veri_code' : 'E#vfr4f5'
                    'employ_cls' : 'Executive'
                    'funct' : 'Sales'
                    'birthday' : '25/03/81'
                    'nric' : 'Null'
                }
            ,
                {
                    'id' : 2
                    'firstname' : 'Kenneth'
                    'lastname' : 'Yap'
                    'email' : 'a.magenta@magenta.com'
                    'contact_no' : '936687'
                    'veri_code' : 'G553245'
                    'employ_cls' : 'Management'
                    'funct' : 'Marketing'
                    'birthday' : '20/06/85'
                    'nric' : 'Null'
                }
            ,
                {
                    'id' : 3
                    'firstname' : 'Wayne'
                    'lastname' : 'Ng'
                    'email' : 'a.magenta@magenta.com'
                    'contact_no' : '8728763'
                    'veri_code' : '#%verrf3'
                    'employ_cls' : 'Executive'
                    'funct' : 'Sales'
                    'birthday' : '25/03/81'
                    'nric' : 'Null'
                }
            ,
                {
                    'id' : 4
                    'firstname' : 'Linda'
                    'lastname' : 'Leong'
                    'email' : 'a.magenta@magenta.com'
                    'contact_no' : '765127'
                    'veri_code' : '%323@32'
                    'employ_cls' : 'Management'
                    'funct' : 'Marketing'
                    'birthday' : '20/06/85'
                    'nric' : 'Null'
                }
            ]
            clients_tab_handbook_list : [
                {
                    'id'            : 'chk_hb_1'
                    'version'       : '1.4.1'
                    'last_modified' : '12 Jun 2015'
                    'language'      : 'English'
                    'public'        :  true
                }
            ,
                {
                    'id'            : 'chk_hb_2'
                    'version'       : '1.3.1'
                    'last_modified' : '05 Apr 2015'
                    'language'      : 'Chinese'
                    'public'        :  true
                }
            ,
                {
                    'id'            : 'chk_hb_3'
                    'version'       : '1.2.1'
                    'last_modified' : '12 Jun 2015'
                    'language'      : 'English'
                    'public'        :  false
                }
            ]
            clients_tab_handbook_info : {
                "id"           : 1
                "company_name" : "Magenta Consulting Pte Ltd"
                "company_no"   : "199452264G"
                "address"      : "8 Burn Road"
                "unit_number"  : "#12-11"
                "building_name": "Trivex"
                "postal_code"  : "369977"
                "handbook_ttl" : "Magenta Consulting Employee Handbook"
                "version"      : "1.4"
                "year"         : "2015"
                "language"     : "English"
            }
            clients_tab_handbook_general : {
                "id" : 1
                "logo" : "../images/logo-demo.png"
                "content" : "We have specially prepared this Handbook to explain and help you better understand Magenta’s Human Resource policies, compensation and benefits programs, as well as our corporate rules and regulations."
            }
            clients_tab_handbook_section : {
                "id" : 1
                "section_title" : "Forward"
                "status" : "Active/Disabled"
                "section_no" : 1
                "content" : "Can be left blank if nothing to be written in this section"
            }
        }
    }
])
# .factory 'Client', ($resource) ->
# 	return $resource mainConfig.path.baseURL + mainConfig.path.client, {organisation_id:1}, {
# 		query: {
# 			action: mainConfig.path.baseURL + mainConfig.path.clients
# 			method: 'GET'
# 		}
# 	}
