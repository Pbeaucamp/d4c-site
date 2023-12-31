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
var D4CTileLayerMixin = {
    d4cOptions: {
        basemap: null,
        appendAttribution: null,
        prependAttribution: null,
        disableAttribution: null,
        attributionSeparator: ' - '
    },
    _addAttributionPart: function(attribution, part) {
        if (part) {
            if (attribution) {
                attribution += this.options.attributionSeparator;
            }
            attribution += part;
        }
        return attribution;
    }
};

L.D4CTileLayer = L.TileLayer.extend({
    includes: D4CTileLayerMixin,
    initialize: function(options) {
        L.Util.setOptions(this, this.d4cOptions);
        L.Util.setOptions(this, options);
        this._initLayer(
            this.options.basemap,
            this.options.disableAttribution,
            this.options.prependAttribution,
            this.options.appendAttribution);
    },
    _mapboxUrl: function(mapId, accessToken) {
        var url = '//{s}.tiles.mapbox.com/v4/' + mapId + '/{z}/{x}/{y}';
        if (L.Browser.retina) {
            url += '@2x';
        }
        url += '.png';
        url += '?access_token=' + accessToken;
        return url;
    },
    _initLayer: function(basemap, disableAttribution, prependAttribution, appendAttribution) {
        var layerOptions = {};
        var attrib = this._addAttributionPart('', prependAttribution);
        //if (basemap.provider === 'mapquest') {
        //    // OSM MapQuest
        //    attrib = this._addAttributionPart(attrib, 'Tiles Courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png"> - Map data © <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors');
        //    attrib = this._addAttributionPart(attrib, appendAttribution);
        //    L.TileLayer.prototype.initialize.call(this, 'http://otile{s}.mqcdn.com/tiles/1.0.0/map/{z}/{x}/{y}.png',
        //        {
        //            minZoom: 1,
        //            maxNativeZoom: 17,
        //            maxZoom: 18,
        //            attribution: !disableAttribution ? attrib : '',
        //            subdomains: "1234"
        //        });
        //} else
        if (basemap.provider === 'opencycle' || basemap.provider === 'osmtransport') {
            attrib = this._addAttributionPart(attrib, 'Tiles Courtesy of <a href="http://www.thunderforest.com" target="_blank">Thunderforest</a> - Map data © <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors');
            attrib = this._addAttributionPart(attrib, appendAttribution);
            var thunderforestUrl = 'http://{s}.tile.thunderforest.com/' + (basemap.provider === 'osmtransport' ? 'transport' : 'cycle') + '/{z}/{x}/{y}.png';
            if (basemap.thunderforest_api_key) {
                thunderforestUrl += '?apikey=' + basemap.thunderforest_api_key;
            }
            L.TileLayer.prototype.initialize.call(this, thunderforestUrl,
                {
                    minZoom: 2,
                    maxNativeZoom: 18,
                    maxZoom: 19,
                    attribution: !disableAttribution ? attrib : '',
                    subdomains: "abc"
                });
        } else if (basemap.provider.indexOf('mapbox.') === 0) {
            attrib = this._addAttributionPart(attrib, 'Map data © <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors');
            attrib = this._addAttributionPart(attrib, appendAttribution);
            layerOptions = {
                minZoom: 2,
                maxZoom: 21,
                attribution: !disableAttribution ? attrib : '',
                subdomains: "abcd"
            };
            L.TileLayer.prototype.initialize.call(this, this._mapboxUrl(basemap.provider, basemap.mapbox_access_token), layerOptions);
        } else if (basemap.provider === 'mapbox') {
            attrib = this._addAttributionPart(attrib, 'Map data © <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors');
            attrib = this._addAttributionPart(attrib, appendAttribution);
            layerOptions = {
                minZoom: 2,
                maxZoom: 21,
                attribution: !disableAttribution ? attrib : '',
                subdomains: "abcd"
            };
            if (basemap.minZoom) {
                layerOptions.minZoom = basemap.minZoom;
            }
            if (basemap.maxZoom) {
                layerOptions.maxZoom = basemap.maxZoom;
            }
            L.TileLayer.prototype.initialize.call(this, this._mapboxUrl(basemap.mapid, basemap.mapbox_access_token), layerOptions);
        } else if (basemap.provider === 'osm') {
            attrib = this._addAttributionPart(attrib, 'Map data © <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors');
            attrib = this._addAttributionPart(attrib, appendAttribution);
			var osmUrl = 'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png';
            layerOptions = {
                minZoom: 2,
                maxZoom: 21,
                attribution: !disableAttribution ? attrib : '',
                subdomains: "abcd"
            };
            if (basemap.minZoom) {
                layerOptions.minZoom = basemap.minZoom;
            }
            if (basemap.maxZoom) {
                layerOptions.maxZoom = basemap.maxZoom;
            }
            L.TileLayer.prototype.initialize.call(this, osmUrl, layerOptions);
        } else if (basemap.provider.indexOf('stamen.') === 0) {
            var stamenMap = basemap.provider.substring(7);
            var stamenUrl = '//stamen-tiles-{s}.a.ssl.fastly.net/' + stamenMap + '/{z}/{x}/{y}.png';

            if (stamenMap === 'toner') {
                attrib = this._addAttributionPart(attrib, 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://www.openstreetmap.org/copyright">ODbL</a>.');
            } else {
                attrib = this._addAttributionPart(attrib, 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, under <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a>. Data by <a href="http://openstreetmap.org">OpenStreetMap</a>, under <a href="http://creativecommons.org/licenses/by-sa/3.0">CC BY SA</a>.');
            }
            attrib = this._addAttributionPart(attrib, appendAttribution);
            layerOptions = {
                minZoom: 2,
                maxNativeZoom: 18,
                maxZoom: 19,
                attribution: !disableAttribution ? attrib : '',
                subdomains: "abcd"
            };
            L.TileLayer.prototype.initialize.call(this, stamenUrl, layerOptions);
        } else if (basemap.provider.startsWith('jawg.') || basemap.provider === 'mapquest') {
            var jawgUrl = 'https://tiles.jawg.io/';
            var jawgMap;

            if (basemap.provider !== 'mapquest') {
                jawgMap = basemap.provider.substring(5);
            } else {
                jawgMap = 'streets';
            }

            if (jawgMap !== 'streets') {
                // The streets layer is at the root
                jawgUrl += 'jawg-' + jawgMap + '/';
            }

            jawgUrl += '{z}/{x}/{y}';
            //if (L.Browser.retina) {
            //    jawgUrl += '@2x';
            //}
            jawgUrl += '.png';
            if (basemap.jawg_apikey) {
               jawgUrl += '?api-key=' + basemap.jawg_apikey;
                if (basemap.jawg_d4cdomain) {
                    jawgUrl += '&d4cdomain=' + basemap.jawg_d4cdomain;
                }
            }

            attrib = this._addAttributionPart(attrib, 'Jawg streets © <a href="https://www.jawg.io" target="_blank">jawg</a> / <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a>');
            attrib = this._addAttributionPart(attrib, appendAttribution);

            layerOptions = {
                minZoom: 2,
                maxZoom: 22,
                attribution: !disableAttribution ? attrib : ''
            };
            L.TileLayer.prototype.initialize.call(this, jawgUrl, layerOptions);
        } else if (basemap.provider === 'custom') {
            if (basemap.subdomains) {
                layerOptions.subdomains = basemap.subdomains;
            }
            layerOptions.minZoom = basemap.minZoom || 2;
            if (basemap.maxZoom) {
                layerOptions.maxZoom = basemap.maxZoom;
            }
            if (basemap.strictTMS) {
                layerOptions.tms = true;
            }

            attrib = this._addAttributionPart(attrib, basemap.attribution);
            attrib = this._addAttributionPart(attrib, appendAttribution);

            layerOptions.attribution = !disableAttribution ? attrib : '';
            L.TileLayer.prototype.initialize.call(this, basemap.url, layerOptions);
        }
    }
});

L.D4CWMSTileLayer = L.TileLayer.WMS.extend({
    includes: D4CTileLayerMixin,
    initialize: function(options) {
        L.Util.setOptions(this, this.d4cOptions);
        L.Util.setOptions(this, options);
        this._initLayer(
            this.options.basemap,
            this.options.disableAttribution,
            this.options.prependAttribution,
            this.options.appendAttribution);
    },
    _initLayer: function(basemap, disableAttribution, prependAttribution, appendAttribution) {
        var layerOptions = {};
        var attrib = this._addAttributionPart('', prependAttribution);

        layerOptions.layers = basemap.layers;
        if (basemap.styles) {
            layerOptions.styles = basemap.styles;
        }
        if (basemap.tile_format){
            layerOptions.format = basemap.tile_format;
        }
        layerOptions.minZoom = basemap.minZoom || 2;
        if (basemap.maxZoom) {
            layerOptions.maxZoom = basemap.maxZoom;
        }
		layerOptions.crs = basemap.crs;
		layerOptions.version = "1.3.0";
        layerOptions.transparent = true;
        attrib = this._addAttributionPart(attrib, basemap.attribution);
        attrib = this._addAttributionPart(attrib, appendAttribution);

        layerOptions.attribution = !disableAttribution ? attrib : '';
        L.TileLayer.WMS.prototype.initialize.call(this, basemap.url, layerOptions);
    }
});
