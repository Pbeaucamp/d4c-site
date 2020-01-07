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


L.Control.D4CMapFullscreen = L.Control.extend({
    options: {
        position: 'topleft',
        title: {
            false: 'View Fullscreen',
            true: 'Exit Fullscreen'
        }
    },

    onAdd: function () {
        var container = L.DomUtil.create('div', 'leaflet-control-fullscreen leaflet-bar leaflet-control');

        this.link = L.DomUtil.create('a', 'leaflet-control-fullscreen-button leaflet-bar-part', container);
        this.link.href = '#';

        this._updateTitle();

        var that = this;
        $(document).on('fullscreenchange mozfullscreenchange webkitfullscreenchange msfullscreenchange MSFullscreenChange d4cfullscreenchange', function (event) {
            that.updateInternalFullscreenStatus(event);
            that.updateKeypressEventListener(event);
            that.updateDOM();
        });

        L.DomEvent.on(this.link, 'click', this._click, this);

        return container;
    },

    _click: function (e) {
        L.DomEvent.stopPropagation(e);
        L.DomEvent.preventDefault(e);
        this.toggleFullscreen();
    },

    _getContainer: function () {
        return this._map.getContainer().parentElement;
    },

    _updateTitle: function () {
        this.link.title = this.options.title[this.isFullscreen()];
    },

    _updateContainerClasses: function () {
        var container = this._getContainer();
        if (this.isFullscreen()) {
            L.DomUtil.addClass(container, 'd4cwidget-map--fullscreen');
        } else {
            L.DomUtil.removeClass(container, 'd4cwidget-map--fullscreen');
        }
    },

    _triggerLeafletUpdate: function () {
        // IE doesn't support the native dispatch
        // jQuery's trigger method doesn't work on iOS
        try {
            window.dispatchEvent(new Event('resize'))
        } catch(error) {
            $(window).trigger('resize');
        }
    },

    updateDOM: function () {
        this._updateContainerClasses();
        this._updateTitle();
        this._triggerLeafletUpdate();
    },

    _dispatchD4CFullscreenEvent: function (fullscreen) {
        document.dispatchEvent(new CustomEvent('d4cfullscreenchange', {detail: {fullscreen: fullscreen}}));
    },

    _requestFullscreen: function () {
        var container = this._getContainer();
        if (container.requestFullscreen) {
            container.requestFullscreen();
        } else if (container.mozRequestFullScreen) {
            container.mozRequestFullScreen();
        } else if (container.webkitRequestFullscreen) {
            container.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
        } else if (container.msRequestFullscreen) {
            container.msRequestFullscreen();
        } else {
            this._dispatchD4CFullscreenEvent(true);
        }
    },

    _exitFullscreen: function () {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.webkitCancelFullScreen) {
            document.webkitCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        } else {
            this._dispatchD4CFullscreenEvent(false);
        }
    },

    toggleFullscreen: function () {
        if (this.isFullscreen()) {
            this._exitFullscreen();
        } else {
            this._requestFullscreen();
        }
    },

    isFullscreen: function () {
        return this._isFullscreen || false;
    },

    updateInternalFullscreenStatus: function (event) {
        var fullscreenElement = document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
        var detail = event && event.originalEvent && event.originalEvent.detail && event.originalEvent.detail.fullscreen;
        this._isFullscreen = detail || !!fullscreenElement;
    },

    _addKeypressEventListener: function () {
        var that = this;
        this._eventListener = function (event) {
            if (event.keyCode === 27) {
                that._dispatchD4CFullscreenEvent(false);
            }
        };
        window.addEventListener('keypress', this._eventListener);
    },

    _removeKeypressEventListener: function () {
        window.removeEventListener('keypress', this._eventListener);
        this._eventListener = undefined;
    },

    updateKeypressEventListener: function (event) {
        if (event.type !== 'd4cfullscreenchange') {
            return;
        }
        if (this.isFullscreen() && !this._eventListener) {
            this._addKeypressEventListener();
        } else if (!this.isFullscreen() && this._eventListener) {
            this._removeKeypressEventListener();
        }
    }
});

L.control.fullscreen = function (options) {
    return new L.Control.D4CMapFullscreen(options);
};
