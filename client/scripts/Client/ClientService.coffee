'use strict';

angular.module('app.client.services', [])

.factory('fetchTabData', [ '$http', '$q', ($http, $q) ->
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
            clients_tab_company : [
                {
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
            ]
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
        }
    }
])







