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
;if (typeof module !== 'undefined' && typeof exports !== 'undefined' && module.exports === exports) {
    module.exports = 'monospaced.elastic';
}
angular.module('monospaced.elastic', []).constant('msdElasticConfig', {
    append: ''
}).directive('msdElastic', ['$timeout', '$window', 'msdElasticConfig', function($timeout, $window, config) {
    'use strict';
    return {
        require: 'ngModel',
        restrict: 'A, C',
        link: function(scope, element, attrs, ngModel) {
            var ta = element[0]
              , $ta = element;
            if (ta.nodeName !== 'TEXTAREA' || !$window.getComputedStyle) {
                return;
            }
            $ta.css({
                'overflow': 'hidden',
                'overflow-y': 'hidden',
                'word-wrap': 'break-word'
            });
            var text = ta.value;
            ta.value = '';
            ta.value = text;
            var append = attrs.msdElastic ? attrs.msdElastic.replace(/\\n/g, '\n') : config.append, $win = angular.element($window), mirrorInitStyle = 'position: absolute; top: -999px; right: auto; bottom: auto;' + 'left: 0; overflow: hidden; -webkit-box-sizing: content-box;' + '-moz-box-sizing: content-box; box-sizing: content-box;' + 'min-height: 0 !important; height: 0 !important; padding: 0;' + 'word-wrap: break-word; border: 0;', $mirror = angular.element('<textarea aria-hidden="true" tabindex="-1" ' + 'style="' + mirrorInitStyle + '"/>').data('elastic', true), mirror = $mirror[0], taStyle = getComputedStyle(ta), resize = taStyle.getPropertyValue('resize'), borderBox = taStyle.getPropertyValue('box-sizing') === 'border-box' || taStyle.getPropertyValue('-moz-box-sizing') === 'border-box' || taStyle.getPropertyValue('-webkit-box-sizing') === 'border-box', boxOuter = !borderBox ? {
                width: 0,
                height: 0
            } : {
                width: parseInt(taStyle.getPropertyValue('border-right-width'), 10) + parseInt(taStyle.getPropertyValue('padding-right'), 10) + parseInt(taStyle.getPropertyValue('padding-left'), 10) + parseInt(taStyle.getPropertyValue('border-left-width'), 10),
                height: parseInt(taStyle.getPropertyValue('border-top-width'), 10) + parseInt(taStyle.getPropertyValue('padding-top'), 10) + parseInt(taStyle.getPropertyValue('padding-bottom'), 10) + parseInt(taStyle.getPropertyValue('border-bottom-width'), 10)
            }, minHeightValue = parseInt(taStyle.getPropertyValue('min-height'), 10), heightValue = parseInt(taStyle.getPropertyValue('height'), 10), minHeight = Math.max(minHeightValue, heightValue) - boxOuter.height, maxHeight = parseInt(taStyle.getPropertyValue('max-height'), 10), mirrored, active, copyStyle = ['font-family', 'font-size', 'font-weight', 'font-style', 'letter-spacing', 'line-height', 'text-transform', 'word-spacing', 'text-indent'];
            if ($ta.data('elastic')) {
                return;
            }
            maxHeight = maxHeight && maxHeight > 0 ? maxHeight : 9e4;
            if (mirror.parentNode !== document.body) {
                angular.element(document.body).append(mirror);
            }
            $ta.css({
                'resize': (resize === 'none' || resize === 'vertical') ? 'none' : 'horizontal'
            }).data('elastic', true);
            function initMirror() {
                var mirrorStyle = mirrorInitStyle;
                mirrored = ta;
                taStyle = getComputedStyle(ta);
                angular.forEach(copyStyle, function(val) {
                    mirrorStyle += val + ':' + taStyle.getPropertyValue(val) + ';';
                });
                mirror.setAttribute('style', mirrorStyle);
            }
            function adjust() {
                var taHeight, taComputedStyleWidth, mirrorHeight, width, overflow;
                if (mirrored !== ta) {
                    initMirror();
                }
                if (!active) {
                    active = true;
                    mirror.value = ta.value + append;
                    mirror.style.overflowY = ta.style.overflowY;
                    taHeight = ta.style.height === '' ? 'auto' : parseInt(ta.style.height, 10);
                    taComputedStyleWidth = getComputedStyle(ta).getPropertyValue('width');
                    if (taComputedStyleWidth.substr(taComputedStyleWidth.length - 2, 2) === 'px') {
                        width = parseInt(taComputedStyleWidth, 10) - boxOuter.width;
                        mirror.style.width = width + 'px';
                    }
                    mirrorHeight = mirror.scrollHeight;
                    if (mirrorHeight > maxHeight) {
                        mirrorHeight = maxHeight;
                        overflow = 'scroll';
                    } else if (mirrorHeight < minHeight) {
                        mirrorHeight = minHeight;
                    }
                    mirrorHeight += boxOuter.height;
                    ta.style.overflowY = overflow || 'hidden';
                    if (taHeight !== mirrorHeight) {
                        scope.$emit('elastic:resize', $ta, taHeight, mirrorHeight);
                        ta.style.height = mirrorHeight + 'px';
                    }
                    $timeout(function() {
                        active = false;
                    }, 1);
                }
            }
            function forceAdjust() {
                active = false;
                adjust();
            }
            if ('onpropertychange'in ta && 'oninput'in ta) {
                ta['oninput'] = ta.onkeyup = adjust;
            } else {
                ta['oninput'] = adjust;
            }
            $win.bind('resize', forceAdjust);
            scope.$watch(function() {
                return ngModel.$modelValue;
            }, function(newValue) {
                forceAdjust();
            });
            scope.$on('elastic:adjust', function() {
                initMirror();
                forceAdjust();
            });
            $timeout(adjust);
            scope.$on('$destroy', function() {
                $mirror.remove();
                $win.unbind('resize', forceAdjust);
            });
        }
    };
}
]);
;(function() {
    'use strict';
    var module = angular.module('d4c-widgets');
    module.directive('swaggerUi', ['ModuleLazyLoader', '$timeout', function(ModuleLazyLoader, $timeout) {
        return {
            restrict: 'A',
            template: '<div class="swagger-section"><div id="swagger-ui-container" class="swagger-ui-wrap"></div></div>',
            scope: {
                url: '@?',
                specs: '=?'
            },
            link: function(scope, element, attr) {
                ModuleLazyLoader('swagger-ui').then(function() {
                    var swaggerOptions = {
                        url: null,
                        dom_id: "swagger-ui-container",
                        supportedSubmitMethods: ['get', 'post', 'put', 'delete', 'patch'],
                        validatorUrl: null,
                        docExpansion: 'list',
                        onComplete: function(swaggerApi, swaggerUi) {
                            $timeout(function() {
                                SwaggerTranslator.translate();
                            }, 0);
                            $('pre code').each(function(i, e) {
                                hljs.highlightBlock(e)
                            });
                        },
                        onFailure: function(data) {
                            console.log("Unable to Load SwaggerUI");
                        }
                    };
                    scope.$watch('specs', function(specs) {
                        if (specs) {
                            swaggerOptions.spec = specs;
                            var swaggerUi = new SwaggerUi(swaggerOptions);
                            swaggerUi.load();
                        }
                    });
                    scope.$watch('url', function(url) {
                        if (url) {
                            swaggerOptions.url = url;
                            if (swaggerOptions.specs) {
                                delete (swaggerOptions.specs);
                            }
                            var swaggerUi = new SwaggerUi(swaggerOptions);
                            swaggerUi.load();
                        }
                    });
                });
            }
        };
    }
    ]);
}());
;(function() {
    var mod = angular.module('d4c.frontend', ['d4c', 'monospaced.elastic']);
    mod.config(['$provide', function($provide) {
        $provide.decorator('$browser', function($delegate) {
            var superUrl = $delegate.url;
            $delegate.url = function(url, replace) {
                if (url !== undefined) {
                    return superUrl(url.replace(/\%20/g, "+").replace(/@/g, "%40"), replace);
                } else {
                    return superUrl().replace(/\+/g, "%20").replace(/\%40/g, "@");
                }
            }
            ;
            return $delegate;
        });
    }
    ]);
    mod.value('DefaultCustomViewConfig', {
        'title': 'Vue personnalisée',
        'slug': 'custom',
        'icon': 'tachometer'
    });
    var app = angular.module('d4c-widgets');
    app.config(function(D4CWidgetsConfigProvider) {
        D4CWidgetsConfigProvider.setConfig({
            customAPIHeaders: {
                "D4C-API-Analytics-App": "explore"
            }
        });
    });
}());
;(function() {
    'use strict';
    var app = angular.module('d4c.frontend');
    app.directive('d4cDatasetSubscription', function() {
        return {
            restrict: 'E',
            replace: true,
            template: '' + '<div class="d4c-dataset-subscription">' + '   <button class="d4c-button d4c-dataset-subscription__button" ' + '           ng-click="toggle()" ' + '           ng-disabled="working || !loggedIn" ' + '           d4c-disabled-tooltip="!loggedIn" ' + '           translate="d4c-disabled-tooltip-text" d4c-disabled-tooltip-text="You need to be registered and logged in to subscribe to a dataset.">' + '       <span ng-if="!working">' + '           <span ng-if="!subscribed"><i class="fa fa-bell" aria-hidden="true"></i> <span translate>Follow</span></span>' + '           <span ng-if="subscribed">' + '               <span class="d4c-dataset-subscription__button-text--hovered"><i class="fa fa-ban d4c-dataset-subscription__icon-unsubscribe" aria-hidden="true"></i> <span translate>Unsubscribe</span></span>' + '               <span class="d4c-dataset-subscription__button-text--unhovered"><i class="fa fa-check d4c-dataset-subscription__icon-subscribed" aria-hidden="true"></i> <span translate>You are subscribed</span></span>' + '           </span>' + '       </span>' + '       <span ng-if="working">' + '           <d4c-spinner></d4c-spinner>' + '           <span ng-if="subscribed" translate>Unsubscribing</span>' + '           <span ng-if="unsubscribed" translate>Subscribing</span>' + '       </span>' + '   </button>' + '   <p class="d4c-dataset-subscription__message" ng-if="!subscribed" translate>By subscribing to this dataset, you can receive email notifications from the dataset\'s publisher if important changes happen.</p>' + '   <p class="d4c-dataset-subscription__message" ng-if="subscribed" translate>You will receive email notifications from the dataset\'s publisher if important changes happen.</p>' + '</div>',
            scope: {
                preset: '=',
                datasetId: '@',
                loggedIn: '='
            },
            controller: function($scope, CoreAPI) {
                $scope.subscribed = $scope.preset || false;
                $scope.working = false;
                $scope.toggle = function() {
                    $scope.working = true;
                    if ($scope.subscribed) {
                        CoreAPI.account.subscriptions.datasets.unsubscribe($scope.datasetId).success(function() {
                            $scope.subscribed = false;
                            $scope.working = false;
                        });
                    } else {
                        CoreAPI.account.subscriptions.datasets.subscribe($scope.datasetId).success(function() {
                            $scope.subscribed = true;
                            $scope.working = false;
                        });
                    }
                }
                ;
            }
        };
    });
}());
;(function() {
    'use strict';
    var app = angular.module('d4c.frontend');
    app.directive('d4cDatasetAttachments', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                dataset: '='
            },
            template: '' + '<div class="d4c-dataset-attachments" ng-show="dataset.attachments.length">' + '    <d4c-collapsible initially-expanded="true">' + '        <d4c-collapsible-above-fold>' + '            <h3 class="d4c-dataset-attachments__title" translate>Attachments</h3>' + '        </d4c-collapsible-above-fold>' + '        <d4c-collapsible-fold>' + '            <ul class="d4c-dataset-attachments__attachment-list">' + '                <li class="d4c-dataset-attachments__attachment" ng-repeat="attachment in dataset.attachments">' + '                    <a class="d4c-dataset-attachments__attachment-link d4c-button" d4c-resource-download-conditions ng-href="' + fetchPrefix() + '/d4c/api/datasets/1.0/{{dataset.datasetid}}/attachments/{{attachment.id}}/" rel="nofollow" target="_self">' + '                        <i class="fa fa-file" aria-hidden="true"></i>' + '                        <span title="{{attachment.title}}">{{attachment.title}}</span>' + '                    </a>' + '                </li>' + '            </ul>' + '        </d4c-collapsible-fold>' + '    </d4c-collapsible>' + '</div>'
        };
    });
}());
;(function() {
    'use strict';
    var app = angular.module('d4c.frontend');
    app.directive('d4cDatasetReuses', ['d4cNotificationService', '$http', 'config', 'AssetHelper', 'ReuseAPI', 'translate', 'd4cReCaptcha', function(d4cNotificationService, $http, config, AssetHelper, ReuseAPI, translate, d4cReCaptcha) {
        var formDataSupported = typeof FormData != 'undefined';
        return {
            restrict: 'E',
            replace: true,
            scope: {
                maxReuses: '=max',
                anonymousReuse: '=',
                loggedIn: '=',
                recaptchaPubKey: '@',
                config: '=',
                readonly: '=',
                datasetTitle: '@'
            },
            templateUrl: fetchPrefix() + '/sites/default/files/api/portail_d4c/templates/dataset-reuses.html',
            link: function(scope, element) {
                if (!formDataSupported) {
                    element.find('.choice_or, .d4c-reuses__upload-button').hide();
                }
                element.find('.d4c-reuses__upload-button').on('click', function(e) {
                    $(element).find('input[type=file]')[0].click();
                });
                var recaptchaPubKey = scope.recaptchaPubKey || config.RECAPTCHA_PUBLIC_KEY;
                scope.getRecaptchaValues = d4cReCaptcha(jQuery(element[0]).find('.g-recaptcha')[0], recaptchaPubKey, config.LANGUAGE);
                scope.types = {
                    visualization: "Visualisation",
                    application: "Application",
                    post: "Post",
                    article: "Article",
                    api: "API",
                    idea: "Idée"
                };
            },
            controller: function($scope, $element) {
                $scope.display_reuses = true;
                $scope.submitAllow = $scope.anonymousReuse || $scope.loggedIn;
                $scope.reuseForm = false;
                $scope.reuse = {};
                $scope.dirty = false;
                $scope.inProgress = false;
                $scope.error = false;
                $scope.extraReuses = false;
                $scope.uploadedFile = false;
                $scope.toggleExtraReuses = function() {
                    $scope.extraReuses = !$scope.extraReuses;
                }
                ;
                $scope.toogleReuseForm = function() {
                    $scope.reuseForm = !$scope.reuseForm;
                }
                ;
                $scope.upload = function(element) {
                    $scope.$apply(function() {
                        $scope.reuse.file = element.files[0] || null;
                        $scope.uploadedFile = !!element.files[0];
                    });
                    var input = $element.find('input.reuse_thumbnail_url');
                    input.val(element.files[0] ? element.files[0].name : '');
                    input.prop('disabled', !!element.files[0]);
                }
                ;
                $scope.reset = function() {
                    $scope.reuse.file = null;
                    $scope.uploadedFile = false;
                    $element.find('.d4c-reuses__upload-input').val('');
                    var input = $element.find('input.reuse_thumbnail_url');
                    input.val('');
                    input.prop('disabled', false);
                }
                ;
                $scope.$watch('reuse.thumbnail', function(nv) {
                    $element.find('.d4c-reuses__upload-button').prop('disabled', nv);
                });
                $scope.submitReuse = function() {
                    $scope.inProgress = true;
                    $scope.reuse.recaptcha = !$scope.loggedIn ? $scope.getRecaptchaValues() : {};
                    var data = angular.copy($scope.reuse);
                    data.recaptcha_response = $scope.reuse.recaptcha.response || '';
                    data.dataset_title = $scope.datasetTitle;
                    delete data.recaptcha;
                    delete data.file;
                    var success = function(data) {
                        $scope.dirty = false;
                        $scope.inProgress = false;
                        $scope.error = false;
                        if (data.status == 'reuse_created') {
                            $scope.success = translate('Your reuse has been successfully created.');
                        } else if (data.status == 'reuse_pending') {
                            $scope.success = translate('Your reuse will be reviewed soon.');
                        }
                    };
                    var error = function(data) {
                        $scope.inProgress = false;
                        $scope.success = false;
                        d4cNotificationService.markNotificationAsHandled(data);
                        if (data.status === 'captcha_techerror') {
                            $scope.error = translate('There has been an error during your request.');
                        } else if (data.status === 'captcha_failed') {
                            $scope.error = translate('You entered a wrong captcha.');
                        } else if (data.status === 'error') {
                            $scope.error = translate(data.message);
                        } else {
                            $scope.error = data.error;
                        }
                    };
                    if (formDataSupported) {
                        AssetHelper.post(ReuseAPI.save_url, $scope.reuse.file, $scope.config, data).then(success, error);
                    } else {
                        $http.post(ReuseAPI.save_url, $.param(data), {
                            headers: {
                                'Content-Type': 'application/x-www-form-urlencoded'
                            }
                        }).success(success).error(error);
                    }
                }
                ;
                $scope.$watch('reuse', function(nv, ov) {
                    if (nv !== ov) {
                        $scope.dirty = true;
                        if ($scope.success) {
                            $scope.success = false;
                            if (!$scope.loggedIn) {
                                $scope.refreshCaptcha();
                            }
                        }
                    }
                }, true);
                ReuseAPI.list().success(function(data) {
                    $scope.reuses = data.reuses;
                }).error(function(data) {
                    if (data.errorcode === 90001) {
                        d4cNotificationService.markNotificationAsHandled(data);
                        $scope.reuses = [];
                    }
                });
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var app = angular.module('d4c.frontend');
    app.directive('d4cDatasetMetadataBlock', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                metadataSchema: '=',
                values: '=',
                blacklist: '='
            },
            template: '' + '<div class="d4c-dataset-metadata-block">' + '    <div class="d4c-dataset-metadata-block__metadata" ng-repeat="meta in schema" ng-if="values[meta.name]" ng-switch="meta.name">' + '        <div class="d4c-dataset-metadata-block__metadata-name" ng-bind="translate(meta.label)"></div>' + '        <div class="d4c-dataset-metadata-block__metadata-value d4c-dataset-metadata-block__metadata-value--license" ng-switch-when="license" ng-bind-html="values[meta.name]|formatMeta:meta.type|prettyText|licenseLink|nofollow"></div>' + '        <div class="d4c-dataset-metadata-block__metadata-value" ng-switch-when="geographic_area"><d4c-dataset-metadata-geographic-area geojson-shape="values[meta.name]"></d4c-dataset-metadata-geographic-area></div>' + '        <div class="d4c-dataset-metadata-block__metadata-value" ng-switch-when="language" ng-bind-html="values[meta.name]|isocode_to_language"></div>' + '        <div class="d4c-dataset-metadata-block__metadata-value d4c-dataset-metadata-block__metadata-value--default" ng-switch-default ng-bind-html="values[meta.name]|formatMeta:meta.type|prettyText|licenseLink|nofollow"></div>' + '    </div>' + '</dl>',
            controller: function($scope, translate) {
                $scope.translate = translate;
                $scope.schema = angular.copy($scope.metadataSchema);
                if ($scope.blacklist) {
                    $scope.schema = $scope.metadataSchema.filter(function(meta) {
                        return $scope.blacklist.indexOf(meta.name) === -1;
                    });
                } else {
                    $scope.schema = $scope.metadataSchema;
                }
            }
        };
    });
    app.directive('d4cDatasetMetadataBlockSelector', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                metadataTemplates: '=',
                values: '='
            },
            template: '<div class="d4c-dataset-metadata-block-selector">' + '    <div ng-repeat="tpl in metadataTemplates" ng-show="tpl.name != \'semantic\' && values[tpl.name]">' + '       <h3>{{ tpl.title }}</h3>' + '       <d4c-dataset-metadata-block metadata-schema="tpl.schema" values="values[tpl.name]"></d4c-dataset-metadata-block>' + '    </div>' + '</div>',
            controller: function($scope) {}
        };
    });
    app.directive('d4cDatasetMetadataGeographicArea', function(ModuleLazyLoader, D4CWidgetsConfig) {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                geojsonShape: '='
            },
            template: '<div class="d4c-dataset-metadata-block__geographic-area"></div>',
            link: function(scope, element) {
                ModuleLazyLoader('leaflet').then(function() {
                    var map = new L.D4CMap(element[0],{
                        scrollWheelZoom: false,
                        basemapsList: [D4CWidgetsConfig.basemaps[0]],
                        disableAttribution: true
                    });
                    var layer = L.geoJson({
                        type: "Feature",
                        properties: {},
                        geometry: scope.geojsonShape
                    });
                    map.addLayer(layer);
                    map.fitBounds(layer.getBounds());
                });
            }
        };
    });
}());
;(function() {
    'use strict';
    var app = angular.module('d4c.frontend');
    app.directive('d4cDatasetApiConsole', function() {
        return {
            restrict: 'E',
            templateUrl: fetchPrefix() + '/sites/default/files/api/portail_d4c/templates/dataset-api-console.html',
            scope: {
                context: '='
            },
            controller: function($location, $scope, DebugLogger, ServiceDescription, SearchAPI) {
                DebugLogger.log('init api');
                $scope.specs = false;
                /*if($scope.context.dataset&&$scope.context.dataset.features.indexOf('api')!==-1){$scope.apiProxy=true;if($scope.context.dataset.extra_metas.explore.swagger_specifications){$scope.specs=JSON.parse($scope.context.dataset.extra_metas.explore.swagger_specifications);}else{SearchAPI.services.list($scope.context.dataset.datasetid).success(function(data){$scope.entrypoints=data;});}
return;}*/
                $scope.api = {
                    parameters: {}
                };
                $scope.service = ServiceDescription;
                var hierarchicalArrayToParams = function(service, params) {
                    var paramName, key;
                    for (var i = 0; i < service.parameters.length; i++) {
                        var parameter = service.parameters[i];
                        if (parameter.readonly === true && params[parameter.name]) {
                            delete params[parameter.name];
                        }
                        for (paramName in params) {
                            if (paramName.indexOf(parameter.name + '.') >= 0) {
                                delete params[paramName];
                            }
                        }
                        if (parameter.type === 'hierarchical' && params[parameter.name]) {
                            var object = params[parameter.name];
                            for (key in object) {
                                var name = parameter.name + '.' + key;
                                if (object[key].length) {
                                    params[name] = object[key];
                                }
                            }
                            delete params[parameter.name];
                        }
                    }
                };
                var hierarchicalParamsToArray = function(service, params) {
                    var key;
                    for (var i = 0; i < service.parameters.length; i++) {
                        var parameter = service.parameters[i];
                        if (parameter.type === 'hierarchical') {
                            var object = {};
                            for (key in params) {
                                if (key.indexOf(parameter.name + '.') >= 0) {
                                    var newKey = key.substr(key.indexOf('.') + 1);
                                    object[newKey] = params[key];
                                    delete params[key];
                                }
                            }
                            if (!$.isEmptyObject(object)) {
                                params[parameter.name] = object;
                            }
                        }
                    }
                };
                var watchApiParams = function(searchOptions) {
                    DebugLogger.log('api -> api.parameters watch -> refresh', $scope.api.parameters, searchOptions);
                    $.extend(searchOptions, $scope.api.parameters);
                    hierarchicalArrayToParams($scope.service, searchOptions);
                    DebugLogger.log('api -> api.parameters watch -> done', $scope.api.parameters, searchOptions);
                };
                var watchSearchOptions = function(apiParams) {
                    var key;
                    DebugLogger.log('api -> searchOptions watch -> refresh', apiParams, $scope.context.parameters);
                    for (key in apiParams) {
                        delete apiParams[key];
                    }
                    $.extend(apiParams, $scope.context.parameters);
                    $.extend(apiParams, $scope.staticSearchOptions);
                    hierarchicalParamsToArray($scope.service, apiParams);
                    DebugLogger.log('api -> searchOptions watch -> done', apiParams, $scope.context.parameters);
                };
                $scope.$watch('[api.parameters, context.parameters]', function(newValue, oldValue) {
                    var apiParams = newValue[0];
                    var searchOptions = newValue[1];
                    if (!angular.equals(newValue[0], oldValue[0])) {
                        watchApiParams(searchOptions);
                    } else {
                        watchSearchOptions(apiParams);
                    }
                }, true);
                var unwatchSchema = $scope.$watch('context.dataset', function(newValue) {
                    if (newValue && newValue.datasetid) {
                        unwatchSchema();
                        $scope.staticSearchOptions = {
                            dataset: $scope.context.dataset.datasetid,
                            facet: []
                        };
                        angular.forEach($scope.context.dataset.fields, function(field) {
                            if (field.annotations) {
                                for (var a = 0; a < field.annotations.length; a++) {
                                    var anno = field.annotations[a];
                                    if (anno.name === 'facet') {
                                        $scope.staticSearchOptions.facet.push(field.name);
                                        break;
                                    }
                                }
                            }
                        });
                        DebugLogger.log('api -> dataset watch', $scope.staticSearchOptions.facet);
                        $.extend($scope.api.parameters, $scope.staticSearchOptions);
                    }
                }, true);
            }
        };
    });
    app.factory('RecordsSearchParameters', ['translate', function(translate) {
        return [{
            'name': 'dataset',
            'readonly': true,
            'helptext': translate('Dataset ID')
        }, {
            'name': 'q',
            'helptext': translate('Full-text query')
        }/*,{'name':'lang','helptext':translate('2-letters language code for linguistic text features')}*/
        , {
            'name': 'rows',
            'type': 'integer',
            'default': 10,
            'helptext': translate('Number of rows in the result (default: 10)')
        }, {
            'name': 'start',
            'type': 'integer',
            'helptext': translate('Index of the first result to return (use for pagination)')
        }, {
            'name': 'sort',
            'helptext': translate('Sort expression (field or -field)')
        }, {
            'name': 'facet',
            'multiple': true,
            'readonly': true,
            'helptext': translate('Name of facets to enable in the results')
        }, {
            'name': 'refine',
            'type': 'hierarchical',
            'helptext': translate('Refinements to apply'),
            'hierarchy': [translate('Facet name'), translate('Value')]
        }/*,{'name':'exclude','type':'hierarchical','helptext':translate('Exclusions to apply'),'hierarchy':[translate('Facet name'),translate('Value')]},{'name':'geofilter.distance','helptext':translate('A WGS84 point and a distance in meters indicating a geo position for geo filtering')},{'name':'geofilter.polygon','type':'geo_polygon_2d','helptext':translate('A polygon, expressed as a list of WGS84 points (only one path polygons supported at the moment)')},{'name':'timezone','type':'text','helptext':translate('The timezone used to interpret dates and times in queries and records.'),'default':jstz.determine().name()}*/
        ];
    }
    ]);
    app.factory('ServiceDescription', ['RecordsSearchParameters', function(RecordsSearchParameters) {
        return {
            id: 'records_search',
            label: 'Records Search',
            description: 'Search for records inside a dataset',
            url: fetchPrefix() + '/d4c/api/records/1.0/search/',
            method: 'GET',
            parameters: RecordsSearchParameters
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var app = angular.module('d4c.frontend');
    app.directive('d4cDatasetApiProxyConsole', function() {
        return {
            restrict: 'E',
            templateUrl: fetchPrefix() + '/sites/default/files/api/portail_d4c/templates/dataset-api-proxy-console.html',
            scope: {
                context: '=',
                needConditionsAccepted: '=?',
                conditionsVersion: '=?'
            },
            controller: function($location, $scope, DebugLogger, ServiceDescription, SearchAPI, config) {
                $scope.config = config;
            }
        };
    });
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive("d4cDatasetExport", ['EPSG', function(EPSG) {
        return {
            restrict: 'E',
            templateUrl: fetchPrefix() + '/sites/default/files/api/portail_d4c/templates/dataset-export.html',
            scope: {
                context: '=',
                needConditionsAccepted: '=?',
                downloadTrackers: '=?',
                conditionsVersion: '=?',
                snapshots: '=?',
                shapefileExportLimit: '@',
                xiti: '=?'
            },
            replace: true,
            controller: function($scope, config, DebugLogger, SearchAPI) {
                DebugLogger.log('export table');
                $scope.config = config;
                $scope.exportParameters = {};
                $scope.snapshotList = [];
                $scope.context.wait().then(function() {
                    if ($scope.snapshots) {
                        SearchAPI.snapshots.list($scope.context.dataset.datasetid).success(function(data) {
                            $scope.snapshotList = data;
                        });
                    }
                });
                $scope.downloadTrackers = [];
                if ($scope.xiti) {
                    var xitiANXTracker = function(event, format, searchOptions) {
                        var clickPage = window.xtpage + '::export::' + format;
                        if (searchOptions) {
                            angular.forEach(searchOptions, function(value, key) {
                                if (value && (key === 'q' || key.indexOf('refine.') === 0 || key.indexOf('geofilter.polygon') === 0)) {
                                    clickPage += '::' + encodeURIComponent(key) + '-' + encodeURIComponent(value);
                                }
                            });
                        }
                        return xt_click(this, 'C', window.xtn2, clickPage, 'T');
                    };
                    $scope.downloadTrackers.push(xitiANXTracker);
                }
                if ($scope.context.dataset.extra_metas.exporters && $scope.context.dataset.extra_metas.exporters.additional_projections && $scope.context.dataset.extra_metas.exporters.additional_projections.length) {
                    $scope.epsgList = [{
                        label: 'WGS84 (EPSG:4326)',
                        value: ''
                    }];
                    angular.forEach($scope.context.dataset.extra_metas.exporters.additional_projections, function(epsg) {
                        $scope.epsgList.push({
                            label: EPSG.nameFromEPSG(epsg),
                            value: epsg
                        });
                    });
                    $scope.exportParameters.epsg = '';
                }
            }
        };
    }
    ]);
    mod.directive('d4cDatasetExportLink', function() {
        var encodeURIValue = function(key, value) {
            if (angular.isString(value)) {
                return '&' + key + '=' + encodeURIComponent(value);
            } else {
                var qs = '';
                angular.forEach(value, function(singleVal) {
                    qs += '&' + key + '=' + encodeURIComponent(singleVal);
                });
                return qs;
            }
        };
        return {
            restrict: 'EA',
            template: '' + '<div class="d4c-dataset-export-link">' + '    <span class="d4c-dataset-export-link__format-name">{{ formatLabel }}</span>' + '    <a rel="nofollow" ' + '       href="{{ buildUrl(false) }}" ' + '       ng-click="triggerTrackers($event, false)" ' + '       class="d4c-dataset-export-link__link"' + '       ng-class="{\'d4c-dataset-export-link__link--disabled\': isDatasetAboveLimit()}"' + '       target="_self"' + '       aria-label="Dataset export ({{ formatLabel }})"' + '       translate="aria-label">' + '        <i class="fa fa-download" aria-hidden="true"></i>' + '        <span translate aria-hidden="true">Whole dataset</span>' + '    </a>' + '    <a ng-if="isDataFiltered() && nhits>0" ' + '       rel="nofollow" ' + '       href="{{ buildUrl(true) }}" ' + '       class="d4c-dataset-export-link__link"' + '       ng-class="{\'d4c-dataset-export-link__link--disabled\': isCurrentDataAboveLimit()}"' + '       ng-click="triggerTrackers($event, true)" ' + '       target="_self">' + '        <i class="fa fa-download" aria-hidden="true"></i>' + '        <span translate>Only the {{ nhits }} selected records</span>' + '    </a>' + '    <div ng-show="isDatasetAboveLimit()"' + '       class="d4c-dataset-export-link__warning">' + '        <i class="fa fa-warning" aria-hidden="true"></i>' + '        <span translate>This export format is limited to {{ recordsLimit|number }} records. You can download a smaller part of the dataset by filtering it.</span>' + '    </div>' + '    <div class="d4c-export-link__explanations" ng-transclude></div>' + '</div>',
            scope: {
                context: '=',
                nhits: '=',
                formatLabel: '@',
                formatExtension: '@',
                recordsLimit: '@',
                downloadTrackers: '=',
                exportParameters: '='
            },
            replace: true,
            transclude: true,
            controller: ['$scope', function($scope) {
                var relevantParameters = ['q', 'geofilter.distance', 'geofilter.polygon', 'refine.', 'exclude.', 'disjunctive.'];
                var filterParameters = ['q', 'geofilter.distance', 'geofilter.polygon', 'refine.', 'exclude.'];
                var getSearchQueryString = function() {
                    var filteredParameters = {};
                    Object.keys($scope.context.parameters).map(function(key) {
                        var i = 0;
                        for (; i < relevantParameters.length; i++) {
                            if (key.startsWith(relevantParameters[i])) {
                                filteredParameters[key] = $scope.context.parameters[key];
                                break;
                            }
                        }
                    });
                    var p = JSON.stringify(filteredParameters);
                    p = p.replace(/\//g, "_slash_");
                    filteredParameters = JSON.parse(p);
                    return D4C.URLUtils.getAPIQueryString(filteredParameters);
                };
                $scope.isDataFiltered = function() {
                    for (var key in $scope.context.parameters) {
                        for (var i = 0; i < filterParameters.length; i++) {
                            var relevantName = filterParameters[i];
                            if (key.substring(0, relevantName.length) == relevantName && $scope.context.parameters[key] !== '') {
                                return true;
                            }
                        }
                    }
                    return false;
                }
                ;
                $scope.buildUrl = function(includeFilters) {
                    var url = fetchPrefix() + '/d4c/api/records/2.0/downloadfile/format=' + $scope.formatExtension;
                    if (includeFilters)
                        url += '&' + getSearchQueryString();
                    /*if($scope.context.dataset.metas.timezone){url+='&timezone='+$scope.context.dataset.metas.timezone;}else{url+='&timezone='+jstz.determine().name();}*/
                    url += '&resource_id=' + $scope.context.dataset.resourceCSVid;
                    if ($scope.context.parameters.source) {
                        url += '&source=' + $scope.context.parameters.source;
                    }
                    if ($scope.context.parameters.apikey) {
                        url += '&apikey=' + $scope.context.parameters.apikey;
                    }
                    if (['csv', 'xls'].indexOf($scope.formatExtension) > -1) {
                        url += '&use_labels_for_header=true&user_defined_fields=true';
                    }
                    angular.forEach($scope.exportParameters, function(value, key) {
                        if (value !== '' && value !== null) {
                            url += encodeURIValue(key, value);
                        }
                    });
                    return url;
                }
                ;
                $scope.triggerTrackers = function(event, includeFilters) {
                    updateNbDownload($scope.context.dataset.datasetid);
                    /*if(!$scope.downloadTrackers){return;}
for(var i=0;i<$scope.downloadTrackers.length;i++){$scope.downloadTrackers[i](event,$scope.formatExtension,includeFilters?$scope.context.parameters:null);}*/
                }
                ;
                $scope.isDatasetAboveLimit = function() {
                    return $scope.recordsLimit && ($scope.context.dataset.metas.records_count > $scope.recordsLimit);
                }
                ;
                $scope.isCurrentDataAboveLimit = function() {
                    return $scope.recordsLimit && ($scope.nhits > $scope.recordsLimit);
                }
                ;
            }
            ]
        };
    });
    mod.directive('d4cMandatoryLicense', ['translate', function(translate) {
        var isAccepted = function(storagePrefix, conditionsVersion, dataLicense) {
            var key = storagePrefix + '@accepted_conditions@' + conditionsVersion + '@' + dataLicense;
            return localStorage.getItem(key);
        };
        var setAccepted = function(storagePrefix, conditionsVersion, dataLicense) {
            var cleanupList = [];
            for (var i = 0; i < localStorage.length; i++) {
                var itemKey = localStorage.key(i);
                if ((itemKey.indexOf(storagePrefix + '@accepted_conditions@') === 0) && (itemKey.indexOf(storagePrefix + '@accepted_conditions@' + conditionsVersion + '@') !== 0)) {
                    cleanupList.push(itemKey);
                }
            }
            if (cleanupList.length > 0) {
                for (var j = 0; j < cleanupList.length; j++) {
                    localStorage.removeItem(cleanupList[j]);
                }
            }
            var key = storagePrefix + '@accepted_conditions@' + conditionsVersion + '@' + dataLicense;
            localStorage.setItem(key, true);
        };
        return {
            restrict: 'EA',
            scope: {
                active: '=',
                storagePrefix: '=',
                licenseName: '=',
                conditionsVersion: '=',
                action: '@'
            },
            replace: true,
            transclude: true,
            template: '' + '<div class="d4c-dataset-export__mandatory-license">' + '    <div ng-transclude></div>' + '    <div class="d4c-dataset-export__mandatory-license__license-content">' + '        <p>' + '            <span>{{actionText}}, <span translate>you need to accept the portal\'s <a href="/conditions">terms of use</a></span><span ng-hide="licenseName">.</span></span>' + '            <span ng-if="licenseName">' + '                <span translate>and the dataset\'s license</span>' + '                (<span ng-bind-html="licenseName|prettyText|licenseLink"></span>).' + '            </span>' + '        </p>' + '        <button class="d4c-button" type="button" ' + '                ng-click="accept()" >' + '            <i class="fa fa-check" aria-hidden="true"></i>' + '            <span translate>I accept the portal\'s terms of use and the license applicable to the dataset.</span>' + '        </button>' + '    </div>' + '</div>',
            link: function(scope, element) {
                var protectedElement = angular.element(element.children()[0]);
                var overlayElement = angular.element(element.children()[1]);
                if (scope.action === 'api') {
                    scope.actionText = translate('In order to access this API');
                } else if (scope.action === 'download') {
                    scope.actionText = translate('In order to download this dataset');
                } else {
                    console.error('Invalid action parameter for d4cMandatoryLicense.');
                }
                if (scope.active) {
                    if (!isAccepted(scope.storagePrefix, scope.conditionsVersion || '', scope.licenseName || '')) {
                        protectedElement.css('visibility', 'hidden');
                    } else {
                        overlayElement.css('display', 'none');
                    }
                    scope.accept = function() {
                        setAccepted(scope.storagePrefix, scope.conditionsVersion || '', scope.licenseName || '');
                        overlayElement.css('display', 'none');
                        protectedElement.css('visibility', 'visible');
                    }
                    ;
                } else {
                    overlayElement.css('display', 'none');
                }
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var app = angular.module('d4c.frontend');
    app.directive('disqus', ['$location', '$window', 'config', function($location, $window, config) {
        function disqus() {
            var dsq = document.createElement('script');
            dsq.type = 'text/javascript';
            dsq.async = true;
            dsq.src = '//' + $window.disqus_shortname + '.disqus.com/embed.js';
            (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
        }
        return {
            restrict: 'E',
            replace: true,
            scope: {
                'shortname': '@',
                'dataset': '='
            },
            template: '<div id="disqus_thread"></div>',
            link: function(scope) {
                scope.$watch('[shortname, dataset]', function() {
                    if (scope.shortname && scope.dataset && scope.dataset.datasetid) {
                        $window.disqus_shortname = scope.shortname;
                        $window.disqus_identifier = scope.dataset.datasetid;
                        $window.disqus_title = scope.dataset.metas.title;
                        $window.disqus_url = $location.absUrl();
                        $window.disqus_config = function() {
                            this.language = config.LANGUAGE;
                        }
                        ;
                        disqus();
                    }
                }, true);
            }
        };
    }
    ]);
    app.directive('disqusCount', ['$http', 'DebugLogger', function($http, DebugLogger) {
        function getApiUrl(api, api_key, forum, ident) {
            return 'https://disqus.com/api/3.0/' + api + '.jsonp' + '?api_key=' + api_key + '&forum=' + forum + '&thread=ident:' + ident + '&callback=JSON_CALLBACK';
        }
        function getThreadsApiUrl(api_key, forum, ident) {
            return getApiUrl('threads/details', api_key, forum, ident);
        }
        return {
            restrict: 'A',
            controller: function($scope, $element, $attrs) {
                $scope.disqus = {
                    'count': 0
                };
                $scope.apiKey = $attrs.disqusApiKey;
                $scope.shortname = $attrs.disqusShortname;
                $scope.datasetId = $attrs.disqusDatasetid;
                $scope.$watch('[apiKey, shortname, datasetId]', function() {
                    if ($scope.apiKey && $scope.shortname && $scope.datasetId) {
                        var url = getThreadsApiUrl($scope.apiKey, $scope.shortname, $scope.datasetId);
                        DebugLogger.log(url.replace('jsonp', 'json').substr(0, url.indexOf('&callback') - 1));
                        $http.jsonp(url).success(function(data) {
                            if (data.code === 0) {
                                DebugLogger.log('Disqus identifiers:', data.response.identifiers);
                                $scope.disqus.count = data.response.posts;
                            }
                        });
                    }
                }, true);
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.controller('ExploreDatasetController', ['$scope', 'SearchAPI', 'DefaultCustomViewConfig', function($scope, SearchAPI, DefaultCustomViewConfig) {
        $scope.$watch('ctx.parameters.tab', function(nv, ov) {
            if (nv) {
                delete $scope.ctx.parameters.tab;
                $scope.$broadcast('selectTab', 'main', nv);
            }
        });
        $scope.DefaultCustomViewConfig = DefaultCustomViewConfig;
        SearchAPI.metadata.basic().success(function(data) {
            $scope.basicTemplate = data.schema;
        });
        SearchAPI.metadata.interop().success(function(data) {
            $scope.interopTemplates = data;
        });
        var sendVisualizationAnalytics = function(vizType) {
            if (window.ga) {
                ga(function() {
                    var trackers = ga.getAll();
                    for (var i = 0; i < trackers.length; ++i) {
                        var tracker = trackers[i];
                        tracker.set('dimension2', vizType);
                        tracker.send('pageview');
                    }
                });
            }
        };
        var mobileParametersUnwatcher;
        $scope.toggleMobileFilters = function() {
            $scope.toggleState.expandedFilters = !$scope.toggleState.expandedFilters;
            if ($scope.toggleState.expandedFilters) {
                mobileParametersUnwatcher = $scope.$watch('ctx.parameters', function(nv, ov) {
                    if (!angular.equals(nv, ov)) {
                        $scope.toggleMobileFilters();
                    }
                });
            } else {
                mobileParametersUnwatcher();
            }
        }
        ;
        var tabsInitialized = false;
        $scope.$on('tabSelected', function(e, args) {
            if (!tabsInitialized) {
                tabsInitialized = true;
                return;
            }
            if (args.tabsName === 'main') {
                sendVisualizationAnalytics(args.selection);
            }
        });
        $scope.canAccessData = function() {
            return $scope.ctx.dataset.has_records && $scope.ctx.dataset.data_visible;
        }
        ;
        $scope.canAccessServices = function() {
            return $scope.ctx.dataset.hasFeature('api') && $scope.ctx.dataset.data_visible;
        }
        ;
        $scope.openMapfishapp = function(layerName, serviceUrl, format) {
            var parameters = "";
            if (format == "wms") {
                parameters = "?layername=" + layerName + "&owstype=WMS&owsurl=" + serviceUrl;
            }
            window.open('/mapfishapp' + parameters, '_blank');
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.service('d4cReCaptcha', ['$window', '$document', function($window, $document) {
        return function(element, recaptchaPubKey, lang) {
            var recaptchaWidgetId;
            var initCaptcha = function() {
                var recaptchaWidgetId = grecaptcha.render(element, {
                    'sitekey': recaptchaPubKey
                });
                if (typeof renderedCallback === "function") {
                    renderedCallback(recaptchaWidgetId);
                }
            };
            $($window).on('recaptchaReady', function() {
                initCaptcha();
            });
            var parent = $document[0].getElementsByTagName('script')[0];
            var onloadscript = $document[0].createElement('script');
            onloadscript.text = 'var recaptchaReadyCallback = function() {$(window).trigger("recaptchaReady");}';
            var recaptchascript = $document[0].createElement('script');
            recaptchascript.async = 1;
            recaptchascript.defer = 1;
            recaptchascript.src = 'https://www.google.com/recaptcha/api.js?render=explicit&onload=recaptchaReadyCallback&hl=' + lang;
            parent.parentNode.insertBefore(onloadscript, parent);
            onloadscript.parentNode.insertBefore(recaptchascript, onloadscript);
            return function() {
                return {
                    response: grecaptcha.getResponse(recaptchaWidgetId)
                };
            }
        }
        ;
    }
    ]);
}());
