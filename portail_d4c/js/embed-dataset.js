/*
This file uses a library under MIT Licence :

ods-widgets -- https://github.com/opendatasoft/ods-widgets
Copyright (c) 2014 - Opendatasoft

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/
(function() {
    "use strict";

    var mod = angular.module('d4c.frontend');

    mod.controller('DispatchController', ['$location', '$window', function($location, $window) {
        // This controller's only purpose is to wait for its initialization, then tries to determine if this is an attempt
        // to display an embed using a tab= parameter in the hash instead of a GET parameter. This could happen with very very old
        // embed link (there are probably none left), if someone with IE8/IE9 created an embed,
        // or if someone uses a share link transmitted by an IE8/IE9 user.
        var tab = $location.search().tab || $location.path().substr(1, $location.path().length-2);
        var url = $window.location.pathname;
        if ($location.path() && $window.location.pathname.lastIndexOf(tab) == $window.location.pathname.length - tab.length) {
            url = url.substr(0, $window.location.pathname.lastIndexOf(tab));
        }

        var params;
        if (tab) {
            params = $location.search();
            delete params.tab;
            url += tab+'/?' + D4C.URLUtils.getAPIQueryString(params);
            //$window.location.href = $location.path() + '?' + D4C.URLUtils.getAPIQueryString($location.search());
        } else {
            params = $location.search();
            url +=  'table/?' + D4C.URLUtils.getAPIQueryString(params);
        }

        $window.location.href = url;
    }]);
}());
