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
;(function() {
    angular.module('d4c.frontend', ['d4c', 'd4c-widgets']);
}());
;(function() {
    'use strict';
    var app = angular.module('d4c.frontend');
    app.controller('MapbuilderController', ['$location', 'MapbuilderStorage', 'MapbuilderConfig', '$scope', '$timeout', function($location, MapbuilderStorage, MapbuilderConfig, $scope, $timeout) {
        var that = this;
        var slug = $location.path().split('/')[1];
        this.mapStorage = MapbuilderStorage(slug);
        if (MapbuilderConfig.mapConfig) {
            this.mapStorage.deserializeConfiguration(MapbuilderConfig.mapConfig).then(onConfigReady);
        } else {
            var configurationPromise = this.mapStorage.getConfiguration();
            if (configurationPromise === null) {
                onConfigReady(null);
            } else {
                configurationPromise.then(onConfigReady);
            }
        }
        function onConfigReady(configuration) {
            that.mapObject = configuration;
            if (that.mapObject === null) {
                if (that.mapStorage.isPersisted()) {}
                that.mapObject = {
                    persist_id: slug,
                    value: {
                        "singleLayer": false,
                        "layerSelection": true,
                        "searchBox": true,
                        "toolbarFullscreen": true,
                        "toolbarGeolocation": true,
                        "autoGeolocation": false,
                        "mapPresets": {},
                        "groups": []
                    }
                };
            }
            if (!that.mapStorage.isPersisted()) {
                var stopLocalStorageSync = $scope.$watch(function() {
                    var serializedConfig = that.mapStorage.serializeConfiguration(that.mapObject, true);
                    return serializedConfig;
                }, function(nv, ov) {
                    that.mapStorage.saveConfiguration(that.mapObject);
                }, true);
                that.mapStorage.onPersistStorage(stopLocalStorageSync);
            }
        }
        this.dynamicConfig = false;
        $scope.$on('startConfigurationEdition', function() {
            that.dynamicConfig = true;
        });
        $scope.$on('stopConfigurationEdition', function() {
            that.dynamicConfig = false;
        });
        $scope.interfaceMode = 'edition';
        $scope.$on('changeInterfaceMode', function(event, mode) {
            $scope.interfaceMode = mode;
            $timeout(function() {
                $scope.$broadcast('invalidateMapSize');
                $scope.$broadcast('mapRefresh');
                $scope.$broadcast('resizeMapDisplayControl');
            });
        });
        $scope.$on('fitBounds', function(e, bounds) {
            $scope.$broadcast('mapFitBounds', bounds);
        });
    }
    ]);
}());
;(function() {
    "use strict";
    var app = angular.module('d4c.frontend');
    app.service('MapbuilderStorage', ['ContextHelper', '$q', 'MapbuilderAPI', 'MapHelper', function(ContextHelper, $q, MapbuilderAPI, MapHelper) {
        var LOCALSTORAGE_PREFIX = "mapbuilder_";
        function getConfigurationFromLocalStorage(slug) {
            var stored = localStorage.getItem(LOCALSTORAGE_PREFIX + slug);
            return stored;
        }
        function getConfigurationFromServer(slug) {
            var deferred = $q.defer();
            MapbuilderAPI.get(slug).then(function(response) {
                deferred.resolve(response.data);
            });
            return deferred.promise;
        }
        function saveConfigurationToLocalStorage(slug, configurationString) {
            localStorage.setItem(LOCALSTORAGE_PREFIX + slug, configurationString);
        }
        function saveConfigurationToServer(slug, configurationString) {
            var deferred = $q.defer();
            MapbuilderAPI.save(slug, configurationString).then(function(response) {
                deferred.resolve(response.data.last_modification);
            });
            return deferred.promise;
        }
        function saveNewConfigurationToServer(configurationString) {
            var deferred = $q.defer();
            MapbuilderAPI.create(configurationString).then(function(response) {
                var data = response.data;
                deferred.resolve([data.persist_id, data.last_modification]);
            });
            return deferred.promise;
        }
        function deleteConfigurationFromLocalStorage(slug) {
            localStorage.removeItem(LOCALSTORAGE_PREFIX + slug);
        }
        function deleteConfigurationFromServer(slug) {
            return MapbuilderAPI['delete'](slug);
        }
        return function(slug) {
            if (slug) {
                var onPersistStorageCallbacks = [];
                return {
                    isPersisted: function() {
                        return slug[0] !== '+';
                    },
                    getConfiguration: function() {
                        if (this.isPersisted()) {
                            return getConfigurationFromServer(slug).then(this.deserializeConfiguration);
                        } else {
                            var configString = getConfigurationFromLocalStorage(slug);
                            if (angular.isDefined(configString)) {
                                return this.deserializeConfiguration(configString);
                            } else {
                                return null;
                            }
                        }
                    },
                    saveConfiguration: function(config) {
                        if (!angular.isObject(config)) {
                            console.error('Should not happen anymore: saveConfiguration on a string');
                        }
                        if (this.isPersisted()) {
                            return saveConfigurationToServer(slug, this.serializeConfiguration(config));
                        } else {
                            config.last_modification = (new Date()).toISOString();
                            if (config.value.groups.length) {
                                saveConfigurationToLocalStorage(slug, this.serializeConfiguration(config));
                            } else {
                                deleteConfigurationFromLocalStorage(slug);
                            }
                            var deferred = $q.defer();
                            deferred.resolve(config.last_modification);
                            return deferred.promise;
                        }
                    },
                    persistStorage: function(config) {
                        var deferred = $q.defer();
                        if (angular.isObject(config)) {
                            config = this.serializeConfiguration(config);
                        }
                        saveNewConfigurationToServer(config).then(function(result) {
                            deleteConfigurationFromLocalStorage(slug);
                            var newSlug = result[0]
                              , lastModified = result[1];
                            slug = newSlug;
                            onPersistStorageCallbacks.forEach(function(callback) {
                                callback(slug);
                            });
                            deferred.resolve([newSlug, lastModified]);
                        });
                        return deferred.promise;
                    },
                    onPersistStorage: function(callback) {
                        onPersistStorageCallbacks.push(callback);
                    },
                    serializeConfiguration: function(configuration, skipMetadata) {
                        skipMetadata = !!skipMetadata;
                        return JSON.stringify(configuration, function(key, value) {
                            if (typeof (value) === "function") {
                                return undefined;
                            }
                            if (key.substring(0, 2) === '$$') {
                                return undefined;
                            }
                            if (key[0] === '_') {
                                return undefined;
                            }
                            if (key === 'context' && value.dataset) {
                                var res = {
                                    datasetId: value.dataset.datasetid,
                                    parameters: value.parameters
                                };
                                if (value.source) {
                                    res.source = value.source;
                                }
                                return res;
                            }
                            if (skipMetadata) {
                                if (['last_modification'].indexOf(key) >= 0) {
                                    return undefined;
                                }
                            }
                            return value;
                        });
                    },
                    deserializeConfiguration: function(configuration) {
                        var deferred = $q.defer();
                        var contextPromises = [];
                        if (angular.isString(configuration)) {
                            configuration = angular.fromJson(configuration);
                        }
                        if (angular.isObject(configuration) && angular.isObject(configuration.value) && angular.isArray(configuration.value.groups)) {
                            configuration.value.groups.forEach(function(group) {
                                group.layers.forEach(function(layer) {
                                    MapHelper.MapConfiguration.createLayerId(layer);
                                    layer.context = ContextHelper.getDatasetContext(D4C.StringUtils.getRandomUUID(), layer.context.domainId || null, layer.context.datasetId, layer.context.parameters || {}, layer.context.source, layer.context.apikey);
                                    contextPromises.push(layer.context.wait());
                                });
                            });
                        }
                        var checkPromiseStatus = function(promise) {
                            return promise.$$state.status !== 2 && promise.$$state.status !== 0;
                        };
                        var resolvedPromises = function(promises) {
                            $q.all(promises).then(function() {
                                deferred.resolve(configuration);
                            }).catch(function() {
                                promises = promises.filter(checkPromiseStatus);
                                resolvedPromises(promises);
                            });
                        };
                        resolvedPromises(contextPromises);
                        return deferred.promise;
                    },
                    duplicate: function() {
                        var service = this;
                        var deferred = $q.defer();
                        if (this.isPersisted()) {
                            getConfigurationFromServer(slug).then(function(config) {
                                saveNewConfigurationToServer(config).then(function(result) {
                                    slug = result[0];
                                    deferred.resolve(slug);
                                });
                            });
                            return deferred.promise;
                        } else {
                            var config = getConfigurationFromLocalStorage(slug);
                            var configObject = JSON.parse(config);
                            configObject.persist_id = '+' + D4C.StringUtils.getRandomUUID(16);
                            slug = configObject.persist_id;
                            saveConfigurationToLocalStorage(slug, JSON.stringify(configObject));
                            deferred.resolve(slug);
                            return deferred.promise;
                        }
                    },
                    'delete': function() {
                        if (this.isPersisted()) {
                            return deleteConfigurationFromServer(slug);
                        } else {
                            var deferred = $q.defer();
                            deleteConfigurationFromLocalStorage(slug);
                            deferred.resolve();
                            return deferred.promise;
                        }
                    }
                };
            } else {
                return {
                    getLocalConfigurationList: function() {
                        var list = [];
                        Object.keys(localStorage).forEach(function(localKey) {
                            if (localKey.startsWith(LOCALSTORAGE_PREFIX)) {
                                list.push(JSON.parse(localStorage.getItem(localKey)));
                            }
                        });
                        list.sort(function(a, b) {
                            return a.last_modification < b.last_modification ? 1 : a.last_modification > b.last_modification ? -1 : 0;
                        });
                        return list;
                    },
                    getPersistedConfigurationList: function() {
                        var deferred = $q.defer();
                        MapbuilderAPI.list().then(function(response) {
                            deferred.resolve(response.data);
                        });
                        return deferred.promise;
                    }
                };
            }
        }
        ;
    }
    ]);
}());
;(function() {
    "use strict";
    var app = angular.module('d4c.frontend');
    var DEFAULT_CATEGORIES_COLORS = ['#6D7A87', '#619FC8', '#F7C87E', '#CB516D', '#F7AD84', '#5D9FA3', '#64905C', '#6A79B0', '#E87273', '#8A65A9', '#B060A3'];
    app.service('MapbuilderHelper', ['$window', '$q', 'D4CAPI', function($window, $q, D4CAPI) {
        return {
            limitDecimalsFloor: D4C.NumberUtils.limitDecimalsFloor,
            limitDecimalsCeil: D4C.NumberUtils.limitDecimalsCeil,
            limitDecimals: D4C.NumberUtils.limitDecimals,
            getMapURL: function() {
                return $window.location.href.substring(0, $window.location.href.length - "edit/".length);
            },
            generateNumericRanges: function(min, max, tiers, computing) {
                var increments;
                if (tiers <= 1) {
                    console.error('Cannot calculate ranges for less than 2 tiers.');
                }
                if (tiers > 10) {
                    console.error('Cannot calculate ranges for more than 10 tiers');
                }
                if (angular.isUndefined(computing)) {
                    computing = 'linear';
                }
                if (computing === 'linear') {
                    increments = (max - min) / tiers;
                } else if (computing === 'log') {
                    increments = 10 / tiers;
                }
                increments = +increments;
                var i, currentStep = min, newStep = currentStep;
                var steps = [];
                for (i = 0; i < tiers; i++) {
                    if (computing === 'log') {
                        if (i === 0) {
                            currentStep = 0;
                        }
                        currentStep += increments;
                        newStep = Math.exp(currentStep);
                        var y2 = Math.exp(10);
                        var y1 = Math.exp(0);
                        newStep = (newStep - y1) * (max - min) / (y2 - y1) + min;
                    } else {
                        currentStep += increments;
                        newStep = currentStep;
                    }
                    if (i === tiers - 1) {
                        newStep = max;
                    }
                    steps.push(+newStep);
                }
                return steps;
            },
            generateCategories: function(colorConfiguration, values) {
                var categories = colorConfiguration.categories;
                angular.forEach(categories, function(color, value) {
                    if (values.indexOf(value) === -1) {
                        delete categories[value];
                    }
                });
                var c = 0;
                values.forEach(function(value) {
                    if (angular.isUndefined(categories[value])) {
                        categories[value] = DEFAULT_CATEGORIES_COLORS[c];
                        if (c === DEFAULT_CATEGORIES_COLORS.length - 1) {
                            c = 0;
                        } else {
                            c += 1;
                        }
                    }
                });
            },
            generateChoroplethRanges: function(colorConfiguration, min, max, tiers, colorBounds, gradientType, computing) {
                var rangesUpperBounds = this.generateNumericRanges(D4C.NumberUtils.limitDecimals(min, 5), D4C.NumberUtils.limitDecimals(max, 5), tiers, computing);
                var colors = chroma.scale(colorBounds).mode(gradientType).domain([0, 1], tiers).colors();
                var maxStr = (D4C.NumberUtils.limitDecimals(max, 5)).toString();
                var minStr = (D4C.NumberUtils.limitDecimals(min, 5)).toString();
                var allowedDigitsAfterComma;
                if (maxStr.indexOf('.') === -1 && minStr.indexOf('.') === -1) {
                    var amplitude = (max - min).toString().length;
                    allowedDigitsAfterComma = Math.max(0, 5 - amplitude);
                    allowedDigitsAfterComma = Math.min(allowedDigitsAfterComma, rangesUpperBounds.reduce(function(sofar, current) {
                        current = (D4C.NumberUtils.limitDecimals(current, 5)).toString();
                        if (current.indexOf('.') === -1) {
                            return sofar;
                        } else {
                            return Math.max(sofar, current.length - current.indexOf('.') - 1);
                        }
                    }, 0));
                } else if (maxStr.indexOf('.') !== -1) {
                    allowedDigitsAfterComma = maxStr.length - maxStr.indexOf('.') - 1;
                } else {
                    allowedDigitsAfterComma = minStr.length - minStr.indexOf('.') - 1;
                }
                rangesUpperBounds = rangesUpperBounds.map(function(f) {
                    if (allowedDigitsAfterComma > 0) {
                        return f.toFixed(allowedDigitsAfterComma);
                    } else {
                        return Math.round(f).toString();
                    }
                });
                angular.forEach(colorConfiguration.ranges, function(color, upperBound) {
                    if (rangesUpperBounds.indexOf(upperBound) === -1) {
                        delete colorConfiguration.ranges[upperBound];
                    }
                });
                var c = 0;
                rangesUpperBounds.forEach(function(value) {
                    colorConfiguration.ranges[value] = colors[c].toUpperCase();
                    c++;
                });
            }
        };
    }
    ]);
}());
;(function() {
    "use strict";
    var app = angular.module('d4c.frontend');
    app.factory('MapbuilderDisplayModes', ['translate', function(translate) {
        return [{
            display: 'auto',
            label: translate('Dots and shapes'),
            description: translate('All dots and shapes are displayed, in a single color'),
            previewUrl: '/sites/default/files/api/portail_d4c/img/dots_and_shapes.svg'
        }, {
            display: 'clusters',
            label: translate('Cluster'),
            description: translate('Data is clustered, with an aggregation option'),
            previewUrl: '/sites/default/files/api/portail_d4c/img/clusters.svg'
        }, {
            display: 'choropleth',
            label: translate('Choropleth'),
            description: translate('Data is displayed using a color scale based on a variable'),
            previewUrl: '/sites/default/files/api/portail_d4c/img/choropleth.svg',
            requiresShapeAggregation: true,
            requiresType: ['int', 'double']
        }, {
            display: 'categories',
            label: translate('Color by category'),
            description: translate('Data is displayed using a text — color mapping'),
            previewUrl: '/sites/default/files/api/portail_d4c/img/categories.svg',
            requiresType: ['text']
        }, {
            display: 'heatmap',
            label: translate('Heatmap'),
            description: translate('Data is aggregated to represent density based on a variable'),
            previewUrl: '/sites/default/files/api/portail_d4c/img/heatmap.svg'
        }];
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.factory("SignupAPI", ["APIXHRService", function(APIXHRService) {
        var API_PATH = '/api/signup/';
        return {
            'is_logged_in': function() {
                return APIXHRService('GET', API_PATH + 'is_logged_in/');
            },
            'check_identity': function(identity) {
                return APIXHRService('GET', API_PATH + 'check_identity/', {
                    identity: identity
                });
            },
            'create_account': function(email, password, confirmPassword) {
                return APIXHRService('GET', API_PATH + 'create_account/', {
                    email: email,
                    password: password,
                    confirm_password: confirmPassword
                });
            },
            'validate_account': function(validationCode) {
                return APIXHRService('GET', API_PATH + 'validate_account/', {
                    validation_code: validationCode
                });
            },
            'login_account': function(identity, password) {
                return APIXHRService('GET', API_PATH + 'login_account/', {
                    identity: identity,
                    password: password
                });
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderMainPanel', ['$document', 'keypressHelper', '$window', 'translate', 'SignupAPI', 'MapbuilderConfig', function($document, keypressHelper, $window, translate, SignupAPI, MapbuilderConfig) {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-main-panel.html',
            scope: {
                mapObject: '=',
                mapStorage: '='
            },
            controller: ['$scope', '$location', function($scope, $location) {
                $scope.working = false;
                $scope.interfaceMode = 'edition';
                $scope.placeholder = translate('Type your map name here');
                var mapConfigurationProperties = ['searchBox', 'toolbarFullscreen', 'toolbarGeolocation', 'autoGeolocation', 'layerSelection'];
                $scope.startMapConfiguration = function(event) {
                    $scope.mapConfiguration = angular.copy($scope.mapObject.value);
                    angular.forEach(Object.keys($scope.mapConfiguration), function(property) {
                        if (mapConfigurationProperties.indexOf(property) === -1) {
                            delete mapConfigurationProperties[property];
                        }
                    });
                    $scope.showConfigurationModal(event);
                }
                ;
                $scope.saveMapConfiguration = function() {
                    angular.forEach(mapConfigurationProperties, function(property) {
                        $scope.mapObject.value[property] = angular.copy($scope.mapConfiguration[property]);
                    });
                    $scope.hideConfigurationModal();
                }
                ;
                $scope.persistMapFirstTime = function(onSuccess) {
                    $scope.mapStorage.persistStorage($scope.mapObject).then(function(result) {
                        var slug = result[0]
                          , lastModified = result[1];
                        $scope.working = false;
                        $scope.lastModified = lastModified;
                        $scope.mapObject.persist_id = slug;
                        $location.path('/' + slug + '/edit/');
                        if (onSuccess) {
                            onSuccess();
                        }
                    });
                }
                ;
                var saveMapFirstTime = function() {
                    $scope.working = true;
                    $scope.persistMapFirstTime(function() {
                        $scope.working = false;
                        $scope.resetDirtyness();
                    });
                };
                $scope.saveMap = function() {
                    if ($scope.mapStorage.isPersisted()) {
                        $scope.working = true;
                        $scope.mapStorage.saveConfiguration($scope.mapObject).then(function(lastModified) {
                            $scope.working = false;
                            $scope.lastModified = lastModified;
                            $scope.resetDirtyness();
                        });
                    } else if (MapbuilderConfig.userLoggedIn) {
                        saveMapFirstTime();
                    } else {
                        SignupAPI.is_logged_in().success(function(response) {
                            if (response.logged_in) {
                                saveMapFirstTime();
                            } else {
                                $scope.startSignupProcess();
                            }
                        });
                    }
                }
                ;
                $scope.triggerButton = function(e) {
                    e.preventDefault();
                    if ($scope.mapObject.title && !$scope.working && ($scope.dirty || !$scope.mapStorage.isPersisted())) {
                        $scope.saveMap();
                    }
                }
                ;
                keypressHelper('keydown', $scope, $document, {
                    'uiKeydown': "{'ctrl-S': 'triggerButton($event);', 'meta-S': 'triggerButton($event);'}"
                });
                $scope.resetDirtyness = function() {
                    $scope.dirty = false;
                    if ($scope.mapStorage.isPersisted()) {
                        var unwatchDirty = $scope.$watch(function(scope) {
                            return scope.mapStorage.serializeConfiguration(scope.mapObject, true);
                        }, function(nv, ov) {
                            if (!angular.equals(nv, ov)) {
                                $scope.dirty = true;
                                unwatchDirty();
                            }
                        });
                    }
                }
                ;
                $scope.$watch('interfaceMode', function(nv) {
                    $scope.$emit('changeInterfaceMode', nv);
                });
                $window.addEventListener('beforeunload', function(e) {
                    if ($scope.dirty) {
                        var confirmationMessage = translate("You have unsaved changes, are you sure you want to leave?");
                        (e || $window.event).returnValue = confirmationMessage;
                        return confirmationMessage;
                    }
                });
                $scope.resetDirtyness();
				SignupAPI.is_logged_in().success(function(response) {
					MapbuilderConfig.userLoggedIn = response.logged_in;
					MapbuilderConfig.userActivationPending = response.pending;
				});
            }
            ]
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderDatasetsPanel', ['config', 'translate', function(config, translate) {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-datasets-panel.html',
            scope: {
                mapConfig: '='
            },
            controller: ['$scope', 'ContextHelper', 'MapHelper', 'MapbuilderDisplayModes', 'shortSummaryFilter', function($scope, ContextHelper, MapHelper, MapbuilderDisplayModes, shortSummaryFilter) {
                var that = this;
                $scope.datasetSelectionPresets = function() {
                    return {
                        catalogParameters: {
                            'refine.features': 'geo'
                        }
                    };
                }
                ;
                this.datasetSelectionPresets = $scope.datasetSelectionPresets;
                $scope.datasetSelectionCallback = function(selection) {
                    addDataset(selection.datasetId, selection.domainId, selection.datasetParameters, selection.source);
                }
                ;
                this.datasetSelectionCallback = $scope.datasetSelectionCallback;
                $scope.editLayer = function(layer, group) {
                    $scope.editingLayer = layer;
                    $scope.editing = true;
                    $scope.group = group;
                }
                ;
                $scope.editGroup = function(group) {
                    $scope.editingGroup = group;
                    $scope.editing = true;
                }
                ;
                this.closeLayerEdition = function() {
                    $scope.editingLayer = null;
                    $scope.editing = null;
                    that.stopConfigurationEdition();
                }
                ;
                this.closeGroupEdition = function() {
                    $scope.editingGroup = null;
                    $scope.editing = null;
                }
                ;
                function addDataset(datasetId, domainId, datasetParameters, source) {
                    if (domainId === config.DOMAIN_ID) {
                        source = null;
                    }
                    if (source === 'central') {
                        datasetId += '@' + domainId;
                    }
                    var context = ContextHelper.getDatasetContext(D4C.StringUtils.getRandomUUID(), null, datasetId, datasetParameters || {}, source);
                    context.wait().then(function() {
                        var layer = {
                            context: context,
                            display: 'auto',
                            caption: true,
                            color: MapHelper.DEFAULT_MARKER_COLOR,
                            title: context.dataset.metas.title,
                            description: shortSummaryFilter(context.dataset.metas.description, 200)
                        };
                        MapHelper.MapConfiguration.setLayerDisplaySettingsFromDefault(layer);
                        $scope.mapConfig.value.groups.push({
                            'displayed': true,
                            'layers': [layer]
                        });
                        $scope.zoomToLayer(layer);
                    });
                }
                $scope.zoomToLayer = function(layer) {
                    MapHelper.retrieveBounds([layer.context]).then(function(bounds) {
                        $scope.$emit('fitBounds', bounds);
                    });
                }
                ;
                $scope.getLayerTooltip = function(layer) {
                    var html = '' + '<div>' + '   <div class="d4c-mapbuilder__datasets-panel__dataset-tooltip-title">{title}</div>' + '   <div class="d4c-mapbuilder__datasets-panel__dataset-tooltip-filters">{filters}</div>' + '   <div class="">{display}</div>' + '</div>';
                    var displayMode = MapbuilderDisplayModes.filter(function(m) {
                        return m.display === layer.display;
                    });
                    if (displayMode.length) {
                        displayMode = displayMode[0].label;
                    } else {
                        displayMode = layer.display;
                    }
                    var textFilters = []
                      , refineFilters = [];
                    angular.forEach(layer.context.parameters, function(value, key) {
                        if (key === 'q' || key.startsWith('q.')) {
                            textFilters.push(value);
                        }
                        if (key.startsWith('refine.')) {
                            refineFilters.push([key.substring(7), value]);
                        }
                    });
                    var filters = '';
                    refineFilters.forEach(function(f) {
                        var fieldLabel = layer.context.dataset.getFieldLabel(f[0]);
                        var text = format_string(translate('Filtered by {fieldLabel}: {value}'), {
                            fieldLabel: fieldLabel,
                            value: f[1],
                        });
                        filters += '<div>' + text + '</div>';
                    });
                    textFilters.forEach(function(f) {
                        var text = format_string(translate('Filtered with: {filter}'), {
                            filter: f
                        });
                        filters += '<div>' + text + '</div>';
                    });
                    if (!filters) {
                        filters = translate('Complete dataset');
                    }
                    if (layer.context.dataset !== null) {
                        var title = D4C.StringUtils.escapeHTML(layer.context.dataset.metas.title);
                        return format_string(html, {
                            title: title,
                            filters: filters,
                            display: displayMode
                        });
                    } else {
                        return format_string(html, {
                            title: translate('This layer contains an unknown dataset.'),
                            filters: '',
                            display: ''
                        });
                    }
                }
                ;
                this.removeLayer = function(layerToRemove) {
                    that.closeLayerEdition();
                    $scope.mapConfig.value.groups.forEach(function(group, groupIndex) {
                        group.layers.forEach(function(layer, layerIndex) {
                            if (layerToRemove === layer) {
                                group.layers.splice(layerIndex, 1);
                            }
                            if (group.layers.length === 0) {
                                $scope.mapConfig.value.groups.splice(groupIndex, 1);
                            }
                        });
                    });
                }
                ;
                this.startConfigurationEdition = function() {
                    $scope.$emit('startConfigurationEdition');
                }
                ;
                this.stopConfigurationEdition = function() {
                    $scope.$emit('stopConfigurationEdition');
                }
                ;
                $scope.$on('$destroy', this.stopConfigurationEdition);
            }
            ]
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderLayerEdition', [function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-layer-edition.html',
            scope: {
                layer: '=',
                group: '='
            },
            require: '^d4cMapbuilderDatasetsPanel',
            controller: ['$scope', '$q', 'D4CAPI', 'MapHelper', function($scope, $q, D4CAPI, MapHelper) {
                $scope.minZoomLevel = 1;
                $scope.maxZoomLevel = 22;
                $scope.zoomVisibility = angular.isDefined($scope.layer.showZoomMin) && angular.isDefined($scope.layer.showZoomMax);
                $scope.layerStatistics = {};
                $scope.startConfigurationEdition = function() {
                    $scope.$emit('startConfigurationEdition');
                }
                ;
                $scope.stopConfigurationEdition = function() {
                    $scope.$emit('stopConfigurationEdition');
                }
                ;
                $scope.selectPanel = function(panel) {
                    $scope.activePanel = panel;
                }
                ;
                $scope.startConfigurationEdition();
                if ($scope.layer.context.dataset !== null) {
                    $scope.selectPanel('layers');
                } else {
                    $scope.selectPanel('remove');
                }
                $scope.layerZoomVisibility = function() {
                    $scope.layer.showZoomMin = $scope.layer.showZoomMin || $scope.minZoomLevel;
                    $scope.layer.showZoomMax = $scope.layer.showZoomMax || $scope.maxZoomLevel;
                    $scope.zoomVisibility = !$scope.zoomVisibility;
                    if (!$scope.zoomVisibility) {
                        delete $scope.layer.showZoomMin;
                        delete $scope.layer.showZoomMax;
                    }
                }
                ;
                $scope.fetchLayerStatistics = function() {
                    var calls = [D4CAPI.records.boundingbox($scope.layer.context, $scope.layer.context.parameters)];
                    if ($scope.layer.context.dataset.hasFieldType('geo_shape')) {
                        //calls.push(D4CAPI.records.geopolygon($scope.layer.context, $scope.layer.context.parameters));
                    }
                    $q.all(calls).then(function(results) {
                        var bboxResult = results[0].data;
                        $scope.layerStatistics.count = bboxResult.count;
                        $scope.layerStatistics.hasShapes = angular.isUndefined(bboxResult.geometries.Point) || bboxResult.geometries.Point < bboxResult.count;
                        $scope.layerStatistics.hasPoints = angular.isDefined(bboxResult.geometries.Point);
                        $scope.layerStatistics.hasLines = angular.isDefined(bboxResult.geometries.LineString) || angular.isDefined(bboxResult.geometries.MultiLineString);
                        if (results.length === 2) {
                            var shapesResult = results[1].data;
                            $scope.layerStatistics.aggregatedShapes = shapesResult.count.max > 1;
                        } else {
                            $scope.layerStatistics.aggregatedShapes = false;
                        }
                    });
                }
                ;
                if ($scope.layer.context.dataset !== null) {
                    $scope.fetchLayerStatistics();
                }
                $scope.zoomToLayer = function(layer) {
                    MapHelper.retrieveBounds([layer.context]).then(function(bounds) {
                        $scope.$emit('fitBounds', bounds);
                    });
                }
                ;
            }
            ],
            link: function(scope, element, attrs, datasetsPanelCtrl) {
                scope.removeLayer = function() {
                    datasetsPanelCtrl.removeLayer(scope.layer);
                    scope.stopConfigurationEdition();
                }
                ;
                scope.closeLayerEdition = function() {
                    datasetsPanelCtrl.closeLayerEdition();
                }
                ;
                scope.datasetSelectionPresets = function() {
                    var presets = datasetsPanelCtrl.datasetSelectionPresets();
                    presets.datasetId = scope.layer.context.dataset.datasetid;
                    presets.datasetParameters = scope.layer.context.parameters;
                    if (scope.layer.context.source) {
                        presets.source = scope.layer.context.source;
                    }
                    return presets;
                }
                ;
                scope.datasetSelectionCallback = function(selection) {
                    scope.layer.context.parameters = selection.datasetParameters;
                    scope.fetchLayerStatistics();
                }
                ;
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderGroupEdition', [function() {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-group-edition.html',
            scope: {
                group: '='
            },
            require: '^d4cMapbuilderDatasetsPanel',
            controller: ['$scope', function($scope) {
                $scope.selectPanel = function(panel) {
                    $scope.activePanel = panel;
                }
                ;
                $scope.selectPanel('informations');
            }
            ],
            link: function(scope, element, attrs, datasetsPanelCtrl) {
                scope.closeGroupEdition = function() {
                    datasetsPanelCtrl.closeGroupEdition();
                }
                ;
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderGroupConfigurationInformations', [function() {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-group-configuration-informations.html',
            scope: {
                group: '='
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderModalShare', ['SignupAPI', 'MapbuilderConfig', 'translate', function(SignupAPI, MapbuilderConfig, translate) {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-modal-share.html',
            controller: ['$scope', '$window', 'MapbuilderHelper', 'WidgetCodeBuilder', function($scope, $window, MapbuilderHelper, WidgetCodeBuilder) {
                $scope.loggedIn = MapbuilderConfig.userLoggedIn;
                $scope.activationPending = MapbuilderConfig.userActivationPending;
                $scope.sizes = [{
                    name: 'small',
                    label: '400 x 300',
                    width: 400,
                    height: 300
                }, {
                    name: 'medium',
                    label: '600 x 450',
                    width: 600,
                    height: 450
                }, {
                    name: 'large',
                    label: '800 x 600',
                    width: 800,
                    height: 600
                }, {
                    name: 'custom',
                    label: translate('Custom size'),
                    width: 600,
                    height: 450
                }];
                $scope.size = $scope.sizes[2];
                $scope.options = {
                    'static': false,
                    'scrollWheelZoom': false
                };
                $scope.customSize = angular.copy($scope.sizes[3]);
                $scope.forms = {};
                var refresh = function() {
                    $scope.hasUnknownDataset = false;
                    if (!$scope.loggedIn) {
                        SignupAPI.is_logged_in().success(function(response) {
                            $scope.loggedIn = response.logged_in;
                            $scope.activationPending = response.pending;
                        });
                    }
                    checkUnknownDataset();
                    $scope.size = $scope.sizes[2];
                    $scope.directLink = MapbuilderHelper.getMapURL();
                    getEmbedCode($scope.size.width, $scope.size.height, $scope.options.static, $scope.options.scrollWheelZoom);
                    if (!$scope.hasUnknownDataset) {
                        $scope.widgetCode = WidgetCodeBuilder.buildMapbuilderWidgetCode($scope.mapObject.value);
                    }
                };
                var checkUnknownDataset = function() {
                    angular.forEach($scope.mapObject.value.groups, function(group) {
                        angular.forEach(group.layers, function(layer) {
                            if (layer.context.error) {
                                $scope.hasUnknownDataset = true;
                            }
                        });
                    });
                };
                $scope.switchToSignupModal = function() {
                    $scope.hideShareModal();
                    $scope.showSignupModal();
                }
                ;
                var getEmbedCode = function(width, height, isStatic, scrollWheelZoom) {
                    var embedUrl = _computeEmbedUrl($scope.directLink);
                    var code = '<iframe frameborder="0" width="{width}" height="{height}" src="{src}"></iframe>';
                    var src = format_string('{url}?&static={isStatic}&scrollWheelZoom={scrollWheelZoom}', {
                        url: embedUrl,
                        isStatic: !!isStatic,
                        scrollWheelZoom: !!scrollWheelZoom
                    });
                    $scope.embedCode = format_string(code, {
                        width: width,
                        height: height,
                        src: src
                    });
                };
                var _computeEmbedUrl = function(url) {
                    if (angular.isDefined(url)) {
                        url = url.replace('/map/', '/map/embed/');
                    }
                    return url;
                };
                $scope.changeSize = function(size) {
                    if (size.name === 'custom') {
                        $scope.customSize = angular.copy($scope.sizes[3]);
                    }
                    $scope.size = size;
                    getEmbedCode(size.width, size.height, $scope.options.static, $scope.options.scrollWheelZoom);
                }
                ;
                $scope.$watch('options', function() {
                    getEmbedCode($scope.size.width, $scope.size.height, $scope.options.static, $scope.options.scrollWheelZoom);
                }, true);
                $scope.checkSize = function() {
                    if ($scope.forms.embedSizeForm.$valid) {
                        $scope.size = $scope.customSize;
                        getEmbedCode($scope.size.width, $scope.size.height, $scope.options.static, $scope.options.scrollWheelZoom);
                    }
                }
                ;
                $scope.$on('showModal', function(event, modalName) {
                    if (modalName == 'shareModal') {
                        refresh();
                    }
                });
            }
            ]
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderModalGroups', [function() {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-modal-groups.html',
            controller: ['$scope', 'MapbuilderHelper', 'filterFilter', function($scope, MapbuilderHelper, filterFilter) {
                function groupsShallowCopy(originalGroups) {
                    var shallowCopy = [];
                    originalGroups.forEach(function(originalGroup) {
                        var copiedGroup = {
                            displayed: originalGroup.displayed,
                            title: originalGroup.title,
                            description: originalGroup.description,
                            pictoIcon: originalGroup.pictoIcon,
                            pictoColor: originalGroup.pictoColor,
                            layers: []
                        };
                        originalGroup.layers.forEach(function(originalLayer) {
                            var copiedLayer = {
                                _runtimeId: originalLayer._runtimeId,
                                context: {
                                    dataset: {
                                        metas: {
                                            title: originalLayer.title || originalLayer.context.dataset.metas.title
                                        }
                                    }
                                },
                                title: originalLayer.title,
                                description: originalLayer.description,
                                captionPictoIcon: originalLayer.captionPictoIcon,
                                captionPictoColor: originalLayer.captionPictoColor
                            };
                            copiedGroup.layers.push(copiedLayer);
                        });
                        shallowCopy.push(copiedGroup);
                    });
                    return shallowCopy;
                }
                $scope.initModal = function() {
                    $scope.backupGroups = groupsShallowCopy($scope.mapObject.value.groups);
                    $scope.singleLayer = $scope.mapObject.value.singleLayer;
                    $scope.selectedGroups = [];
                    $scope.selection = [];
                }
                ;
                var newGroups = [];
                $scope.toggleSelection = function(group) {
                    if (group.selected) {
                        $scope.selectedGroups.push(group);
                    }
                    $scope.selectedGroups = filterFilter($scope.selectedGroups, {
                        selected: true
                    });
                    $scope.selection = [];
                    angular.forEach($scope.selectedGroups, function(selectedGroup) {
                        angular.forEach(selectedGroup.layers, function(layer) {
                            $scope.selection.push(layer);
                        });
                    });
                }
                ;
                $scope.fusionGroups = function() {
                    var title = $scope.selection[0].title || $scope.selection[0].context.dataset.metas.title
                      , description = $scope.selection[0].description || $scope.selection[0].context.dataset.metas.description || '';
                    var newGroup = {
                        'displayed': true,
                        'layers': $scope.selection,
                        'title': title || 'New group',
                        'selected': false,
                        'description': description
                    };
                    for (var i = $scope.backupGroups.length - 1; i >= 0; i--) {
                        if ($scope.backupGroups[i].selected) {
                            $scope.backupGroups.splice(i, 1);
                        }
                    }
                    $scope.backupGroups.push(newGroup);
                    $scope.selectedGroups.length = 0;
                }
                ;
                $scope.splitGroups = function() {
                    var newGroups = [];
                    angular.forEach($scope.selection, function(layer) {
                        var newGroup = {
                            'displayed': true,
                            'layers': [layer],
                            'title': layer.title || layer.context.dataset.datasetid,
                            'selected': false,
                            'description': layer.description || layer.context.dataset.metas.description
                        };
                        newGroups.push(newGroup);
                    });
                    for (var i = $scope.backupGroups.length - 1; i >= 0; i--) {
                        if ($scope.backupGroups[i].selected) {
                            $scope.backupGroups.splice(i, 1);
                        }
                    }
                    angular.forEach(newGroups, function(group) {
                        $scope.backupGroups.push(group);
                    });
                    $scope.selectedGroups.length = 0;
                    $scope.selection.length = 0;
                }
                ;
                $scope.reorderGroups = function() {
                    var movingLayers = [];
                    angular.forEach($scope.mapObject.value.groups, function(group) {
                        angular.forEach(group.layers, function(layer) {
                            movingLayers.push(layer);
                        });
                    });
                    $scope.mapObject.value.groups.length = 0;
                    $scope.reorderedGroups = [];
                    angular.forEach($scope.backupGroups, function(group) {
                        var reorderedGroup = {
                            'displayed': group.displayed,
                            'title': group.title,
                            'description': group.description,
                            'pictoIcon': group.pictoIcon,
                            'pictoColor': group.pictoColor,
                            'layers': []
                        };
                        angular.forEach(group.layers, function(layer) {
                            angular.forEach(movingLayers, function(movingLayer) {
                                if (movingLayer._runtimeId === layer._runtimeId) {
                                    reorderedGroup.layers.push(movingLayer);
                                }
                            });
                        });
                        $scope.reorderedGroups.push(reorderedGroup);
                    });
                    $scope.mapObject.value.groups = $scope.reorderedGroups;
                }
                ;
                $scope.setGroupVisibility = function(group) {
                    if ($scope.singleLayer) {
                        if (group.displayed) {
                            group.displayed = false;
                        } else {
                            angular.forEach($scope.backupGroups, function(group) {
                                group.displayed = false;
                            });
                            group.displayed = true;
                        }
                    } else {
                        if (group.displayed) {
                            group.displayed = false;
                        } else {
                            group.displayed = true;
                        }
                    }
                }
                ;
                $scope.setVisibilityMode = function() {
                    if ($scope.singleLayer) {
                        $scope.singleLayer = false;
                    } else {
                        $scope.singleLayer = true;
                        var foundVisible = false;
                        angular.forEach($scope.backupGroups, function(group) {
                            if (!foundVisible) {
                                if (group.displayed) {
                                    foundVisible = true;
                                }
                            } else {
                                if (group.displayed) {
                                    group.displayed = false;
                                }
                            }
                        });
                    }
                }
                ;
                $scope.apply = function() {
                    $scope.mapObject.value.singleLayer = $scope.singleLayer;
                    $scope.reorderGroups();
                    $scope.hideGroupsModal();
                }
                ;
            }
            ],
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderModalConfiguration', [function() {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-modal-configuration.html'
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderModalSelector', ['MapbuilderStorage', 'MapbuilderConfig', '$filter', '$window', function(MapbuilderStorage, MapbuilderConfig, $filter, $window) {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-modal-selector.html',
            link: function(scope) {
                scope.appRoot = $window.location.pathname.split('/')[1];
                scope.loggedIn = MapbuilderConfig.userLoggedIn;
                var maps = [];
                scope.mapsTable = [];
                var PAGE_SIZE = 5;
                scope.currentPage = 1;
                scope.lastPage = 1;
                var isMapEmpty = function(map) {
                    if (!map || !map.value || !map.value.groups) {
                        return true;
                    }
                    for (var i = 0; i < map.value.groups.length; i++) {
                        if (map.value.groups[i].layers.length) {
                            return false;
                        }
                    }
                    return true;
                };
                var fetchMaps = function() {
                    maps = MapbuilderStorage().getLocalConfigurationList();
                    angular.forEach(maps, function(map) {
                        map.draft = true;
                        map.empty = isMapEmpty(map);
                    });
                    if (scope.loggedIn) {
                        MapbuilderStorage().getPersistedConfigurationList().then(function(list) {
                            angular.forEach(list, function(map) {
                                map.draft = false;
                                map.empty = isMapEmpty(map);
                            });
                            maps = maps.concat(list);
                            maps = $filter('orderBy')(maps, 'last_modification', true);
                            refreshMapsTable();
                        });
                    } else {
                        maps = $filter('orderBy')(maps, 'last_modification', true);
                        refreshMapsTable();
                    }
                };
                var refreshMapsTable = function() {
                    var filteredMaps = getFilteredMaps();
                    scope.lastPage = Math.ceil(filteredMaps.length / PAGE_SIZE);
                    scope.mapsTable = $filter('limitTo')(filteredMaps, PAGE_SIZE, 0);
                    scope.currentPage = 1;
                };
                var mapSearch = function(search) {
                    if (!search) {
                        return function() {
                            return true;
                        }
                        ;
                    }
                    var normalizeTitle = function(title) {
                        return D4C.StringUtils.normalize(title || '').toLowerCase();
                    };
                    var normalizePersistId = function(id) {
                        return D4C.StringUtils.slugify(D4C.StringUtils.normalize(id || ''));
                    };
                    return function(tested) {
                        var normalizedAsTitle = normalizeTitle(search);
                        var normalizedAsId = normalizePersistId(search);
                        return normalizeTitle(tested.title).indexOf(normalizedAsTitle) > -1 || (normalizedAsId && normalizePersistId(tested.persist_id).indexOf(normalizedAsId) > -1);
                    }
                    ;
                };
                var getFilteredMaps = function() {
                    return maps.filter(mapSearch(scope.search));
                };
                scope.duplicateMap = function(map) {
                    var mapStorage = MapbuilderStorage(map.persist_id);
                    mapStorage.duplicate().then(fetchMaps);
                }
                ;
                scope.deleteMap = function(map) {
                    var mapStorage = MapbuilderStorage(map.persist_id);
                    mapStorage.delete().then(function() {
                        if (map.persist_id === scope.mapObject.persist_id) {
                            scope.dirty = false;
                            $window.location.href = '/' + $window.location.pathname.split('/')[1] + '/';
                        } else {
                            fetchMaps();
                        }
                    });
                }
                ;
                scope.selectPage = function(page) {
                    var filteredMaps = getFilteredMaps();
                    scope.mapsTable = $filter('limitTo')(filteredMaps, PAGE_SIZE, PAGE_SIZE * (page - 1));
                    scope.currentPage = page;
                }
                ;
                fetchMaps();
                scope.$watch('search', refreshMapsTable);
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderModalSignup', ['SignupAPI', 'D4CWidgetsConfig', '$timeout', function(SignupAPI, D4CWidgetsConfig, $timeout) {
        return {
            restrict: 'E',
            scope: false,
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-modal-signup.html',
            controller: ['$scope', function($scope) {
                $scope.startSignupProcess = function() {
                    $scope.identity = undefined;
                    $scope.loading = false;
                    $scope.signupStep = 'intro';
                    $scope.showSignupModal();
                }
                ;
                $scope.goto = function(step) {
                    $scope.loading = false;
                    $scope.signupStep = step;
                }
                ;
                $scope.checkIdentity = function(form) {
                    $scope.loading = true;
                    SignupAPI.check_identity(form.identity.$viewValue).success(function(response) {
                        form.identity.$setValidity('isValid', response.is_valid);
                        $scope.loading = false;
                        if (response.is_valid) {
                            $scope.identity = form.identity.$viewValue;
                            if (response.is_available) {
                                $scope.signupStep = 'create_account';
                            } else {
                                $scope.signupStep = 'login_account';
                            }
                        }
                    });
                }
                ;
                $scope.loginUser = function(form) {
                    $scope.loading = true;
                    SignupAPI.login_account($scope.identity, form.password.$viewValue).success(function(response) {
                        form.password.$setValidity('isValid', response.logged_in);
                        if (response.logged_in) {
                            $scope.persistMapFirstTime(function() {
                                window.location.reload();
                            });
                        } else {
                            $scope.loading = false;
                        }
                    });
                }
                ;
                $scope.createAccount = function(form) {
                    $scope.loading = true;
                    form.password.$setValidity('short', true);
                    form.password.$setValidity('long', true);
                    form.password.$setValidity('chars', true);
                    form.confirm_password.$setValidity('isValid', true);
                    SignupAPI.create_account($scope.identity, form.password.$viewValue, form.confirm_password.$viewValue).success(function() {
                        $scope.persistMapFirstTime(function() {
                            $scope.goto('create_success');
                            $scope.resetDirtyness();
                        });
                    }).error(function(response) {
                        $scope.loading = false;
                        angular.forEach(response.errors, function(error) {
                            switch (error.error_key) {
                            case 'InvalidShortPasswordException':
                                form.password.$setValidity('short', false);
                                break;
                            case 'InvalidLongPasswordException':
                                form.password.$setValidity('long', false);
                                break;
                            case 'InvalidCharsPasswordException':
                                form.password.$setValidity('chars', false);
                                break;
                            case 'InvalidConfirmPasswordException':
                                form.confirm_password.$setValidity('isValid', false);
                                break;
                            }
                        });
                    });
                }
                ;
            }
            ]
        };
    }
    ]);
    mod.directive('d4cMapbuilderModalSignupDisclaimer', function() {
        return {
            restrict: 'E',
            replace: true,
            template: '' + '<div class="d4c-mapbuilder-modal-signup__disclaimer">' + '   <i class="fa fa-info-circle d4c-mapbuilder-modal-signup__disclaimer-icon" aria-hidden="true"></i>' + '   <p>' + '       <span translate>Your maps are stored locally in your browser, in order to save or share them, you need to setup an account so we can store them in there.</span>' + '   </p>' + '</div>'
        };
    });
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderLayerConfigurationAuto', ['translate', function(translate) {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-layer-configuration-auto.html',
            scope: {
                layer: '=',
                layerStatistics: '='
            },
            controller: function($scope) {}
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderLayerConfigurationCategories', [function() {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-layer-configuration-categories.html',
            scope: {
                layer: '=',
                layerStatistics: '='
            },
            controller: function($scope) {}
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderLayerConfigurationChoropleth', [function() {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-layer-configuration-choropleth.html',
            scope: {
                layer: '=',
                layerStatistics: '='
            },
            controller: function($scope) {}
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderLayerConfigurationClusters', [function() {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-layer-configuration-clusters.html',
            scope: {
                layer: '='
            },
            controller: function($scope, translate) {
                $scope.numFields = $scope.layer.context.dataset.getFieldsForType('int').concat($scope.layer.context.dataset.getFieldsForType('double'));
                $scope.operations = [{
                    name: 'COUNT',
                    label: translate('Count')
                }];
                if ($scope.numFields.length > 0) {
                    $scope.layer.expr = $scope.layer.expr || $scope.numFields[0].name;
                    $scope.layer.func = $scope.layer.func || 'AVG';
                    $scope.operations = $scope.operations.concat([{
                        name: 'AVG',
                        label: translate('Average')
                    }, {
                        name: 'SUM',
                        label: translate('Sum')
                    }, {
                        name: 'MIN',
                        label: translate('Minimum')
                    }, {
                        name: 'MAX',
                        label: translate('Maximum')
                    }, {
                        name: 'STDDEV',
                        label: translate('Standard deviation')
                    }]);
                } else {
                    $scope.layer.expr = '';
                    $scope.layer.func = $scope.layer.func || 'COUNT';
                }
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderLayerConfigurationHeatmap', [function() {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-layer-configuration-heatmap.html',
            scope: {
                layer: '='
            },
            controller: function($scope, translate) {
                $scope.numFields = $scope.layer.context.dataset.getFieldsForType('int').concat($scope.layer.context.dataset.getFieldsForType('double'));
                $scope.operations = [{
                    name: 'COUNT',
                    label: translate('Count')
                }];
                if ($scope.numFields.length > 0) {
                    $scope.layer.expr = $scope.layer.expr || $scope.numFields[0].name;
                    $scope.layer.func = $scope.layer.func || 'AVG';
                    $scope.operations = $scope.operations.concat([{
                        name: 'AVG',
                        label: translate('Average')
                    }, {
                        name: 'SUM',
                        label: translate('Sum')
                    }, {
                        name: 'MIN',
                        label: translate('Minimum')
                    }, {
                        name: 'MAX',
                        label: translate('Maximum')
                    }, {
                        name: 'STDDEV',
                        label: translate('Standard deviation')
                    }]);
                } else {
                    $scope.layer.expr = '';
                    $scope.layer.func = $scope.layer.func || 'COUNT';
                }
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderMarkerConfiguration', ['translate', function(translate) {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-marker-configuration.html',
            scope: {
                layer: '=',
                layerStatistics: '='
            },
            link: function(scope, element, attrs) {},
            controller: function($scope, translate) {
                if ($scope.layer.picto) {
                    $scope.savedIcon = "circle";
                }
                if ($scope.layer.display === 'categories') {
                    $scope.textFields = $scope.layer.context.dataset.getFieldsForType('text');
                    if (!$scope.layer.color.field || $scope.layer.context.dataset.getField($scope.layer.color.field).type !== 'text') {
                        $scope.layer.color.field = $scope.textFields[0].name;
                    }
                } else if ($scope.layer.display === 'choropleth') {
                    $scope.numFields = $scope.layer.context.dataset.getFieldsForType('int').concat($scope.layer.context.dataset.getFieldsForType('double'));
                    if (angular.isUndefined($scope.layer.func)) {
                        if (!$scope.layer.color.field || ['int', 'double'].indexOf($scope.layer.context.dataset.getField($scope.layer.color.field).type) === -1) {
                            $scope.layer.color.field = $scope.numFields[0].name;
                        }
                    }
                }
                $scope.showPictoPicker = false;
                $scope.selectChoice = function(choice) {
                    switch (choice) {
                    case "dot":
                        $scope.layer.picto = 'dot';
                        $scope.layer.marker = false;
                        $scope.showPictoPicker = false;
                        break;
                    case "icon":
                        if ($scope.savedIcon) {
                            $scope.layer.picto = $scope.savedIcon;
                        }
                        $scope.layer.marker = false;
                        $scope.showPictoPicker = true;
                        break;
                    case "marker":
                        $scope.layer.marker = true;
                        if ($scope.savedIcon) {
                            $scope.layer.picto = $scope.savedIcon;
                        }
                        $scope.showPictoPicker = true;
                        break;
                    }
                    $scope.choice = choice;
                }
                ;
                $scope.$watch('layer.picto', function() {
                    if ($scope.layer.picto !== 'dot') {
                        $scope.savedIcon = $scope.layer.picto;
                        $scope.showPictoPicker = true;
                    }
                });
                if ($scope.layer.marker) {
                    $scope.choice = 'marker';
                } else {
                    if ($scope.layer.picto === 'dot') {
                        $scope.choice = 'dot';
                    } else {
                        $scope.choice = 'icon';
                    }
                }
                $scope.borderPatterns = [{
                    'name': 'solid',
                    'label': translate('Straight line'),
                    'image': '/sites/default/files/api/portail_d4c/img/solid.svg'
                }, {
                    'name': 'long-dashes',
                    'label': translate('Long dashes'),
                    'image': '/sites/default/files/api/portail_d4c/img/long-dashes.svg'
                }, {
                    'name': 'medium-dashes',
                    'label': translate('Medium dashes'),
                    'image': '/sites/default/files/api/portail_d4c/img/medium-dashes.svg'
                }, {
                    'name': 'short-dashes',
                    'label': translate('Short dashes'),
                    'image': '/sites/default/files/api/portail_d4c/img/short-dashes.svg'
                }, {
                    'name': 'short-dot',
                    'label': translate('Short - dot'),
                    'image': '/sites/default/files/api/portail_d4c/img/short-dot.svg'
                }, {
                    'name': 'short-dot-dot',
                    'label': translate('Short - dot - dot'),
                    'image': '/sites/default/files/api/portail_d4c/img/short-dot-dot.svg'
                }, {
                    'name': 'medium-short',
                    'label': translate('Medium - short'),
                    'image': '/sites/default/files/api/portail_d4c/img/medium-short.svg'
                }, {
                    'name': 'dots',
                    'label': translate('Dots'),
                    'image': '/sites/default/files/api/portail_d4c/img/dots.svg'
                }];
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderDisplaymodesList', ['translate', '$window', function(translate, $window) {
        return {
            restrict: 'E',
            replace: true,
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-displaymodes-list.html',
            scope: {
                layer: '=',
                layerStatistics: '='
            },
            require: '^d4cMapbuilderDatasetsPanel',
            controller: ['$scope', 'MapHelper', 'MapbuilderHelper', 'MapbuilderDisplayModes', function($scope, MapHelper, MapbuilderHelper, MapbuilderDisplayModes) {
                $scope.availableDisplays = angular.copy(MapbuilderDisplayModes);
                $scope.availableDisplays.forEach(function(display) {
                    if (display.requiresType || display.requiresShapeAggregation) {
                        display.notAvailable = true;
                        if (display.requiresType) {
                            var fields = display.requiresType.reduce(function(sofar, type) {
                                return sofar + $scope.layer.context.dataset.getFieldsForType(type).length;
                            }, 0);
                            if (fields > 0) {
                                display.notAvailable = false;
                            }
                        }
                        if (display.requiresShapeAggregation) {
                            if ($scope.layerStatistics.aggregatedShapes) {
                                display.notAvailable = false;
                            }
                        }
                    }
                });
                $scope.expanded = false;
                var currentValue;
                $scope.displayList = function() {
                    $scope.expanded = true;
                    $scope.bindClickToClose();
                    currentValue = $('.d4c-mapbuilder__displaymodes-list__mode--active');
                }
                ;
                $scope.setFocusToActive = function() {
                    $('.d4c-mapbuilder__displaymodes-list__mode--active').focus();
                }
                ;
                $scope.cleanActives = function() {
                    $('.d4c-mapbuilder__displaymodes-list__mode--active').removeClass('d4c-mapbuilder__displaymodes-list__mode--active');
                }
                ;
                $scope.checkListKey = function(event) {
                    if (!$scope.expanded && (event.keyCode === 40 || event.keyCode === 32)) {
                        $scope.displayList();
                        $scope.setFocusToActive();
                        event.preventDefault();
                    } else if ($scope.expanded && event.keyCode === 9) {
                        $scope.expanded = false;
                    } else if ($scope.expanded && event.keyCode === 27) {
                        $scope.expanded = false;
                    }
                }
                ;
                function findNextEnabled(sibling, direction) {
                    if (sibling.hasClass('d4c-mapbuilder__displaymodes-list__mode') && !sibling.hasClass('d4c-mapbuilder__displaymodes-list__mode--disabled')) {
                        $scope.cleanActives();
                        return sibling;
                    } else if (sibling.hasClass('d4c-mapbuilder__displaymodes-list__mode--disabled') && direction === 'next') {
                        sibling = sibling.next();
                        findNextEnabled(sibling, 'next');
                    } else if (sibling.hasClass('d4c-mapbuilder__displaymodes-list__mode--disabled') && direction === 'prev') {
                        sibling = sibling.prev();
                        findNextEnabled(sibling, 'prev');
                    } else {
                        return;
                    }
                }
                $scope.checkOptionKey = function(event, displayMode) {
                    var enabledSibling, previousSibling, nextSibling;
                    if ($scope.expanded && (event.keyCode === 27 || event.keyCode === 9)) {
                        $scope.expanded = false;
                        currentValue.addClass('d4c-mapbuilder__displaymodes-list__mode--active');
                        $('.d4c-mapbuilder__displaymodes-list__select').focus();
                    } else if ($scope.expanded && (event.keyCode === 13)) {
                        $scope.changeDisplay(displayMode.display);
                        $scope.expanded = false;
                        $('.d4c-mapbuilder__displaymodes-list__select').focus();
                    } else if (event.keyCode === 38) {
                        event.preventDefault();
                        previousSibling = $('.d4c-mapbuilder__displaymodes-list__mode--active').prev();
                        enabledSibling = findNextEnabled(previousSibling, 'prev');
                        if (typeof enabledSibling !== 'undefined') {
                            enabledSibling.addClass('d4c-mapbuilder__displaymodes-list__mode--active');
                            $scope.setFocusToActive();
                        }
                    } else if (event.keyCode === 40) {
                        event.preventDefault();
                        nextSibling = $('.d4c-mapbuilder__displaymodes-list__mode--active').next();
                        enabledSibling = findNextEnabled(nextSibling, 'next');
                        if (typeof enabledSibling !== 'undefined') {
                            enabledSibling.addClass('d4c-mapbuilder__displaymodes-list__mode--active');
                            $scope.setFocusToActive();
                        }
                    }
                }
                ;
                $scope.changeDisplay = function(display) {
                    var chosenDisplay = $scope.availableDisplays.filter(function(f) {
                        return display === f.display;
                    })[0];
                    if (chosenDisplay.notAvailable) {
                        return;
                    }
                    switch (display) {
                    case 'heatmap':
                        $scope.layer.display = 'heatmap';
                        $scope.layer.func = $scope.layer.func || 'COUNT';
                        break;
                    case 'clusters':
                        $scope.layer.display = 'clusters';
                        $scope.layer.func = 'COUNT';
                        $scope.layer.minSize = $scope.layer.minSize || 3;
                        $scope.layer.maxSize = $scope.layer.maxSize || 7;
                        break;
                    default:
                        $scope.layer.display = display;
                    }
                    ensureColorConsistencyOnDisplayChange($scope.layer);
                    $scope.expanded = false;
                    $scope.unbindClickToClose();
                    $('.d4c-mapbuilder__displaymodes-list__select').focus();
                }
                ;
                function ensureColorConsistencyOnDisplayChange(layer) {
                    if (layer.display === 'auto' || layer.display === 'clusters') {
                        if (angular.isObject(layer.color)) {
                            layer.color = MapHelper.DEFAULT_MARKER_COLOR;
                        }
                    } else {
                        var fallbackColor = MapHelper.DEFAULT_MARKER_COLOR;
                        if (angular.isString(layer.color)) {
                            fallbackColor = layer.color;
                            layer.color = {};
                        }
                        if (layer.display === 'categories') {
                            delete layer.color.ranges;
                            layer.color.type = 'categories';
                            layer.color.categories = layer.color.categories || {};
                            if (angular.equals(layer.color.categories, {})) {
                                var textField = $scope.layer.context.dataset.getFieldsForType('text')[0];
                                layer.color.field = textField.name;
                                layer.context.getFacetValues(textField.name).then(function(result) {
                                    var values = result.slice(0, 20);
                                    MapbuilderHelper.generateCategories(layer.color, values);
                                });
                            }
                            layer.color.otherCategories = layer.color.otherCategories || fallbackColor;
                        } else if (layer.display === 'choropleth') {
                            delete layer.color.categories;
                            layer.color.type = 'choropleth';
                            layer.color.ranges = layer.color.ranges || {};
                            if (angular.equals(layer.color.ranges, {})) {
                                var numFields = $scope.layer.context.dataset.getFieldsForType('int').concat($scope.layer.context.dataset.getFieldsForType('double'));
                                if (numFields.length) {
                                    layer.color.field = numFields[0].name;
                                    MapHelper.getDatasetFieldBounds(layer.context, layer.color.field).then(function(result) {
                                        MapbuilderHelper.generateChoroplethRanges(layer.color, result[0], result[1], 5, MapHelper.DEFAULT_RANGE_COLORS, 'rgb', 'linear');
                                        layer.color.minValue = result[0];
                                    });
                                } else {
                                    delete layer.color.field;
                                    layer.func = 'COUNT';
                                    MapHelper.getDatasetAggregationBounds(layer.context, 'COUNT').then(function(result) {
                                        MapbuilderHelper.generateChoroplethRanges(layer.color, result[0], result[1], 5, MapHelper.DEFAULT_RANGE_COLORS, 'rgb', 'linear');
                                        layer.color.minValue = result[0];
                                    });
                                }
                            }
                        } else if (layer.display === 'heatmap') {
                            layer.color.type = 'gradient';
                            layer.color.steps = $scope.layer.color.steps || {
                                0.4: '#0000FF',
                                0.6: '#00FFFF',
                                0.7: '#00FF00',
                                0.8: '#FFFF00',
                                1.0: '#FF0000'
                            };
                        } else {
                            console.error('ensureColorConsistencyOnDisplayChange: unknown display', layer.display);
                        }
                    }
                }
                $scope.onClick = function(display) {
                    if ($scope.expanded) {
                        $scope.changeDisplay(display);
                    } else {
                        $scope.displayList();
                    }
                }
                ;
            }
            ],
            link: function(scope, element, attrs) {
                var clickToClose = function(e) {
                    if ($(e.target).parents('.d4c-mapbuilder__displaymodes-list__container').length === 0) {
                        scope.$apply(function() {
                            scope.expanded = false;
                        });
                    }
                };
                scope.bindClickToClose = function() {
                    angular.element($window).on('click', clickToClose);
                }
                ;
                scope.unbindClickToClose = function() {
                    angular.element($window).off('click', clickToClose);
                }
                ;
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderColorCategories', [function() {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-color-categories.html',
            scope: {
                layer: '='
            },
            controller: function($scope, D4CAPI, MapbuilderHelper) {
                $scope.values = [];
                $scope.enabledOthers = true;
                $scope.initModal = function() {
                    $scope.textFields = $scope.layer.context.dataset.getFieldsForType('text');
                    $scope.colorConfiguration = angular.copy($scope.layer.color);
                    $scope.enabledOthers = angular.isDefined($scope.colorConfiguration.otherCategories);
                    $scope.colorConfiguration.categories = $scope.colorConfiguration.categories || {};
                    $scope.field = $scope.layer.context.dataset.getField($scope.layer.color.field);
                    $scope.updateCategories($scope.field);
                }
                ;
                $scope.updateCategories = function(field) {
                    $scope.selectedField = field;
                    $scope.layer.context.getFacetValues($scope.selectedField.name).then(function(result) {
                        $scope.valuesCount = result.length;
                        $scope.values = result.slice(0, 20);
                        MapbuilderHelper.generateCategories($scope.colorConfiguration, $scope.values);
                    });
                }
                ;
                $scope.enableOthersChange = function(color, enabled) {
                    if (enabled) {
                        color.otherCategories = '#000000';
                    } else {
                        delete color.otherCategories;
                    }
                }
                ;
                $scope.apply = function() {
                    $scope.colorConfiguration.field = $scope.selectedField.name;
                    $scope.layer.color = $scope.colorConfiguration;
                    $scope.hideColorCategoriesModal();
                }
                ;
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderColorChoropleth', [function() {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-color-choropleth.html',
            scope: {
                layer: '=',
                fields: '='
            },
            controller: function($scope, translate) {
                $scope.colorConfiguration = {};
                $scope.translate = translate;
                var that = this;
                $scope.isFormValid = function() {
                    return that.isFormValid();
                }
                ;
                $scope.apply = function() {
                    that.apply();
                    $scope.hideColorChoroplethModal();
                }
                ;
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderColorChoroplethForm', [function() {
        return {
            restrict: 'E',
            require: '^^d4cMapbuilderColorChoropleth',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-color-choropleth-form.html',
            scope: {
                layer: '=',
                fields: '=',
                form: '='
            },
            link: function(scope, elements, attrs, d4cMapbuilderColorChoroplethCtrl) {
                scope.d4cMapbuilderColorChoroplethCtrl = d4cMapbuilderColorChoroplethCtrl;
                scope.d4cMapbuilderColorChoroplethCtrl.apply = function() {
                    scope.computeRanges();
                    scope.layer.color = scope.colorConfiguration;
                    if (scope.isAggregation) {
                        scope.layer.func = scope.aggregationFunction;
                        scope.layer.expr = scope.aggregationExpression;
                        delete scope.colorConfiguration.field;
                    } else {
                        delete scope.layer.func;
                        delete scope.layer.expr;
                    }
                }
                ;
                scope.d4cMapbuilderColorChoroplethCtrl.isFormValid = function() {
                    return scope.choroplethForm.$valid;
                }
                ;
            },
            controller: function($scope, $q, D4CAPI, MapbuilderHelper, MapHelper, translate, $filter, MapLayerHelper) {
                $scope.defaultRangeColors = MapHelper.DEFAULT_RANGE_COLORS;
                $scope.gradientTypes = [{
                    name: 'rgb',
                    label: 'RGB'
                }, {
                    name: 'lab',
                    label: 'Lab'
                }, {
                    name: 'hsl',
                    label: 'HSL'
                }, {
                    name: 'lch',
                    label: 'Lch'
                }, ];
                $scope.operations = [{
                    name: 'COUNT',
                    label: translate('Count')
                }];
                if ($scope.fields.length > 0) {
                    $scope.operations = $scope.operations.concat([{
                        name: 'AVG',
                        label: translate('Average')
                    }, {
                        name: 'SUM',
                        label: translate('Sum')
                    }, {
                        name: 'MIN',
                        label: translate('Minimum')
                    }, {
                        name: 'MAX',
                        label: translate('Maximum')
                    }, {
                        name: 'STDDEV',
                        label: translate('Standard deviation')
                    }]);
                }
                var getBounds = function(regenerate) {
                    var call;
                    if ($scope.isAggregation) {
                        call = MapHelper.getDatasetAggregationBounds($scope.layer.context, $scope.aggregationFunction, $scope.aggregationExpression);
                    } else {
                        call = MapHelper.getDatasetFieldBounds($scope.layer.context, $scope.field.name);
                    }
                    call.then(function(result) {
                        $scope.minValue = angular.isDefined($scope.colorConfiguration.minValue) ? $scope.colorConfiguration.minValue : result[0];
                        $scope.maxValue = angular.isDefined($scope.colorConfiguration.maxValue) ? $scope.colorConfiguration.maxValue : result[1];
                        if (regenerate) {
                            $scope.minValue = MapbuilderHelper.limitDecimalsFloor(result[0], 5);
                            $scope.maxValue = MapbuilderHelper.limitDecimalsCeil(result[1], 5);
                            $scope.regenerateRanges();
                        } else {
                            $scope.minValue = angular.isDefined($scope.colorConfiguration.minValue) ? $scope.colorConfiguration.minValue : result[0];
                            $scope.maxValue = angular.isDefined($scope.colorConfiguration.maxValue) ? $scope.colorConfiguration.maxValue : result[1];
                            $scope.generateBoundsArray();
                        }
                    });
                };
                $scope.initForm = function() {
                    $scope.colorConfiguration = angular.copy($scope.layer.color);
                    $scope.colorConfiguration.ranges = $scope.colorConfiguration.ranges || {};
                    $scope.isAggregation = !!($scope.layer.func && angular.isUndefined($scope.colorConfiguration.field));
                    if ($scope.isAggregation) {
                        $scope.aggregationFunction = $scope.layer.func;
                        $scope.aggregationExpression = $scope.layer.expr;
                        $scope.field = $scope.layer.context.dataset.getField($scope.aggregationExpression);
                    } else {
                        $scope.field = $scope.layer.context.dataset.getField($scope.colorConfiguration.field);
                    }
                    $scope.rangeSettings = {};
                    $scope.colorConfiguration.computing = $scope.colorConfiguration.computing || 'linear';
                    $scope.rangeSettings.tiers = Object.keys($scope.colorConfiguration.ranges).length;
                    $scope.rangeSettings.gradientType = $scope.colorConfiguration.gradientType || $scope.gradientTypes[0].name;
                    if (!angular.equals($scope.colorConfiguration.ranges, {})) {
                        var sortedRanges = getSortedBounds();
                        var firstColor = $scope.colorConfiguration.ranges[sortedRanges[0]];
                        var lastColor = $scope.colorConfiguration.ranges[sortedRanges[sortedRanges.length - 1]];
                        $scope.rangeSettings.colors = [firstColor, lastColor];
                    } else {
                        $scope.rangeSettings.colors = ['#000000', '#FFFFFF'];
                    }
                    getBounds();
                    generateDefaultExtraColors();
                }
                ;
                $scope.onColorModeChange = function() {
                    if ($scope.isAggregation) {
                        $scope.aggregationFunction = $scope.aggregationFunction || 'COUNT';
                        $scope.aggregationExpression = $scope.aggregationExpression || $scope.field.name;
                    } else {
                        $scope.colorConfiguration.field = $scope.colorConfiguration.field || $scope.field.name;
                    }
                    getBounds(true);
                }
                ;
                $scope.updateGradientType = function() {
                    $scope.colorConfiguration.gradientType = $scope.rangeSettings.gradientType;
                    $scope.regenerateRanges();
                }
                ;
                $scope.validateForm = function() {
                    angular.forEach($scope.choroplethForm.$error, function(error) {
                        angular.forEach(error, function(field) {
                            field.$setDirty();
                        });
                    });
                    $scope.choroplethForm.$submitted = true;
                }
                ;
                function getSortedBounds() {
                    return Object.keys($scope.colorConfiguration.ranges).sort(function(a, b) {
                        return parseFloat(a) - parseFloat(b);
                    });
                }
                $scope.updateField = function() {
                    if ($scope.isAggregation) {
                        $scope.aggregationExpression = $scope.field.name;
                    } else {
                        $scope.colorConfiguration.field = $scope.field.name;
                    }
                    getBounds(true);
                }
                ;
                $scope.updateAggregationFunction = function() {
                    getBounds(true);
                }
                ;
                $scope.updateTiers = function() {
                    if (!angular.isUndefined($scope.rangeSettings.tiers) && $scope.rangeSettings.tiers !== null) {
                        $scope.regenerateRanges();
                    }
                }
                ;
                $scope.checkEquality = function() {
                    if ($scope.minValue === $scope.maxValue) {
                        $scope.choroplethForm['min-value'].$setValidity('equal', false);
                    } else {
                        $scope.choroplethForm['min-value'].$setValidity('equal', true);
                    }
                    if (angular.isDefined($scope.minValue) && angular.isDefined($scope.maxValue)) {
                        if ($scope.colorConfiguration.computing !== 'custom') {
                            $scope.regenerateRanges();
                        } else {
                            var currentHigher = Object.keys($scope.colorConfiguration.ranges).sort(function(a, b) {
                                return parseFloat(b) - parseFloat(a);
                            })[0];
                            if ($scope.maxValue !== currentHigher) {
                                $scope.colorConfiguration.ranges[$scope.maxValue] = $scope.colorConfiguration.ranges[currentHigher];
                                delete $scope.colorConfiguration.ranges[currentHigher];
                            }
                            $scope.sortedBoundsArray[$scope.sortedBoundsArray.length - 1][1] = $scope.maxValue;
                        }
                    }
                }
                ;
                $scope.regenerateRanges = function() {
                    MapbuilderHelper.generateChoroplethRanges($scope.colorConfiguration, $scope.minValue, $scope.maxValue, $scope.rangeSettings.tiers, $scope.rangeSettings.colors, $scope.rangeSettings.gradientType, $scope.colorConfiguration.computing);
                    $scope.generateBoundsArray();
                    generateDefaultExtraColors();
                }
                ;
                var generateDefaultExtraColors = function() {
                    var splitComplimentaryColors = MapLayerHelper.getSplitComplementaryColors($scope.rangeSettings.colors[1]);
                    $scope.defaultOutOfBoundsColor = splitComplimentaryColors[0];
                    $scope.defaultUndefinedColor = splitComplimentaryColors[1];
                };
                $scope.addCustomRange = function() {
                    var tiersDiff, i;
                    var rangesLength = $scope.sortedBoundsArray.length;
                    if (rangesLength < $scope.rangeSettings.tiers) {
                        tiersDiff = $scope.rangeSettings.tiers - rangesLength;
                        for (i = 0; i < tiersDiff; i++) {
                            $scope.sortedBoundsArray.splice($scope.sortedBoundsArray.length - 1, 0, [0, 0, '#FFFFFF']);
                        }
                        $scope.$$postDigest(function() {
                            $scope.validateForm();
                        });
                    } else if (rangesLength > $scope.rangeSettings.tiers) {
                        tiersDiff = rangesLength - $scope.rangeSettings.tiers;
                        for (i = 0; i < tiersDiff; i++) {
                            $scope.sortedBoundsArray.splice($scope.sortedBoundsArray.length - 2, 1);
                        }
                    }
                }
                ;
                $scope.generateBoundsArray = function() {
                    var sortedBounds = getSortedBounds();
                    var lowerBound = $scope.minValue;
                    $scope.sortedBoundsArray = [];
                    if (!angular.isUndefined($scope.minValue)) {
                        sortedBounds.forEach(function(bound, index) {
                            if ($scope.sortedBoundsArray.length > 0) {
                                lowerBound = ($filter('incrementBound')($scope.sortedBoundsArray[index - 1][1]));
                            }
                            if (index + 1 < sortedBounds.length) {
                                $scope.sortedBoundsArray.push([parseFloat(lowerBound), parseFloat(bound), $scope.colorConfiguration.ranges[bound]]);
                            } else {
                                $scope.sortedBoundsArray.push([parseFloat(lowerBound), parseFloat($scope.maxValue), $scope.colorConfiguration.ranges[bound]]);
                            }
                        });
                    }
                }
                ;
                $scope.checkLastBound = function(nextLowerBound, maxValue, index) {
                    if ($scope.colorConfiguration.computing === 'custom') {
                        if ((index === $scope.sortedBoundsArray.length - 2) && (nextLowerBound === maxValue)) {
                            $scope.choroplethForm['choroplethBound-' + index].$setValidity('maxLast', false);
                        } else {
                            $scope.choroplethForm['choroplethBound-' + index].$setValidity('maxLast', true);
                        }
                    }
                }
                ;
                $scope.computeRanges = function() {
                    if ($scope.colorConfiguration.computing === 'custom') {
                        $scope.colorConfiguration.ranges = {};
                        var total = $scope.sortedBoundsArray.reduce(function(sofar, current) {
                            return sofar + current[1];
                        }, 0);
                        var digits;
                        if (total.toString().indexOf('.') !== -1) {
                            digits = Math.max(0, total.toString().length - total.toString().indexOf('.') - 1);
                        } else {
                            digits = 0;
                        }
                        $scope.sortedBoundsArray.forEach(function(bound) {
                            $scope.colorConfiguration.ranges[bound[1].toFixed(digits)] = bound[2];
                        });
                    } else {
                        angular.forEach($scope.colorConfiguration.ranges, function(value, key) {
                            $scope.colorConfiguration.ranges[key] = $scope.sortedBoundsArray.filter(function(f) {
                                var upper = D4C.NumberUtils.limitDecimals(f[1], 5);
                                return parseFloat(key) === upper;
                            })[0][2];
                        });
                    }
                    $scope.colorConfiguration.minValue = $scope.minValue;
                    $scope.colorConfiguration.maxValue = $scope.maxValue;
                }
                ;
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderColorHeatmap', [function() {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-color-heatmap.html',
            scope: {
                layer: '='
            },
            controller: function($scope, D4CAPI, translate) {
                var translate_color = translate;
                $scope.gradients = [{
                    label: translate_color("Blue - Red", "color range"),
                    name: 'bluered',
                    length: 2,
                    steps: {
                        0.5: "#0000FF",
                        1: "#FF0000"
                    }
                }, {
                    label: translate_color("Glacier", "color range"),
                    name: 'glacier',
                    length: 3,
                    steps: {
                        0.3: "#000000",
                        0.6: "#00FFFF",
                        1: "#FFFFFF"
                    }
                }, {
                    label: translate_color("Sunrise", "color range"),
                    name: 'sunrise',
                    length: 3,
                    steps: {
                        0.3: "#FF0000",
                        0.6: "#FFFF00",
                        1: "#FFFFFF"
                    }
                }, {
                    label: translate_color("Monochrome", "color range"),
                    name: 'monochrome',
                    length: 3,
                    steps: {
                        0.3: "#000000",
                        0.6: "#808080",
                        1: "#FFFFFF"
                    }
                }, {
                    label: translate_color("Deep sea", "color range"),
                    name: 'deepsea',
                    length: 5,
                    steps: {
                        0.2: "#000000",
                        0.4: "#183567",
                        0.6: "#2E649E",
                        0.8: "#17ADCB",
                        1: "#00FAFA"
                    }
                }, {
                    label: translate_color("5 color spectrum", "color range"),
                    name: 'colorspectrum5',
                    length: 5,
                    steps: {
                        0.2: "#000080",
                        0.4: "#0000FF",
                        0.6: "#008000",
                        0.8: "#FFFF00",
                        1: "#FF0000"
                    }
                }, {
                    label: translate_color("7 color spectrum", "color range"),
                    name: 'colorspectrum7',
                    length: 7,
                    steps: {
                        0.1: "#000000",
                        0.2: "#000080",
                        0.3: "#0000FF",
                        0.4: "#008000",
                        0.5: "#FFFF00",
                        0.6: "#FF0000",
                        1: "#FF0000"
                    }
                }, {
                    label: translate_color("Visible spectrum", "color range"),
                    name: 'visiblespectrum',
                    length: 5,
                    steps: {
                        0.2: "#FF00FF",
                        0.4: "#0000FF",
                        0.6: "#00FF00",
                        0.8: "#FFFF00",
                        1: "#00FAFA"
                    }
                }, {
                    label: translate_color("Custom", "color range"),
                    name: 'custom',
                    length: 5,
                    steps: {
                        1: "#FF0000",
                        0.8: "#FFFF00",
                        0.4: "#0000FF",
                        0.7: "#00FF00",
                        0.6: "#00FFFF"
                    }
                }];
                $scope.initModal = function() {
                    $scope.colorConfiguration = angular.copy($scope.layer.color);
                    $scope.colorConfiguration.gradient = {
                        label: translate("Custom"),
                        name: 'custom',
                        length: Object.keys($scope.colorConfiguration.steps).length,
                        steps: $scope.colorConfiguration.steps
                    };
                    angular.forEach($scope.gradients, function(gradient) {
                        if (angular.equals(gradient.steps, $scope.colorConfiguration.steps)) {
                            $scope.colorConfiguration.gradient = gradient;
                        }
                    });
                }
                ;
                $scope.stepParser = function(step) {
                    return parseFloat(step);
                }
                ;
                $scope.apply = function() {
                    $scope.layer.color.steps = $scope.colorConfiguration.steps;
                    $scope.hideColorHeatmapModal();
                }
                ;
                $scope.displayGradient = function() {
                    $scope.colorConfiguration.steps = $scope.colorConfiguration.gradient.steps;
                }
                ;
                var generateSteps = function(colorsLength, colors, colorConfiguration) {
                    var stepLength = 1 / (colorsLength), startingStep = 0, newSteps = {}, i, step = parseFloat((startingStep + stepLength).toFixed(2));
                    angular.forEach(colors, function(color) {
                        newSteps[step] = color;
                        step = parseFloat((step + stepLength).toFixed(2));
                    });
                    if (colorsLength > colors.length + 1) {
                        for (i = colors.length; i < colorsLength - 1; i++) {
                            newSteps[step] = '#FFFFFF';
                            step = parseFloat((step + stepLength).toFixed(2));
                        }
                    }
                    if (colorsLength > colors.length) {
                        newSteps[1] = '#FFFFFF';
                    }
                    colorConfiguration.steps = newSteps;
                    colorConfiguration.gradient.steps = newSteps;
                    colorConfiguration.gradient.length = colorsLength;
                };
                $scope.updateCustomGradient = function() {
                    var colors = [], colorsLength, orderedSteps = Object.keys($scope.colorConfiguration.gradient.steps).map(function(s) {
                        return parseFloat(s);
                    }).sort(function(a, b) {
                        return a - b;
                    });
                    colors = orderedSteps.map(function(s) {
                        return $scope.colorConfiguration.gradient.steps[s];
                    });
                    if (colors.length < $scope.colorConfiguration.gradient.length) {
                        generateSteps($scope.colorConfiguration.gradient.length, colors, $scope.colorConfiguration);
                    } else if (colors.length > $scope.colorConfiguration.gradient.length) {
                        colors.length = $scope.colorConfiguration.gradient.length;
                        generateSteps(colors.length, colors, $scope.colorConfiguration);
                    }
                }
                ;
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderGradientPreview', [function() {
        return {
            restrict: 'E',
            template: '' + '<div class="d4c-mapbuilder-gradient-preview">' + '</div>',
            scope: {
                steps: '='
            },
            link: function(scope, element, attrs) {
                var gradientContainer = element.find('.d4c-mapbuilder-gradient-preview');
                var redraw = function() {
                    var steps = Object.keys(scope.steps).map(function(s) {
                        return parseFloat(s);
                    }).sort(function(a, b) {
                        return a - b;
                    });
                    var colors = steps.map(function(s) {
                        return scope.steps[s];
                    });
                    var rule = "linear-gradient(to right, " + colors.join(',') + ")";
                    gradientContainer.css("background", rule);
                };
                scope.$watch('steps', redraw, true);
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.frontend');
    mod.directive('d4cMapbuilderLayerConfigurationCaption', [function() {
        return {
            restrict: 'E',
            templateUrl: '/sites/default/files/api/portail_d4c/templates/mapbuilder-layer-configuration-caption.html',
            scope: {
                layer: '=',
                group: '='
            }
        };
    }
    ]);
}());
;(function() {
    'use strict';
    var mod = angular.module('d4c.core');
    mod.directive('d4cDatalist', function($filter, APIXHRService, d4cCustomInput, d4cCustomInputHelper, $timeout) {
        return {
            restrict: 'E',
            require: ['ngModel', '?ngModelOptions'],
            replace: true,
            scope: {
                id: '@',
                name: '@',
                placeholder: '@',
                width: '@',
                options: '=',
                dropdownShowsAllOptions: '=?',
                ngKeydown: '&',
                onSelect: '&'
            },
            link: function(scope, element, attrs, ctrls) {
                var inputElement, optionsElement, timeoutPromise;
                var ngModelCtrl = ctrls[0]
                  , ngModelOptionsCtrl = ctrls[1];
                var ngModelOptions = d4cCustomInputHelper.getAndResetNgModelOptions(ngModelOptionsCtrl);
                scope.displayOptions = false;
                scope.hoveredOptionIndex = -1;
                scope.dropdownShowsAllOptions = !!scope.dropdownShowsAllOptions;
                scope.optionsPosition = 'top';
                scope.data = [];
                scope.showOptions = function() {
                    var position = scope.repositionDropdown();
                    if (position === 'top') {
                        optionsElement.css({
                            'border-bottom': 'none'
                        });
                    } else {
                        optionsElement.css({
                            'border-top': 'none'
                        });
                    }
                    scope.displayOptions = true;
                }
                ;
                scope.hideOptions = function() {
                    scope.displayOptions = false;
                }
                ;
                scope.blur = function() {
                    setDebouncedViewValue(scope.value, ngModelOptions.debounce.blur);
                    scope.hideOptions();
                }
                ;
                scope.selectOption = function(optionValue) {
                    scope.value = optionValue;
                    setDebouncedViewValue(scope.value, 0);
                    scope.hideOptions();
                    $timeout(function() {
                        element.find(".d4c-datalist__input").focus();
                    });
                    if (scope.onSelect) {
                        scope.onSelect();
                    }
                }
                ;
                scope.filteredOptions = function() {
                    if (scope.dropdownShowsAllOptions || !scope.value) {
                        return scope.data;
                    } else {
                        var re = new RegExp(RegExp.escape(scope.value),'i');
                        return scope.data.filter(function(option) {
                            return re.test(option.value);
                        });
                    }
                }
                ;
                var setViewValue = function(value) {
                    if (ngModelCtrl.$viewValue !== value) {
                        ngModelCtrl.$setViewValue(value);
                    }
                };
                var setDebouncedViewValue = function(value, debounceTimeout) {
                    if (timeoutPromise) {
                        $timeout.cancel(timeoutPromise);
                        timeoutPromise = undefined;
                    }
                    if (!debounceTimeout) {
                        setViewValue(value);
                        return;
                    }
                    timeoutPromise = $timeout(function() {
                        setViewValue(value);
                    }, debounceTimeout);
                };
                ngModelCtrl.$render = function() {
                    scope.value = ngModelCtrl.$viewValue;
                }
                ;
                scope.$watch('value', function(nv, ov) {
                    buildDatalist(scope.options);
                    if (nv !== ov) {
                        if (nv && $(inputElement).is(':focus') && scope.hoveredOptionIndex == -1) {
                            scope.showOptions();
                        }
                        scope.hoveredOptionIndex = -1;
                    }
                    if (scope.hoveredOptionIndex === -1) {
                        setDebouncedViewValue(nv, ngModelOptions.debounce.default);
                    }
                });
                var keyCodes = {
                    RETURNKEY: 13,
                    ESCAPE: 27,
                    UPARROW: 38,
                    DOWNARROW: 40
                };
                scope.optionHover = function(index) {
                    scope.hoveredOptionIndex = index;
                }
                ;
                var adjustOptionsScroll = function() {
                    if (scope.hoveredOptionIndex < 0 || scope.data.length === 0) {
                        return;
                    }
                    var hoveredElement = optionsElement.find('.d4c-datalist__option--' + scope.hoveredOptionIndex);
                    if (!hoveredElement) {
                        return;
                    }
                    var containerTop = optionsElement.scrollTop();
                    var containerBottom = optionsElement.height();
                    var optionTop = hoveredElement.position().top;
                    var optionBottom = hoveredElement.position().top + hoveredElement.height();
                    if (containerBottom < optionBottom) {
                        optionsElement.scrollTop(containerTop + optionBottom - containerBottom);
                    }
                    if (optionTop < 0) {
                        optionsElement.scrollTop(containerTop + optionTop);
                    }
                };
                scope.optionKeydown = function(event) {
                    var filteredOptions = scope.filteredOptions();
                    switch (event.keyCode) {
                    case keyCodes.UPARROW:
                        scope.displayOptions = true;
                        scope.hoveredOptionIndex--;
                        if (scope.hoveredOptionIndex < 0) {
                            scope.hoveredOptionIndex = filteredOptions.length - 1;
                        }
                        adjustOptionsScroll();
                        event.preventDefault();
                        break;
                    case keyCodes.DOWNARROW:
                        if (scope.displayOptions) {
                            scope.hoveredOptionIndex++;
                        }
                        scope.displayOptions = true;
                        if (scope.hoveredOptionIndex >= filteredOptions.length) {
                            scope.hoveredOptionIndex = 0;
                        }
                        adjustOptionsScroll();
                        event.preventDefault();
                        break;
                    case keyCodes.RETURNKEY:
                        if (scope.hoveredOptionIndex > -1) {
                            scope.selectOption(filteredOptions[scope.hoveredOptionIndex].value);
                        }
                        scope.displayOptions = false;
                        event.preventDefault();
                        break;
                    case keyCodes.ESCAPE:
                        scope.hoveredOptionIndex = -1;
                        scope.displayOptions = false;
                        event.preventDefault();
                        break;
                    }
                    if (scope.ngKeydown && event.target === element.find('.d4c-datalist__input')[0]) {
                        scope.ngKeydown({
                            $event: event
                        });
                    }
                }
                ;
                var buildDatalist = function(options) {
                    var highlightValue = function(option, value, re) {
                        option.highlightedValue = option.value.replace(re, "<strong>$1</strong>");
                        return option;
                    };
                    var displayedOption = function(option, value, re) {
                        if (!value) {
                            return option;
                        } else if (re.test(option.value)) {
                            return highlightValue(option, value, re);
                        }
                        return false;
                    };
                    var valueRegexp = new RegExp('(' + RegExp.escape(scope.value) + ')','i');
                    scope.data = [];
                    if (angular.isArray(options) && !angular.isObject(options[0])) {
                        options.forEach(function(option) {
                            option = displayedOption({
                                'label': '',
                                'value': option
                            }, scope.value, valueRegexp);
                            if (option) {
                                scope.data.push(option);
                            }
                        });
                    } else if (angular.isArray(options)) {
                        options.forEach(function(option) {
                            option = displayedOption(angular.copy(option), scope.value, valueRegexp);
                            if (option) {
                                scope.data.push(option);
                            }
                        });
                    } else if (scope.value) {
                        APIXHRService('GET', options, {
                            query: scope.value
                        }).success(function(response) {
                            scope.data = response.hits;
                        });
                    }
                };
                scope.$watch('options', function(nv) {
                    if (angular.isDefined(nv)) {
                        buildDatalist(nv);
                    }
                }, true);
                element = d4cCustomInput(scope, element, attrs, '' + '<div class="d4c-datalist d4c-form__control-wrapper--' + (attrs.width ? attrs.width : 'normal') + '" d4c-dropdown-position>' + '    <input type="text" ' + '           class="d4c-datalist__input d4c-form__control ' + (attrs.width ? 'd4c-form__control--' + attrs.width : '') + '" ' + '           id="{{ id }}"' + '           name="{{ name }}"' + '           ng-keydown="optionKeydown($event)"' + '           placeholder="{{ placeholder }}"' + '           ng-click="showOptions()"' + '           ng-blur="blur()"' + '           ng-model="value"' + '           ng-model-options="{}"' + '           ng-disabled="disabled"' + '           d4c-dropdown-position-control>' + '    <ul class="d4c-datalist__options" ' + '        ng-show="displayOptions && filteredOptions().length" ' + '        d4c-dropdown-position-options' + '        d4c-dropdown-position-options-height="200">' + '        <li class="d4c-datalist__option d4c-datalist__option--{{ $index }}"' + '            ng-class="{\'d4c-datalist__option--hovered\': $index == hoveredOptionIndex}"' + '            ng-repeat="option in filteredOptions()"' + '            ng-mouseenter="optionHover($index)"' + '            ng-keydown="optionKeydown($event)"' + '            ng-mousedown="selectOption(option.value)">' + '            <span class="d4c-datalist__option-value" ng-bind-html="option.highlightedValue || option.value"></span>' + '            <span class="d4c-datalist__option-label" ng-if="option.label">{{ option.label }}</span>' + '        </li>' + '    </ul>' + '</div>');
                inputElement = element.find('.d4c-datalist__input');
                optionsElement = element.find('.d4c-datalist__options');
            }
        };
    });
}
)();
;(function() {
    'use strict';
    var mod = angular.module('d4c.core');
    mod.directive('d4cDateInput', function(d4cCustomInput, d4cCustomInputHelper) {
        return {
            restrict: 'E',
            scope: {
                id: '@',
                name: '@'
            },
            require: ['ngModel', '?ngModelOptions'],
            replace: true,
            link: function(scope, element, attrs, ctrls) {
                var ngModelCtrl = ctrls[0]
                  , ngModelOptionsCtrl = ctrls[1];
                scope.ngModelOptions = d4cCustomInputHelper.getAndResetNgModelOptions(ngModelOptionsCtrl);
                ngModelCtrl.$render = function() {
                    scope.datetime = moment(ngModelCtrl.$viewValue).toDate();
                }
                ;
                scope.$watch('datetime', function(nv, ov) {
                    if (!angular.equals(nv, ov)) {
                        var parsedDate = moment(scope.datetime);
                        if (parsedDate.isValid()) {
                            ngModelCtrl.$setViewValue(parsedDate.format("YYYY-MM-DD"));
                            ngModelCtrl.$commitViewValue();
                        }
                    }
                }, true);
                d4cCustomInput(scope, element, attrs, '' + '<input type="date"' + '       class="d4c-form__control ' + (attrs.width ? 'd4c-form__control--' + attrs.width : '') + '"' + '       id="{{ id }}"' + '       name="{{ name }}"' + '       ng-disabled="disabled"' + '       ng-readonly="readonly"' + '       ng-model="datetime"' + '       ng-model-options="ngModelOptions">');
            }
        };
    });
}
)();
;(function() {
    'use strict';
    var mod = angular.module('d4c.core');
    mod.directive('d4cDatetimeInput', function(d4cCustomInput, d4cCustomInputHelper) {
        return {
            restrict: 'E',
            scope: {
                id: '@',
                name: '@'
            },
            require: ['ngModel', '?ngModelOptions', '?^form'],
            replace: true,
            link: function(scope, element, attrs, ctrls) {
                var ngModelCtrl = ctrls[0]
                  , ngModelOptionsCtrl = ctrls[1]
                  , formCtrl = ctrls[2];
                scope.ngModelOptions = d4cCustomInputHelper.getAndResetNgModelOptions(ngModelOptionsCtrl);
                scope.setToNow = function() {
                    scope.datetime = moment().millisecond(0).toDate();
                }
                ;
                var updateViewValue = function() {
                    var parsedDate = moment(scope.datetime);
                    ngModelCtrl.$setViewValue(parsedDate.utc().format());
                    ngModelCtrl.$commitViewValue();
                };
                ngModelCtrl.$validators.validDatetime = function(modelValue, viewValue) {
                    var value = modelValue || viewValue;
                    return moment(value).isValid();
                }
                ;
                ngModelCtrl.$render = function() {
                    scope.datetime = moment(ngModelCtrl.$viewValue).toDate();
                }
                ;
                scope.$watch('datetime', function(nv, ov) {
                    if (!angular.equals(nv, ov)) {
                        d4cCustomInputHelper.setMainControlDirty(formCtrl, scope.name);
                        updateViewValue();
                    }
                }, true);
                var template = '' + '<div class="d4c-form__addon-wrapper ' + (attrs.width ? 'd4c-form__addon-wrapper--' + attrs.width : '') + '">' + '   <input type="datetime-local"' + '          class="d4c-form__control"' + '          id="{{ id }}"' + '          name="{{ name }}"' + '          ng-disabled="disabled"' + '          ng-readonly="readonly"' + '          ng-model="datetime"' + '          ng-model-options="ngModelOptions">';
                if ('setToNowButton'in attrs) {
                    template += '' + '<button class="d4c-button d4c-form__addon" ' + '        type="button"' + '        ng-if="!readonly"' + '        ng-click="setToNow()"' + '        ng-disabled="disabled"' + '        translate>Now</button>';
                }
                template += '</div>';
                d4cCustomInput(scope, element, attrs, template);
            }
        };
    });
}
)();
;(function() {
    'use strict';
    var mod = angular.module('d4c.core');
    mod.directive('d4cEmailInput', function(d4cCustomInput, d4cCustomInputHelper) {
        return {
            restrict: 'E',
            scope: {
                id: '@',
                name: '@',
                placeholder: '@'
            },
            require: ['ngModel', '^form', '?ngModelOptions'],
            link: function(scope, element, attrs, ctrls) {
                var ngModelCtrl = ctrls[0]
                  , formCtrl = ctrls[1]
                  , ngModelOptionsCtrl = ctrls[2];
                scope.ngModelOptions = d4cCustomInputHelper.getAndResetNgModelOptions(ngModelOptionsCtrl);
                scope.formCtrl = formCtrl;
                var EMAIL_REGEXP = /^[^@]+@.+\..+$/g;
                var isEmailValid = function(email) {
                    var matches = email.match(EMAIL_REGEXP);
                    return angular.isArray(matches) && matches.length > 0;
                };
                ngModelCtrl.$render = function() {
                    scope.email = ngModelCtrl.$viewValue;
                }
                ;
                scope.$watch('email', function(email) {
                    if (scope.disabled || scope.readonly) {
                        formCtrl[attrs.name].$setValidity('', true);
                        return;
                    }
                    if (!email || isEmailValid(email)) {
                        formCtrl[attrs.name].$setValidity('', true);
                        ngModelCtrl.$setViewValue(email);
                    } else if (email) {
                        formCtrl[attrs.name].$setValidity('', false);
                    } else {
                        formCtrl[attrs.name].$setValidity('', true);
                    }
                }, true);
                d4cCustomInput(scope, element, attrs, '' + '<div class="d4c-form__horizontal-controls">' + '   <input type="text"' + '          class="d4c-form__control ' + (attrs.width ? 'd4c-form__control--' + attrs.width : '') + '"' + '          id="{{ id }}"' + '          name="{{ name }}"' + '          placeholder="{{ placeholder }}" ' + '          ng-model="email"' + '          ng-model-options="ngModelOptions"' + '          ng-disabled="disabled"' + '          ng-readonly="readonly">' + '   <div class="d4c-form__message" ' + '        ng-show="formCtrl[name].$invalid" translate>Not a valid email address</div>' + '</div>');
            }
        };
    });
}
)();
;(function() {
    'use strict';
    var mod = angular.module('d4c.core');
    mod.directive('d4cFileInput', function(translate, $timeout, d4cCustomInput, D4CMimeTypeChecker) {
        return {
            restrict: 'E',
            scope: {
                id: '@',
                name: '@',
                constraintsMessage: '@',
                onchange: '&'
            },
            replace: true,
            link: function(scope, element, attrs) {
                var mimetypeChecker = new D4CMimeTypeChecker(attrs.accept);
                var hiddenInputElement = function() {
                    return element.find('.d4c-file-input__hidden-input');
                };
                scope.triggerInputClick = function() {
                    hiddenInputElement().trigger('click');
                }
                ;
                scope.clearInput = function() {
                    hiddenInputElement().val('');
                }
                ;
                element = d4cCustomInput(scope, element, attrs, '' + '<div class="d4c-file-input ' + (attrs.width ? 'd4c-file-input--' + attrs.width : '') + '">' + ('multiple'in attrs ? '   <div class="d4c-file-input__cta" translate>' + '       Drag and drop files here or ' + '       <button class="d4c-button d4c-button--link"' + '               ng-click="triggerInputClick()">' + '           browse' + '       </button>' + '   </div>' : '   <div class="d4c-file-input__cta" translate>' + '       Drag and drop file here or ' + '       <button class="d4c-button d4c-button--link"' + '               ng-click="triggerInputClick()">' + '           browse' + '       </button>' + '   </div>') + '   <div class="d4c-file-input__constraints-message"' + '        ng-show="constraintsMessage">' + '       {{ constraintsMessage }}' + '   </div>' + '   <input class="d4c-file-input__hidden-input" ' + '          type="file"' + ('multiple'in attrs ? ' multiple ' : '') + (attrs.accept ? ' accept="' + attrs.accept + '" ' : '') + '          name="{{ name }}"' + '          id="{{ id }}"' + '          onchange="angular.element(this).scope().onchange({files: this.files, clearInput: angular.element(this).scope().clearInput})">' + '</div>');
                var counter = 0;
                element.on('dragenter', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    counter++;
                    element.addClass('d4c-file-input--on-drag');
                    return false;
                });
                element.on('dragover', function(event) {
                    event.preventDefault();
                    event.stopPropagation();
                    element.addClass('d4c-file-input--on-drag');
                    return false;
                });
                element.on('dragleave', function(event) {
                    counter--;
                    if (counter === 0) {
                        event.preventDefault();
                        event.stopPropagation();
                        element.removeClass('d4c-file-input--on-drag');
                        return false;
                    }
                });
                element.on('drop', function(event) {
                    counter = 0;
                    element.removeClass('d4c-file-input--on-drag');
                    if (event.originalEvent.dataTransfer) {
                        if (event.originalEvent.dataTransfer.files.length) {
                            event.preventDefault();
                            event.stopPropagation();
                            var files = [];
                            angular.forEach(event.originalEvent.dataTransfer.files, function(file) {
                                if (!('multiple'in attrs) && files.length > 0) {
                                    return;
                                }
                                if (!mimetypeChecker.match(file)) {
                                    return;
                                }
                                files.push(file);
                            });
                            scope.onchange({
                                files: files
                            });
                            return false;
                        }
                    }
                });
            }
        };
    });
}
)();
;(function() {
    'use strict';
    var mod = angular.module('d4c.core');
    mod.directive('d4cMultiDatalist', function(d4cCustomInput, d4cCustomInputHelper, $timeout, d4cMultiInputHelper) {
        return {
            restrict: 'E',
            scope: {
                id: '@',
                name: '@',
                width: '@',
                placeholder: '@',
                options: '='
            },
            require: ['ngModel', '?ngModelOptions', '^form'],
            link: function(scope, element, attrs, ctrls) {
                var ngModelCtrl = ctrls[0]
                  , ngModelOptionsCtrl = ctrls[1]
                  , formCtrl = ctrls[2];
                scope.ngModelOptions = d4cCustomInputHelper.getAndResetNgModelOptions(ngModelOptionsCtrl);
                scope.reducedOptions = [];
                scope.formCtrl = formCtrl;
                var options = [];
                var reducedOptions = function() {
                    if (angular.isArray(options)) {
                        return options.filter(function(option) {
                            return scope.values.indexOf(option) === -1;
                        });
                    }
                    return options;
                };
                scope.$watch('options', function(nv) {
                    options = nv || [];
                    scope.reducedOptions = reducedOptions();
                }, true);
                scope.$watch('values', function() {
                    scope.reducedOptions = reducedOptions();
                }, true);
                element = d4cCustomInput(scope, element, attrs, '' + '<div class="d4c-multi-datalist">' + '   <div class="d4c-form__check-line">' + '       <div class="d4c-form__horizontal-controls">' + '           <div class="d4c-form__addon-wrapper ' + (attrs.width ? 'd4c-form__addon-wrapper--' + attrs.width : '') + '">' + '               <d4c-datalist ng-model="newValue"' + '                             width="{{ width }}"' + '                             id="{{ id }}"' + '                             name="{{ name + \'-new\' }}"' + '                             ng-disabled="disabled"' + '                             ng-readonly="readonly"' + '                             ng-keydown="onNewValueKeyDown($event)"' + '                             placeholder="{{ placeholder }}"' + '                             on-select="addNewValue()"' + '                             options="reducedOptions"></d4c-datalist>' + '               <button class="d4c-button d4c-form__addon"' + '                       type="button"' + '                       ng-disabled="disabled"' + '                       ng-readonly="readonly"' + '                       ng-click="addNewValue()"' + '                       aria-label="Add value" ' + '                       translate="aria-label">' + '                   <i class="fa fa-plus" aria-hidden="true"></i>' + '               </button>' + '           </div>' + '           <div class="d4c-form__message d4c-form__message--danger" ' + '                ng-show="formCtrl[name + \'-new\'].$invalid" translate>Value already in list</div>' + '       </div>' + '   </div>' + '   <div class="d4c-form__horizontal-controls"' + '        ng-repeat="value in values track by $index">' + '       <div class="d4c-form__addon-wrapper ' + (attrs.width ? 'd4c-form__addon-wrapper--' + attrs.width : '') + '">' + '           <d4c-datalist ng-model="values[$index]"' + '                         width="' + attrs.width + '"' + '                         name="{{ name + $index }}" ' + '                         ng-keydown="onKeyDown($event, $index)"' + '                         ng-model-options="ngModelOptions"' + '                         ng-disabled="disabled || disabledValue[$index]"' + '                         ng-readonly="readonly"' + '                         options="options"></d4c-datalist>' + '           <button class="d4c-button d4c-form__addon"' + '                   type="button"' + '                   ng-disabled="disabled || disabledValue[$index]"' + '                   ng-readonly="readonly"' + '                   ng-click="removeValue($index)"' + '                   aria-label="Remove value"' + '                   translate="aria-label">' + '               <i class="fa fa-trash" aria-hidden="true"></i>' + '           </button>' + '       </div>' + '       <div class="d4c-form__message d4c-form__message--danger" ' + '            ng-show="formCtrl[name + $index].$invalid" translate>Value already in list</div>' + '   </div>' + '</div>');
                d4cMultiInputHelper.setupNewValue(scope, element, formCtrl);
                d4cMultiInputHelper.setupSingleValues(scope, element);
                d4cMultiInputHelper.setupNgModel(scope, element, ngModelCtrl, formCtrl);
            }
        };
    });
}
)();
;(function() {
    'use strict';
    var mod = angular.module('d4c.core');
    mod.directive('d4cMultiSelect', function(d4cCustomInput, d4cCustomInputHelper, $timeout, d4cMultiInputHelper) {
        return {
            restrict: 'E',
            scope: {
                id: '@',
                name: '@',
                width: '@',
                options: '='
            },
            require: ['ngModel', '^form'],
            link: function(scope, element, attrs, ctrls) {
                var ngModelCtrl = ctrls[0]
                  , formCtrl = ctrls[1];
                scope.formCtrl = formCtrl;
                var ngOptionsTemplate;
                if (scope.options.length && angular.isArray(scope.options[0])) {
                    ngOptionsTemplate = 'ng-options="option[0] as option[1] for option in options"';
                } else {
                    ngOptionsTemplate = 'ng-options="option as option for option in options"';
                }
                var template = '' + '<div class="d4c-multi-select">' + '   <div class="d4c-form__check-line">' + '       <div class="d4c-form__horizontal-controls">' + '           <select class="d4c-form__control ' + (attrs.width ? 'd4c-form__control--' + attrs.width : '') + '"' + '                   id="{{ id }}"' + '                   name="{{ name + \'-new\' }}"' + '                   ng-model="newValue"' + '                   ng-change="addNewValue()"' + '                   ng-model-options="{}"' + '                   ng-disabled="disabled" ' + '                   ng-readonly="readonly"' + '                   ' + ngOptionsTemplate + '></select>' + '           <div class="d4c-form__message d4c-form__message--danger" ' + '                ng-show="formCtrl[name + \'-new\'].$invalid" translate>Value already in list</div>' + '       </div>' + '   </div>' + '   <div class="d4c-multi-select__values">' + '       <div class="d4c-form__horizontal-controls"' + '            ng-repeat="value in values track by $index">' + '           <div class="d4c-form__addon-wrapper ' + (attrs.width ? 'd4c-form__addon-wrapper--' + attrs.width : '') + '">' + '               <select class="d4c-form__control"' + '                       ng-class="{\'d4c-form__control--danger\': formCtrl[name + $index].$invalid}" ' + '                       name="{{ name + $index}}"' + '                       ng-disabled="disabled || disabledValue[$index]" ' + '                       ng-readonly="readonly"' + '                       ng-model="values[$index]"' + '                       ng-model-options="{}"' + '                       ' + ngOptionsTemplate + '></select>' + '               <button class="d4c-button d4c-form__addon"' + '                       type="button"' + '                       ng-disabled="disabled || disabledValue[$index]" ' + '                       ng-readonly="readonly"' + '                       ng-click="removeValue($index)">' + '                   <i class="fa fa-trash" aria-label="Remove value" translate="aria-label"></i>' + '               </button>' + '           </div>' + '           <div class="d4c-form__message d4c-form__message--danger" ' + '                ng-show="formCtrl[name + $index].$invalid" translate>Value already in list</div>' + '           </div>' + '       </div>' + '   </div>' + '</div>';
                element = d4cCustomInput(scope, element, attrs, template);
                d4cMultiInputHelper.setupNewValue(scope, element, formCtrl);
                d4cMultiInputHelper.setupSingleValues(scope, element);
                d4cMultiInputHelper.setupNgModel(scope, element, ngModelCtrl, formCtrl);
                scope.$watch(function() {
                    return formCtrl[scope.name + '-new'].$valid;
                }, function(nv, ov) {
                    if (nv && !ov) {
                        scope.newValue = undefined;
                    }
                });
            }
        };
    });
}
)();
;(function() {
    'use strict';
    var mod = angular.module('d4c.core');
    mod.directive('d4cMultiTextInput', function($timeout, d4cCustomInput, d4cCustomInputHelper, $rootScope, d4cMultiInputHelper) {
        return {
            restrict: 'E',
            scope: {
                id: '@',
                name: '@',
                width: '@',
                placeholder: '@',
                helpText: '@'
            },
            require: ['ngModel', '?ngModelOptions', '^form'],
            replace: true,
            link: function(scope, element, attrs, ctrls) {
                var ngModelCtrl = ctrls[0]
                  , ngModelOptionsCtrl = ctrls[1]
                  , formCtrl = ctrls[2];
                scope.formCtrl = formCtrl;
                scope.ngModelOptions = d4cCustomInputHelper.getAndResetNgModelOptions(ngModelOptionsCtrl);
                element = d4cCustomInput(scope, element, attrs, '' + '<div class="d4c-multi-text-input">' + '    <div class="d4c-form__check-line">' + '       <div class="d4c-form__horizontal-controls">' + '           <div class="d4c-form__addon-wrapper ' + (attrs.width ? 'd4c-form__addon-wrapper--' + attrs.width : '') + '">' + '               <input type="text" ' + '                      class="d4c-form__control"' + '                      ng-model="newValue"' + '                      ng-keydown="onNewValueKeyDown($event)" ' + '                      placeholder="{{ placeholder }}"' + '                      id="{{ id }}"' + '                      name="{{ name+\'-new\' }}"' + '                      ng-disabled="disabled" ' + '                      ng-readonly="readonly">' + '               <button class="d4c-button d4c-form__addon"' + '                       type="button"' + '                       ng-disabled="disabled" ' + '                       ng-readonly="readonly" ' + '                       ng-click="addNewValue()"' + '                       aria-label="Add new value" ' + '                       translate="aria-label" >' + '                   <i class="fa fa-plus" aria-hidden="true"></i>' + '               </button>' + '           </div>' + '           <div class="d4c-form__message d4c-form__message--danger" ' + '                ng-show="formCtrl[name + \'-new\'].$invalid" translate>Value already in list</div>' + '       </div>' + '       <p class="d4c-form__help-text" ng-if="helpText">{{ helpText }}</p>' + '    </div>' + '    <div class="d4c-multi-text-input__values">' + '       <div class="d4c-form__horizontal-controls"' + '            ng-repeat="value in values track by $index">' + '           <div class="d4c-form__addon-wrapper ' + (attrs.width ? 'd4c-form__addon-wrapper--' + attrs.width : '') + '">' + '               <input type="text" ' + '                      class="d4c-form__control"' + '                      ng-class="{\'d4c-form__control--danger\': formCtrl[name + $index].$invalid}" ' + '                      name="{{ name + $index }}" ' + '                      ng-model="values[$index]"' + '                      ng-model-options="ngModelOptions" ' + '                      ng-keydown="onKeyDown($event, $index)"' + '                      ng-disabled="disabled || disabledValue[$index]" ' + '                      ng-readonly="readonly">' + '               <button class="d4c-button d4c-form__addon"' + '                       type="button"' + '                       ng-disabled="disabled || disabledValue[$index]" ' + '                       ng-readonly="readonly" ' + '                       ng-click="removeValue($index)"' + '                       aria-label="Remove value"' + '                       translate="aria-label">' + '                   <i class="fa fa-trash" aria-hidden="true"></i>' + '               </button>' + '           </div>' + '           <div class="d4c-form__message d4c-form__message--danger" ' + '                ng-show="formCtrl[name + $index].$invalid" translate>Value already in list</div>' + '       </div>' + '    </div>' + '</div>');
                d4cMultiInputHelper.setupNewValue(scope, element, formCtrl);
                d4cMultiInputHelper.setupSingleValues(scope, element);
                d4cMultiInputHelper.setupNgModel(scope, element, ngModelCtrl, formCtrl);
            }
        };
    });
}
)();
;(function() {
    'use strict';
    var mod = angular.module('d4c.core');
    mod.directive('d4cSelect', function($timeout, translate, $compile) {
        return {
            restrict: 'E',
            require: 'ngModel',
            replace: true,
            scope: {
                choices: '=',
                ariaLabelText: '@'
            },
            link: function(scope, element, attrs, ngModel) {
                var template = '' + '<div class="d4c-select__container">' + '   <div tabindex="0" class="d4c-select" ' + '        ng-click="toggle($event)"' + '        ng-keydown="checkSelectKey($event)"' + '        role="listbox"' + '        aria-label="{{translatedLabel }}"' + '        aria-activedescendant="selectDropdownActiveOption"' + '        aria-expanded="{{ displayed }}"' + '        aria-live="polite">' + '       <img class="d4c-select__dropdown__item__image" ng-src="{{value.image}}" aria-hidden="true">' + '   </div>' + '   <div class="d4c-select__dropdown" ng-if="displayed" ng-mouseenter="cleanActives()" >' + '       <div ng-repeat="choice in choices" class="d4c-select__dropdown__item-container"  ' + '            ng-class="{\'d4c-select__dropdown__item-container--active\': (choice.name === valueName && focusSelected) || hover}"' + '            ng-click="selectValue(choice.name)"' + '            ng-mouseover="hover = true"' + '            ng-mouseleave="hover = false" ' + '            name="{{choice.name}}"' + '            ng-mouseenter="resetMouse()"' + '            ng-mousemove="!scope.mouseRestarted && checkMouseRestart($event)"' + '            aria-label="{{choice.label}}"' + '            role="option"' + '            tabindex="0"' + '            ng-keydown="checkListKey($event)"' + '            ng-attr-id=""{{choice.name === valueName && \'selectDropdownActiveOption\'}}">' + '           <i class="fa fa-check d4c-select__dropdown__item--check" ng-if="value.name === choice.name" aria-hidden="true"></i>' + '           <div class="d4c-select__dropdown__item">' + '               <img class="d4c-select__dropdown__item__image" ng-src="{{choice.image}}">' + '           </div >' + '       </div>' + '   </div>' + '</div>';
                element.replaceWith($compile(template)(scope));
                var activeButton;
                scope.displayed = false;
                scope.inside = false;
                scope.mouseRestarted = false;
                var unregister = scope.$watch(function() {
                    return ngModel.$viewValue;
                }, initialize);
                function initialize(value) {
                    ngModel.$setViewValue(value);
                    scope.valueName = ngModel.$viewValue;
                    if (scope.valueName !== 'NaN') {
                        getChoice(scope.valueName);
                    }
                    unregister();
                    scope.translatedLabel = format_string(translate('{aria} selection list. Current value is {value}'), {
                        aria: scope.ariaLabelText,
                        value: scope.value.label
                    });
                }
                scope.toggle = function(event) {
                    if (scope.displayed) {
                        scope.closeDropdown();
                    } else {
                        scope.openDropdown(event);
                    }
                }
                ;
                scope.openDropdown = function(event) {
                    activeButton = event.target;
                    scope.displayed = true;
                    scope.focusSelected = true;
                    $(document).bind('click', handleClick);
                    $timeout(function() {
                        scope.setActiveFocus();
                    });
                }
                ;
                scope.closeDropdown = function() {
                    scope.displayed = false;
                    scope.cleanActives();
                    $(activeButton).focus();
                    $(document).unbind('click', handleClick);
                }
                ;
                scope.selectValue = function(choiceName) {
                    scope.valueName = choiceName;
                    getChoice(choiceName);
                    ngModel.$setViewValue(scope.valueName);
                    scope.closeDropdown();
                    scope.translatedLabel = format_string(translate('{aria} selection list. Current value is {value}'), {
                        aria: scope.ariaLabelText,
                        value: scope.value.label
                    });
                }
                ;
                var getChoice = function(valueName) {
                    angular.forEach(scope.choices, function(choice) {
                        if (choice.name === valueName) {
                            scope.value = choice;
                            return;
                        }
                    });
                };
                scope.resetMouse = function() {
                    scope.mouseRestarted = false;
                }
                ;
                scope.checkMouseRestart = function(e) {
                    scope.cleanActives();
                    $(e.target).addClass('d4c-select__dropdown__item-container--active');
                    scope.mouseRestarted = true;
                }
                ;
                scope.cleanActives = function() {
                    $('.d4c-select__dropdown__item-container--active').removeClass('d4c-select__dropdown__item-container--active');
                }
                ;
                scope.setActiveFocus = function() {
                    $('.d4c-select__dropdown__item-container--active').focus();
                }
                ;
                scope.checkSelectKey = function(keyEvent) {
                    if ((keyEvent.keyCode === 32 || keyEvent.keyCode === 38 || keyEvent.keyCode === 40) && !scope.displayed) {
                        keyEvent.preventDefault();
                        scope.openDropdown(keyEvent);
                    } else if (keyEvent.wich === 9 && scope.displayed) {
                        scope.closeDropdown();
                    }
                }
                ;
                scope.checkListKey = function(keyEvent) {
                    var currentActiveItem, nextSibling, previousSibling, currentValue;
                    if (keyEvent.keyCode == 38 && scope.displayed) {
                        keyEvent.preventDefault();
                        currentActiveItem = $('.d4c-select__dropdown__item-container--active');
                        previousSibling = currentActiveItem.prev();
                        if (previousSibling.hasClass('d4c-select__dropdown__item-container')) {
                            scope.cleanActives();
                            previousSibling.addClass('d4c-select__dropdown__item-container--active');
                            scope.setActiveFocus();
                        }
                    } else if (keyEvent.keyCode == 40 && scope.displayed) {
                        keyEvent.preventDefault();
                        currentActiveItem = $('.d4c-select__dropdown__item-container--active');
                        nextSibling = currentActiveItem.next();
                        if (nextSibling.hasClass('d4c-select__dropdown__item-container')) {
                            scope.cleanActives();
                            nextSibling.addClass('d4c-select__dropdown__item-container--active');
                            scope.setActiveFocus();
                        }
                    } else if (keyEvent.keyCode == 27 && scope.displayed) {
                        keyEvent.preventDefault();
                        scope.closeDropdown();
                    } else if (keyEvent.keyCode == 9) {
                        scope.closeDropdown();
                    } else if (keyEvent.keyCode == 13 && scope.displayed) {
                        currentValue = $('.d4c-select__dropdown__item-container--active')[0].attributes.name.value;
                        scope.selectValue(currentValue);
                    }
                }
                ;
                function handleClick(event) {
                    var isChild = $(activeButton).find(event.target).length > 0;
                    var isSelf = $(activeButton)[0] == event.target;
                    if (isChild || isSelf) {
                        return;
                    }
                    scope.$apply(function() {
                        scope.displayed = false;
                    });
                }
            }
        };
    });
}
)();
;(function() {
    'use strict';
    var mod = angular.module('d4c.core');
    mod.directive('d4cTagsInput', function(d4cCustomInput, d4cMultiInputHelper, $timeout) {
        return {
            restrict: 'E',
            require: ['ngModel', '^form'],
            scope: {
                id: '@',
                name: '@',
                width: '@',
                helpText: '@'
            },
            link: function(scope, element, attrs, ctrls) {
                var ngModelCtrl = ctrls[0]
                  , formCtrl = ctrls[1];
                scope.formCtrl = formCtrl;
                element = d4cCustomInput(scope, element, attrs, '' + '<div class="d4c-tags-input">' + '   <div class="d4c-form__check-line">' + '       <div class="d4c-form__horizontal-controls">' + '           <div class="d4c-form__addon-wrapper ' + (attrs.width ? 'd4c-form__addon-wrapper--' + attrs.width : '') + '">' + '               <input type="text"' + '                      class="d4c-form__control"' + '                      id="{{ id }}"' + '                      name="{{ name + \'-new\' }}"' + '                      ng-keydown="onNewValueKeyDown($event)" ' + '                      ng-model="newValue"' + '                      ng-disabled="disabled"' + '                      ng-readonly="readonly"' + '                      ng-model-options="{}">' + '               <button class="d4c-form__addon d4c-button"' + '                       type="button"' + '                       ng-disabled="disabled"' + '                       ng-readonly="readonly"' + '                       ng-click="addNewValue()"' + '                       aria-label="Add value" translate="aria-label" >' + '                   <i class="fa fa-plus" aria-hidden="true"></i>' + '               </button>' + '           </div>' + '           <div class="d4c-form__message d4c-form__message--danger" ' + '                ng-show="formCtrl[name + \'-new\'].$invalid" translate>Value already in list</div>' + '       </div>' + '       <div class="d4c-form__help-text" ng-if="helpText">{{ helpText }}</div>' + '   </div>' + '   <d4c-tag ng-repeat="value in values"' + '            tag="value"' + '            ng-click="removeValue($index)"' + '            tabindex="0"' + '            ng-keydown="onKeyDown($event, $index)"' + '            delete-button="true"></d4c-tag>' + '</div>');
                d4cMultiInputHelper.setupNewValue(scope, element, formCtrl, true);
                d4cMultiInputHelper.setupSingleValues(scope, element, 0);
                d4cMultiInputHelper.setupNgModel(scope, element, ngModelCtrl, formCtrl);
                scope.onKeyDown = function(event, index) {
                    if (event.keyCode === 13) {
                        scope.removeValue(index);
                        $timeout(function() {
                            if (index === 0 && scope.values.length === 0) {
                                $(element.find('input')).focus();
                            } else if (index > 0 && index === scope.values.length) {
                                $(element.find('.d4c-tag')[index - 1]).focus().addClass('focus-ring');
                            } else {
                                $(element.find('.d4c-tag')[index]).focus().addClass('focus-ring');
                            }
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
    var mod = angular.module('d4c.core');
    mod.directive("d4cToggle", function() {
        return {
            restrict: 'E',
            require: 'ngModel',
            scope: {
                leftLabel: '@',
                leftTooltip: '@',
                leftValue: '=',
                rightLabel: '@',
                rightTooltip: '@',
                rightValue: '=',
                defaultValue: '='
            },
            replace: true,
            template: '' + '<div class="d4c-toggle">' + '   <span ng-bind="leftLabel" ng-click="toggleModel(leftValue)"></span>' + '   <i ng-if="leftTooltip" class="fa fa-info-circle" d4c-tooltip="{{leftTooltip}}"></i>' + '   <div class="d4c-toggle__toggle" ' + '        ng-click="toggleModel()"' + '        ng-class="{\'d4c-toggle__toggle--left\': model == leftValue, \'d4c-toggle__toggle--right\': model == rightValue}"' + '        aria-label="Toggle" translate="aria-label"></div>' + '   <span ng-bind="rightLabel" ng-click="toggleModel(rightValue)"></span>' + '   <i ng-if="rightTooltip" class="fa fa-info-circle" d4c-tooltip="{{rightTooltip}}"></i>' + '</div>',
            link: function(scope, element, attrs, ngModelCtrl) {
                scope.toggleModel = function(value) {
                    if (angular.isDefined(value)) {
                        scope.model = value;
                    } else {
                        scope.model = (scope.model === scope.leftValue) ? scope.rightValue : scope.leftValue;
                    }
                    ngModelCtrl.$setViewValue(scope.model);
                }
                ;
                var render = function() {
                    if ([scope.leftValue, scope.rightValue].indexOf(ngModelCtrl.$viewValue) === -1) {
                        scope.model = scope.defaultValue;
                    } else {
                        scope.model = ngModelCtrl.$viewValue;
                    }
                };
                ngModelCtrl.$render = render;
                render();
            }
        };
    });
}
)();
;(function() {
    'use strict';
    var mod = angular.module('d4c.core');
    mod.directive('d4cUpdateOnKey', function() {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: false,
            link: function(scope, element, attrs, ngModelCtrl) {
                var keys = attrs.d4cUpdateOnKey.split(' ');
                var keyNames = {
                    13: 'enter',
                    27: 'escape'
                };
                element.bind("keyup", function(event) {
                    if (event.keyCode in keyNames && keys.indexOf(keyNames[event.keyCode]) > -1) {
                        ngModelCtrl.$commitViewValue();
                        scope.$apply();
                    }
                });
            }
        };
    });
}());
;(function() {
    "use strict";
    var mod = angular.module('d4c.core');
    mod.factory('d4cBindModelToScope', function() {
        return function(scope, ngModelCtrl) {
            ngModelCtrl.$render = function() {
                scope.model = angular.copy(ngModelCtrl.$viewValue);
            }
            ;
            scope.$watch('model', function() {
                ngModelCtrl.$setViewValue(scope.model);
            }, true);
        }
        ;
    });
    mod.factory('d4cFormInputHelper', ['$parse', function($parse) {
        var isStateFunction = function(state) {
            var ngState = 'ng' + state.charAt(0).toUpperCase() + state.slice(1);
            return function(scope, attrs) {
                return !!(ngState in attrs && $parse(attrs[ngState])(scope.$parent));
            }
            ;
        };
        var isReadonly = isStateFunction('readonly');
        var isDisabled = isStateFunction('disabled');
        return {
            isReadonly: isReadonly,
            isDisabled: isDisabled
        };
    }
    ]);
    mod.factory('d4cBindInputStateToScope', ['d4cFormInputHelper', function(d4cFormInputHelper) {
        return function(scope, attrs) {
            scope.$watch(function() {
                return [d4cFormInputHelper.isDisabled(scope, attrs), d4cFormInputHelper.isReadonly(scope, attrs)];
            }, function(nv) {
                scope.disabled = nv[0];
                scope.readonly = nv[1];
            }, true);
        }
        ;
    }
    ]);
    mod.factory('d4cCompileAndReplace', ['$compile', function($compile) {
        return function(scope, element, template) {
            var newElement = angular.element(template);
            element.replaceWith(newElement);
            $compile(newElement)(scope);
            return newElement;
        }
        ;
    }
    ]);
    mod.factory('d4cCustomInputHelper', function() {
        return {
            getAndResetNgModelOptions: function(ngModelOptionsCtrl) {
                var ngModelOptions = {};
                if (ngModelOptionsCtrl && ngModelOptionsCtrl.$options) {
                    ngModelOptions = angular.copy(ngModelOptionsCtrl.$options);
                    for (var key in ngModelOptionsCtrl.$options) {
                        if (ngModelOptionsCtrl.$options.hasOwnProperty(key)) {
                            delete ngModelOptionsCtrl.$options[key];
                        }
                    }
                    ngModelOptionsCtrl.$options.updateOnDefault = true;
                }
                if (ngModelOptions.updateOnDefault) {
                    if (ngModelOptions.updateOn) {
                        ngModelOptions.updateOn += ' default';
                    } else {
                        ngModelOptions.updateOn = 'default';
                    }
                }
                if (!ngModelOptions.debounce) {
                    ngModelOptions.debounce = {};
                }
                return ngModelOptions;
            },
            setMainControlDirty: function(formCtrl, name) {
                if (formCtrl && name && formCtrl[name]) {
                    formCtrl[name].$setDirty();
                }
            }
        };
    });
    mod.factory('d4cCustomInput', ['d4cBindInputStateToScope', 'd4cCompileAndReplace', function(d4cBindInputStateToScope, d4cCompileAndReplace) {
        return function(scope, element, attrs, template) {
            d4cBindInputStateToScope(scope, attrs);
            return d4cCompileAndReplace(scope, element, template);
        }
        ;
    }
    ]);
    mod.factory('d4cMultiInputHelper', ['$timeout', 'd4cCustomInputHelper', '$rootScope', function($timeout, d4cCustomInputHelper, $rootScope) {
        return {
            setupNewValue: function(scope, element, formCtrl, insertAtEnd) {
                scope.addNewValue = function() {
                    if (!scope.newValue) {
                        return;
                    }
                    if (scope.values.indexOf(scope.newValue) === -1) {
                        if (insertAtEnd) {
                            scope.values.push(scope.newValue);
                        } else {
                            scope.values.unshift(scope.newValue);
                        }
                        scope.newValue = '';
                    } else {
                        formCtrl[scope.name + '-new'].$setValidity('unique', false);
                    }
                    $timeout(function() {
                        element.find('.d4c-form__control')[0].focus();
                    });
                }
                ;
                var validate = function() {
                    if (!scope.newValue || scope.values.indexOf(scope.newValue) === -1) {
                        formCtrl[scope.name + '-new'].$setValidity('unique', true);
                    }
                };
                scope.$watch('newValue', validate);
                scope.$watch('values', validate, true);
                scope.onNewValueKeyDown = function(event) {
                    if (event.keyCode === 13) {
                        scope.addNewValue();
                    }
                }
                ;
            },
            setupSingleValues: function(scope, element, removeDelay) {
                scope.disabledValue = {};
                scope.removeValue = function(index) {
                    scope.disabledValue[index] = true;
                    $timeout(function() {
                        scope.values.splice(index, 1);
                        scope.disabledValue[index] = false;
                    }, angular.isDefined(removeDelay) ? removeDelay : 300);
                }
                ;
                scope.onKeyDown = function(event, index) {
                    if (event.keyCode === 13) {
                        if (index < scope.values.length - 1) {
                            $(element).find('input')[index + 2].focus();
                        } else {
                            $(element).find('input')[0].focus();
                        }
                    }
                    if (event.keyCode === 8 && event.target.value === '') {
                        scope.removeValue(index);
                        event.preventDefault();
                    }
                }
                ;
            },
            setupNgModel: function(scope, element, ngModelCtrl, formCtrl) {
                ngModelCtrl.$render = function() {
                    scope.values = angular.copy(ngModelCtrl.$viewValue) || [];
                    scope.newValue = '';
                }
                ;
                var buildRemoveFunction = function(index) {
                    var remove = function() {
                        if (scope.values[index]) {
                            return;
                        }
                        if (!$(element.find('input')[index + 1]).is(':focus')) {
                            scope.removeValue(index);
                        } else {
                            $timeout(remove, 100);
                        }
                    };
                    return remove;
                };
                scope.$watch('values', function(nv, ov) {
                    if (angular.equals(nv, ov)) {
                        return;
                    }
                    var valid = true;
                    var i;
                    for (i = nv.length - 1; i >= 0; i--) {
                        if (!nv[i]) {
                            var removeIfNotFocus = buildRemoveFunction(i);
                            removeIfNotFocus();
                        }
                    }
                    if (nv.length === ov.length) {
                        var modified;
                        for (i = 0; i < nv.length; i++) {
                            if (nv[i] !== ov[i]) {
                                modified = i;
                            }
                        }
                        if (nv.indexOf(nv[modified]) < modified || nv.indexOf(nv[modified], modified + 1) > -1) {
                            formCtrl[scope.name + modified].$setValidity('unique', false);
                            valid = false;
                        }
                    }
                    if (valid) {
                        for (i = 0; i < nv.length; i++) {
                            if (nv.indexOf(nv[i], i + 1) > -1) {
                                valid = false;
                                break;
                            }
                        }
                    }
                    if (valid) {
                        for (i = 0; i < nv.length; i++) {
                            if (formCtrl[scope.name + i]) {
                                formCtrl[scope.name + i].$setValidity('unique', true);
                            }
                        }
                        d4cCustomInputHelper.setMainControlDirty(formCtrl, scope.name);
                        ngModelCtrl.$setViewValue(angular.copy(nv));
                    } else {
                        $rootScope.$broadcast(scope.id, {
                            event: 'save',
                            status: 'error'
                        });
                    }
                }, true);
            }
        };
    }
    ]);
}());
;(function() {
    "use strict";
    var mod = angular.module('d4c.core');
    var D4CMimeType = function(mimetypeAsString) {
        this.type = undefined;
        this.subtype = undefined;
        this.extension = undefined;
        mimetypeAsString = mimetypeAsString ? mimetypeAsString.toLowerCase() : '*/*';
        if (mimetypeAsString.indexOf('.') === 0) {
            this.extension = mimetypeAsString.substr(1);
        } else {
            var elements = mimetypeAsString.split('/');
            this.type = elements[0];
            this.subtype = (this.type !== '*' && elements[1]) || '*';
        }
        this.match = function(file) {
            if (this.type === '*') {
                return true;
            }
            if (this.extension) {
                var extension = file.name.toLowerCase().split('.').pop();
                return this.extension === extension;
            }
            var mimetype = new D4CMimeType(file.type);
            return this.type === mimetype.type && (this.subtype === mimetype.subtype || this.subtype === '*');
        }
    };
    var D4CMimeTypeChecker = function(mimetypesAsString) {
        this.mimetypes = [];
        var that = this;
        mimetypesAsString = mimetypesAsString || '';
        angular.forEach(mimetypesAsString.split(/\s*,\s*/), function(mimetypeAsString) {
            that.mimetypes.push(new D4CMimeType(mimetypeAsString));
        });
        this.match = function(file) {
            if (!this.mimetypes.length) {
                return true;
            }
            return this.mimetypes.some(function(mimetype) {
                return mimetype.match(file);
            })
        }
        ;
    };
    mod.factory('D4CMimeType', function() {
        return D4CMimeType;
    });
    mod.factory('D4CMimeTypeChecker', function() {
        return D4CMimeTypeChecker;
    });
}());
;var app = angular.module('d4c-widgets');
app.config(function(D4CWidgetsConfigProvider) {
    D4CWidgetsConfigProvider.setConfig({
        customAPIHeaders: {
            "D4C-API-Analytics-App": "cartograph",
        },
        mapAppendAttribution: "<a href=\"/terms/terms-and-conditions/\" target=\"_blank\">Conditions d'utilisation</a>" + ' - ' + '<a class="d4c-mapbuilder__language-choice" data-langchoice="en" href="#" title="English">en</a> ' + '<a class="d4c-mapbuilder__language-choice" data-langchoice="fr" href="#" title="Francais">fr</a> ' + ''
    });
});
app.factory('MapbuilderConfig', [function() {
    return {
		'userLoggedIn': false,
		'userActivationPending': false
	};
}
]);
;$(document).ready(function() {
    setTimeout(function() {
        $('.leaflet-control-attribution').on('click', '[data-langchoice]', function(e) {
            console.log(e);
            e.preventDefault()
            var lang = $(this).attr('data-langchoice');
            console.log(lang);
            $('body').append($('<form/>', {
                id: 'tmpLangForm',
                method: 'POST',
                action: '/i18n/setlang/'
            }));
            $('#tmpLangForm').append("<input type='hidden' name='csrfmiddlewaretoken' value='xqvASyAEzd0ETPtzjVG53dl6mbiaFqQj6HM47pq5AvUvGqWCAjK8cDKxCq4NhRw9' />");
            $('#tmpLangForm').append($('<input/>', {
                type: 'hidden',
                name: 'language',
                value: lang
            }));
            $('#tmpLangForm').submit();
        })
    }, 1000);
})
