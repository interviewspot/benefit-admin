'use strict'

angular.module('app.phpjs.services', [])

.factory('php', [ () ->
    return {
        explode : (delimiter, string, limit) ->
            #  discuss at: http://phpjs.org/functions/explode/
            # original by: Kevin van Zonneveld (http://kevin.vanzonneveld.net)
            #   example 1: explode(' ', 'Kevin van Zonneveld');
            #   returns 1: {0: 'Kevin', 1: 'van', 2: 'Zonneveld'}

            if (arguments.length < 2 || typeof delimiter == 'undefined' || typeof string == 'undefined')
                return null

            if (delimiter == '' || delimiter == false || delimiter == null)
                return false

            if (typeof delimiter == 'function' || typeof delimiter == 'object' || typeof string == 'function' || typeof string ==
            'object')
                return {
                    0 : ''
                }

            if delimiter == true
                delimiter = '1';

            # Here we go...
            delimiter += ''
            string += ''

            s = string.split(delimiter)

            if typeof limit == 'undefined'
                return s

            # Support for limit
            if limit == 0
                limit = 1;

            # Positive limit
            if (limit > 0)
                if (limit >= s.length)
                    return s;
                return s.slice(0, limit - 1)
                    .concat([
                        s.slice(limit - 1).join(delimiter)
                    ])

            # Negative limit
            if (-limit >= s.length)
                return []

            s.splice(s.length + limit)
            return s

        # -------------------------------------
        # randomString
        randomString : (length, chars) ->
            mask = ''
            if chars.indexOf('a') > -1
                mask += 'abcdefghijklmnopqrstuvwxyz'
            if chars.indexOf('A') > -1
                mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
            if chars.indexOf('#') > -1
                mask += '0123456789'
            if chars.indexOf('!') > -1
                mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\'

            result = ''
            for i in [length..0]
                result += mask[Math.round(Math.random()*(mask.length - 1))]

            return result

        # -------------------------------------
        # getNOW_TimeStamp
        getNOW_TimeStamp : () ->
            now = new Date
            now.getMonth() + 1 + '/' + now.getDate() + '/' + now.getFullYear() + ' ' + now.getHours() + ':' + (if now.getMinutes() < 10 then '0' + now.getMinutes() else now.getMinutes()) + ':' + (if now.getSeconds() < 10 then '0' + now.getSeconds() else now.getSeconds())

        # -------------------------------------
        # getTimeStamp
        getTimeStamp : (ndate) ->
            if ndate == 1
                ndate = getNOW_TimeStamp()
            dateAsDateObject = new Date(Date.parse(ndate))
            dateAsDateObject.getTime()
    }
])
