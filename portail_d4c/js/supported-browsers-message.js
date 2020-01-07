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
SOFTWARE.*/
(function() {
    //                IE8: Explore 0%, Publish 0%
    //                IE9: Explore 90%, Publish 0%
    //                IE10: Explore supported, Publish supported
    //                 */
    var texts = {
        'en': {
            'h': 'Your browser is not supported',
            'p1': "You are currently using an obsolete browser that doesn't support modern technologies used on many websites, including this one. As such, you may experience an inferior experience while browsing, and possibly broken features.",
            'p2': "We encourage you to update your current browser to the latest version, or download another one of the supported browsers:"
        },
        'fr': {
            'h': "Votre navigateur n'est plus supporté",
            'p1': "Vous utilisez actuellement un navigateur obsolète qui ne supporte pas certaines technologies modernes utilisées sur de nombreux sites, dont celui-ci. Cela risque d'affecter votre navigation, notamment en rendant inutilisable certaines fonctionnalités.",
            'p2': "Nous vous encourageons à mettre à jour votre navigateur actuel, ou à télécharger un des autres navigateurs supportés :"
        }

    };

    // Only displays if referrer is not from the same host
    if (window.document.referrer.indexOf(window.location.host) === -1) {
        if (navigator.appVersion.indexOf("MSIE 6") > -1 ||
            navigator.appVersion.indexOf("MSIE 7") > -1 ||
            navigator.appVersion.indexOf("MSIE 8") > -1 ||
            navigator.appVersion.indexOf("MSIE 9") > -1) {
            var userLang = navigator.language || navigator.userLanguage;
            var msgs = texts.en;
            if (userLang.substring(0, 2) === 'fr') {
                msgs = texts.fr;
            }

            // Show warning
            var container = document.createElement('div');
            container.className = 'd4c-supported-browsers-message';
            container.innerHTML = '<div class="d4c-supported-browsers-message">' +
                '<button type="button" class="d4c-supported-browsers-message__close">&times;</button>' +
                '<h2></h2>' +
                '<p class="d4c-supported-browsers-message__message d4c-supported-browsers-message__message--p1"></p>' +
                '<p class="d4c-supported-browsers-message__message d4c-supported-browsers-message__message--p2"></p>' +
                '<div class="d4c-supported-browsers-message__supported-browsers">' +
                '   <div class="d4c-supported-browsers-message__browser"><a href="http://windows.microsoft.com/en-us/internet-explorer/download-ie"><img src="/sites/default/files/api/portail_d4c/img/browserlogos/internet-explorer_64x64.png"><p>Version 10+</p></a></div>' +
                '   <div class="d4c-supported-browsers-message__browser"><a href="http://www.mozilla.org/"><img src="/sites/default/files/api/portail_d4c/img/browserlogos/firefox_64x64.png"><p>Version 10+</p></a></div>' +
                '   <div class="d4c-supported-browsers-message__browser"><a href="http://www.google.com/chrome/"><img src="/sites/default/files/api/portail_d4c/img/browserlogos/chrome_64x64.png"><p>Version 13+</p></a></div>' +
                '   <div class="d4c-supported-browsers-message__browser"><a href="http://www.apple.com/safari/"><img src="/sites/default/files/api/portail_d4c/img/browserlogos/safari_64x64.png"><p>Version 5+</p></a></div>' +
                '</div>' +
                '</div>';
            container.getElementsByTagName('h2')[0].innerHTML = msgs.h;
            container.querySelectorAll('.d4c-supported-browsers-message__message--p1')[0].innerHTML = msgs.p1;
            container.querySelectorAll('.d4c-supported-browsers-message__message--p2')[0].innerHTML = msgs.p2;

            document.body.appendChild(container);

            var listener = function() {
                document.body.removeChild(container);
            };
            if (document.addEventListener) {
                container.querySelectorAll('.d4c-supported-browsers-message__close')[0].addEventListener('click', listener);
            } else {
                container.querySelectorAll('.d4c-supported-browsers-message__close')[0].attachEvent('onclick', listener);
            }
        }
    }
}());