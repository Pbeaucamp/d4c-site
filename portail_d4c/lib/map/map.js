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
L.D4CMap = L.Map.extend({
    options: {
        basemapsList: [],
        appendAttribution: null,
        prependAttribution: null,
        basemap: null,
        disableAttribution: false,
        attributionSeparator: ' - '
    },
    initialize: function (id, options) {
        L.Map.prototype.initialize.call(this, id, options);
        if (options) {
            this._setTilesProvider(
                this.options.basemapsList,
                this.options.prependAttribution,
                this.options.appendAttribution,
                this.options.basemap,
                this.options.disableAttribution,
                this.options.attributionSeparator,
				false
            );
        }
    },
    _setTilesProvider: function(basemapsList, prependAttribution, appendAttribution, selectedBasemap, disableAttribution, attributionSeparator, showAllOverlays) {
        // OSM Free (don't use in production)
        //var tilesUrl = 'http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
        //var attrib = 'Map data © OpenStreetMap contributors';
        //var tileLayer = new L.TileLayer(tilesUrl, {minZoom: 8, maxZoom: 18, attribution: attrib});
		showAllOverlays = showAllOverlays || false;
        var layers = [];
        var overlays = [];
        var layer;
        for (var i=0; i<basemapsList.length; i++) {
            var basemap = basemapsList[i];
            if (basemap.provider === 'custom_wms') {
				//basemap.crs = L.geoportalCRS.EPSG2154;
				//var resolutions = [0.05291677250021167, 0.13229193125052918, 0.19843789687579377, 0.26458386250105836, 0.5291677250021167, 1.3229193125052918, 1.9843789687579376, 2.6458386250105836, 3.3072982812632294, 3.9687579375158752, 6.614596562526459, 13.229193125052918, 19.843789687579378, 26.458386250105836, 33.0729828126323].reverse();					
				//customOptions.crs._scales = [125000, 100000, 75000, 50000, 25000, 15000, 12500, 10000, 7500, 5000, 2000, 1000, 750, 500, 200];					
				//var origin = [-35597500, 48953100];	
				//var bounds = L.bounds(L.point(926196.8437584117, 6838579.0594), L.point(942696.8439000174, 6853968.9932));//[926196.8437584117, 6838579.0594, 942696.8439000174, 6853968.9932];	
				//basemap.crs = new L.Proj.CRS("EPSG:2154","+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs", { origin:origin, resolutions:resolutions, bounds:bounds});
                layer = new L.D4CWMSTileLayer({
                    basemap: basemap,
                    prependAttribution: prependAttribution,
                    appendAttribution: appendAttribution,
                    disableAttribution: disableAttribution,
                    attributionSeparator: attributionSeparator
                });
            } else {
                layer = new L.D4CTileLayer({
                    basemap: basemap,
                    prependAttribution: prependAttribution,
                    appendAttribution: appendAttribution,
                    disableAttribution: disableAttribution,
                    attributionSeparator: attributionSeparator
                });
            }
            if (typeof layer.options.minZoom !== 'number') {
                layer.options.minZoom = 2;
            }
            layer.basemapLabel = basemap.label;
            layer.basemapId = basemap.id || basemap.name;
			
			if (basemap.provider === 'custom_wms' && basemap.type == "layer") {
				layer.options.opacity = 0.6;
				overlays.push(layer);
			} else {
				layers.push(layer);
			}
            
        }

        if (layers.length > 1 || overlays.length >= 1) {
            // Creating the control
            var layersControl = new L.Control.Layers(null, null, {
                position: 'bottomleft'
            });
            for (var j=0; j<layers.length; j++) {
                layer = layers[j];
                layersControl.addBaseLayer(layer, layer.basemapLabel);
            }
            for (var j=0; j<overlays.length; j++) {
                layer = overlays[j];
                layersControl.addOverlay(layer, layer.basemapLabel);
				if(showAllOverlays) this.addLayer(layer);
            }
            this.addControl(layersControl);
        }

        // Adding the default basemap
        if (selectedBasemap) {
            var selectedLayer = layers.filter(function(layer) { return layer.basemapId === selectedBasemap; });
            if (selectedLayer.length > 0) {
                this.addLayer(selectedLayer[0]);
            } else {
                this.addLayer(layers[0]);
            }
        } else if (layers.length > 0) {
            this.addLayer(layers[0]);
        }

    },
	
	_changeCRS: function(crs, maxBounds) {
		if(this._loaded) {
			var bbox = this.getBounds();
		}
		this.options.crs = crs;
		this.options.maxBounds = maxBounds;
		if(this._loaded) {
			//this._initialTopLeftPoint = this._getNewTopLeftPoint(this.getCenter());
			 this.setView(this.getCenter(),this.getZoom());
			 this.fitBounds(bbox);
			/*var corner1 = L.latLng(crs.options.bounds.min.x, crs.options.bounds.min.y),
				corner2 = L.latLng(crs.options.bounds.max.x, crs.options.bounds.max.y),
				bounds = L.latLngBounds(corner1, corner2);
			try{this.setMaxBounds(bounds);} catch(error){}*/
			//this.options.maxBounds = [[crs.options.bounds.min.x, crs.options.bounds.min.y], [crs.options.bounds.max.x, crs.options.bounds.max.y]];
		}
	},
	
	addLayer: function(layer) {
		if(layer.basemapId != undefined && layer instanceof L.D4CTileLayer){
			var crs, bounds;
			if(layer.options.basemap.crs == "EPSG:2154"){
				crs = new L.Proj.CRS("EPSG:2154",
						"+proj=lcc +lat_1=49 +lat_2=44 +lat_0=46.5 +lon_0=3 +x_0=700000 +y_0=6600000 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs", 
						{ 
						origin:layer.options.basemap.origin, 
						resolutions:layer.options.basemap.resolutions,
						matrixWidths:layer.options.basemap.matrixWidths,
						matrixHeights:layer.options.basemap.matrixHeights
						//bounds: L.bounds(L.point(layer.options.basemap.bbox[0], layer.options.basemap.bbox[1]), L.point(layer.options.basemap.bbox[2], layer.options.basemap.bbox[3]))
						});
				bounds = undefined;
				} else {
				crs = L.CRS.EPSG3857;
				var corner1 = L.latLng(-90, -240),
				corner2 = L.latLng(90, 240),
				bounds = L.latLngBounds(corner1, corner2);
			}
			this._changeCRS(crs, bounds);
		}
		L.Map.prototype.addLayer.call(this, layer);
	}
});