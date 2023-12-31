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
/*
Draw the round marker, and the polygon on hover
 */
/*
new L.ClusterMarker(latlng, {
    color: null, // (optional) A color to drive the cluster drawing, else it can use all the color spectre to show density (from green to red)
    geojson: '', // GeoJSON shape of the cluster,
    value: '' // Cluster value (usually count),
    total: '' // Total number of entries, in order to calculate a ratio
});*/
L.ClusterMarker = L.FeatureGroup.extend({
    initialize: function(latlng, options) {
       L.FeatureGroup.prototype.initialize.call(this, []);
        var ratio = D4C.CalculationUtils.getValueOnScale(options.value, options.min, options.max, options.sizeFunction);
        // FIXME: A ratio should only be between 1 and 0. Right now, the calculations go very wrong with negative numbers.
        //
        //if (options.total === 0) {
        //    ratio = 1;
        //} else {
        //    ratio = options.value / options.total;
        //}
        //if (ratio < 0) {
        //    // A ratio superior to 1 is a bad idea, but it's still a better idea than a negative ratio. To be fixed...
        //    ratio = ratio * -1;
        //}
//console.log('ratio', ratio);
        var opacity = options.opacity || 1;
        var styles = this._getShapeStyle(options.color, opacity, ratio);

        if (options.geojson) {
            if (options.geojson.type !== 'Point') {
                this.addLayer(new L.GeoJSON(options.geojson, {style: styles['default']}));
                this._clusterShape = options.geojson;
            } else {
                this._clusterShape = [options.geojson.coordinates[1], options.geojson.coordinates[0]];
            }
        }

        this.addLayer(new L.Marker(latlng, {
            icon: this._getMarkerIcon(options.color,
                                      opacity,
                                      options.value,
                                      ratio,
                                      options.minSize,
                                      options.maxSize,
                                      options.borderOpacity,
                                      options.borderSize,
                                      options.borderColor,
                                      options.numberFormattingFunction)
        }));
        this._latlng = latlng;

        if (this._clusterShape) {
            // Handle the shape display on hovering
            this.on('mouseover', function(e) {
                if (e.originalEvent.which === 0) {
                    // Don't trigger this if there is a mouse button used (this is done to prevent triggering the style change
                    // during a map move, which triggers a cascade of moveend events)
                    e.target.setStyle(styles.highlight);
                }
            });
            this.on('mouseout', function(e) {
                if (e.originalEvent.which === 0) {
                    e.target.setStyle(styles['default']);
                }
            });
        }
    },
    getLatLng: function() {
        return this._latlng;
    },
    getClusterShape: function() {
        return this._clusterShape;
    },
    _getMarkerIcon: function(color,
                             opacity,
                             count,
                             ratio,
                             minSize,
                             maxSize,
                             borderOpacity,
                             borderSize,
                             borderColor,
                             numberFormattingFunction) {
        minSize = minSize || 3;
        maxSize = maxSize || 5;
        var bgcolor, textcolor, relativeBorderColor;
        if (!color) {
            if (ratio > 0.8) {
                color = "#FF4444";
            } else if (ratio > 0.6) {
                color = "orange";
            } else if (ratio > 0.4) {
                color = "#E5E533";
            } else {
                color = "#44BB44";
            }

            bgcolor = chroma(color);
            textcolor = chroma('#111111');
            relativeBorderColor = bgcolor;
        } else {
            bgcolor = chroma(color).brighter((1-ratio)*20);
            relativeBorderColor = chroma(borderColor).brighter((1-ratio)*20);
            textcolor = chroma(bgcolor).hsl()[2] > 0.7 ? chroma('#111111'): chroma('#EEEEEE');
        }

        var displayedNumber = count;
        if (numberFormattingFunction) {
            displayedNumber = numberFormattingFunction(count);
        }

        var realBorderColor = chroma(relativeBorderColor).alpha(borderOpacity);


        // The mix and max sizes of the cluster are configurable, so the text has to fit in it.
        // Min and max size are on a 1-10 scale
        var baseSizeUnit = 15;
        var realMinSize = baseSizeUnit * minSize;
        var realMaxSize = baseSizeUnit * maxSize;
        var relativeMaxSize = realMaxSize - realMinSize;
        var size = Math.ceil(relativeMaxSize * ratio) + realMinSize;

        //var textsize = 14 * (1+ratio/3);
        //var size = Math.max(displayedNumber.toString().length, 6) + 0 + 'ch';

        // We have the size in pixels
        //console.log('size in pixels', size);

        var textMargin = Math.floor(size / 5);
        var availableSizePerCharacter = (size - textMargin) / Math.max(displayedNumber.toString().length, 2); // Always account the space for at least 2 chars
        //console.log('availableSizePerCharacter', availableSizePerCharacter);
        var textSize = Math.ceil(availableSizePerCharacter * 1.5); // Empirically assume characters are 1.5-times as high as they are large.
        textSize = Math.min(textSize, 24); // 24px is the maximum size we want (looks ugly otherwise)

        //console.log('cluster size', size, 'margin', textMargin, 'available size per char', availableSizePerCharacter, 'text size', textSize);


        var sizeStyle = size + 'px';
        return L.divIcon({
            html: '<div class="cluster-marker-circle" ' +
                  '     style="width: ' + sizeStyle + '; ' +
                  '            height: ' + sizeStyle + '; ' +
                  '            background-color: ' + bgcolor.css() + '; ' +
                  '            border: solid ' + borderSize + 'px '+ realBorderColor.css('rgba') +'; ' +
                  '            top: calc(-'+sizeStyle+'/2); ' +
                  '            left: calc(-'+sizeStyle+'/2); ' +
                  '            opacity: ' + opacity + '; ' +
                  '            font-size: '+textSize+'px;">' +
                  '<span style="color: ' + textcolor.css() + '; line-height: ' + sizeStyle + ';">' + displayedNumber + '</span>' +
                  '</div>',
            className: 'cluster-marker'
        });
    },
    _getShapeStyle: function(color, opacity, ratio) {
        if (!color) {
            color = "#000000";
        }
        var shapeOpacity = opacity * ((ratio * 0.4) + 0.2);

        var highlightStyle = {
            color: color,
            fillOpacity: shapeOpacity,
            stroke: false
        };
        var defaultStyle = {
            color: color,
            fillOpacity: 0,
            stroke: false
        };
        return {
            "default": defaultStyle,
            "highlight": highlightStyle
        };
    }
});