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
;var app = angular.module('d4c-widgets');
app.config(function(D4CWidgetsConfigProvider) {
    D4CWidgetsConfigProvider.setConfig({
        customAPIHeaders: {
            "D4C-API-Analytics-App": "chartbuilder"
        }
    });
});
;var app = angular.module('d4c.frontend', ['d4c.core', 'd4c']);
app.value('ExploreConfig', {
    embedDatasetCard: false
});
app.value('initialChartContext', null);
;(function() {
    'use strict';
    var domain = window.location.protocol + '//' + window.location.host;
    var mod = angular.module('d4c.frontend');
    mod.controller('BigController', ['$scope', '$q', 'SearchAPI', 'translate', 'URLSynchronizer', '$location', 'AggregationHelper', 'ChartHelper', '$attrs', '$element', 'WidgetCodeBuilder', 'initialChartContext', function($scope, $q, SearchAPI, translate, URLSynchronizer, $location, AggregationHelper, ChartHelper, $attrs, $element, WidgetCodeBuilder, initialChartContext) {
        if (angular.isDefined($attrs.fullsize)) {
            var $main = $element.parents('main');
            $main.css({
                margin: 0
            });
            var resize = function() {
                $element.find('.d4c-chart').height($(window).height() - $main.offset().top);
            };
            $(window).on('resize', resize);
            resize();
        }
        $scope.initialChartContext = initialChartContext;
        $scope.noControls = true;
        $scope.chartContext = {};
        $scope.contexts = [];
        $scope.fakeMultiChartContext = {};
        $scope.loc = $location;
        $scope.$watch('loc.absUrl()', function(newValue, oldValue) {
            $scope.embed_url = ('' + $location.absUrl()).replace('/chart/', '/chart/embed/');
            $scope.export_url = ('' + $location.absUrl()).replace('/chart/', '/export/chart/embed/');
        });
        $scope.widgetCode = {
            'code': ''
        };
        $scope.$watch('chartContext.dataChart', function(nv, ov) {
            $scope.widgetCode.code = WidgetCodeBuilder.buildChartWidgetCode(nv);
        }, true);
        $scope.$watch('fakeMultiChartContext.datasets', function(nv, ov) {
            $scope.contexts = [];
            for (var key in nv) {
                if (nv.hasOwnProperty(key)) {
                    $scope.contexts.push(nv[key]);
                }
            }
        }, true);
    }
    ]);
}());
