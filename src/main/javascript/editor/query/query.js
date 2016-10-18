/**
 * @license Atlas Query Editor
 *
 * Copyright (C) 2016 Upwork.com
 *
 * This file is licensed under the Apache license, Version 2.0 (the "License").
 * See the LICENSE file for details.
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/

'use strict';

angular.module('atlas.query.editor.query', [
    // Vendor
    'ui.bootstrap',
    'ui.codemirror'
])


// -----------------------------------
// Atlas Connection
// -----------------------------------
    .directive('atlasConnect', [
        'atlasQueryService',
        function(atlasQueryService) {
            return {
                restrict: 'E',
                require: '^form',
                templateUrl: 'editor/query/connect.tpl.html',
                scope: {
                    host: '='
                },
                controllerAs: 'connCtrl',
                bindToController: true,
                controller: [
                    function() {
                        var ctrl = this;

                        // Read the stored url list from service, for typeahead
                        ctrl.urlList = atlasQueryService.getStoredUrlList;

                    }
                ],
                link: function(scope, elm, atts, ngFormCtrl) {

                    //Use for highlighting the field as red/green
                    scope.isHostValid = function() {
                        return ngFormCtrl.host.$valid;
                    };

                    // When input is valid, update the url in atlasQueryService
                    scope.$watch(function() {
                        return ngFormCtrl.host.$valid;
                    }, function(isValid) {
                        atlasQueryService.setBaseUrl(isValid ? scope.connCtrl.host : null);
                    });
                }
            };
        }
    ])

    .directive('atlasValidateConnection', [
        '$q', 'atlasQueryService',
        function($q, atlasQueryService) {
            return {
                restrict: 'A',
                require: 'ngModel',
                link: function(scope, elm, atts, ngModelCtrl) {
                    ngModelCtrl.$asyncValidators.connection = function(modelValue, viewValue) {
                        var value = modelValue || viewValue;
                        if (ngModelCtrl.$isEmpty(value)) {
                            return $q.when('OK');
                        }
                        return atlasQueryService.checkConnection(modelValue);
                    };
                }
            };
        }
    ])

    // -----------------------------------
    // Query Editor Directive
    // -----------------------------------
    .directive('atlasQueryEditor', [
        '$http',
        function($http) {

            var defaultQuery = {
                q: '',
                // (1) Time
                s: 'e-3h', // Start time e-3h* Time
                e: 'now', //End time now* Time
                tz: 'UTC', //Time zone US/Pacific* Time zone ID
                // (2) Image Flags
                title: '', //Set the graph title String
                no_legend: 0, //Suppresses the legend 0 boolean
                no_legend_stats: 0, // Suppresses summary stats for the legend boolean
                axis_per_line: 0, // Put each line on a separate Y-axis boolean
                only_graph: 0, //Only show the graph canvas boolean
                vision: 'normal', //Simulate different vision types vision type: normal|protanopia|protanomaly|deuteranopia|deuteranomaly|tritanopia|tritanomaly|achromatopsia|achromatomaly
                // (3) Image Size
                layout: 'canvas', // Mode for controlling exact or relative sizing layout mode: canvas: the width or height are for the canvas component within the chart. The actual image size will be calculated based on the number of entries in the legend, number of axes, etc. This is the default behavior.|image: the width or height are for the final image not including the zoom parameter. To try and adhere to layout goals when using this mode everything below the X-axes will automatically be suppressed. Vertical alignment will still hold as long as all graphs use the same number of Y-axes. Horizontal alignment will
                                  // still hold as long as all graphs use the same number of X-axes.|iw: use exact image sizing for the width and canvas sizing for the height.|ih: use exact image sizing for the height and canvas sizing for the width.
                w: 700, //Width of the canvas or image int
                h: 300, //Height of the canvas or image int
                zoom: 1.0, //Transform the size by a zoom factor float
                // (4) Text Flags
                number_format: '%f', //How to format numbers for text output types %f float format (https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#dndec)
                // (5) Y-Axis
                stack: 0, //Set the default line style to stack 0 boolean
                l: 'auto-style', // Lower bound for the axis auto-style axis bound: auto-style: automatically determine the bounds based on the data and the style settings for that data. In particular, if the line style is area or stack, then the bounds will be adjusted to show the filled area. This is the default behavior.|auto-data: automatically determine the bounds based on the data. This will only take into account the values of the lines. In the case of stack it will account for the position of the stacked lines, but not the filled area.
                u: 'auto-style', // Upper bound for the axis auto-style axis bound: auto-style: automatically determine the bounds based on the data and the style settings for that data. In particular, if the line style is area or stack, then the bounds will be adjusted to show the filled area. This is the default behavior.|auto-data: automatically determine the bounds based on the data. This will only take into account the values of the lines. In the case of stack it will account for the position of the stacked lines, but not the filled area.
                ylabel: '', // Label for the axis String
                palette: 'armytage', //Color palette to use armytage palette armytage|epic|blues|greens|oranges|purples|reds|colors:1a9850,91cf60,d9ef8b,fee08b,fc8d59,d73027
                o: 0,  //Use a logarithmic scale 0 boolean
                tick_labels: 'decimal', //Set the mode to use for tick labels decimal tick label mode {decimal|binary|off}
                sort: 'legend', //Set the mode to use for sorting the legend expr order sort mode legend: alphabetically based on the label used in the legend. This is the default., min: using the minimum value shown the legend stats. max: using the maximum value shown the legend stats., avg: using the average value shown the legend stats., count: using the count value shown the legend stats., total: using the total value shown the legend stats., last: using the last value shown the legend stats.
                order: 'asc' //Set the order ascending or descending for the sort asc order
            };

            return {
                restrict: 'E',
                require: '^form',
                templateUrl: 'editor/query/editor.tpl.html',
                controllerAs: 'queryCtrl',
                scope: {
                    query: '='
                },
                bindToController: true,
                controller: [
                    '$scope', '$http', '$timeout', 'atlasQueryService',
                    function($scope, $http, $timeout, atlasQueryService) {
                        var ctrl = this;
                        var editor = null; // Will be filled on codemirror load

                        // View Parameters
                        ctrl.view = {
                            readOnly: function() {
                                return !atlasQueryService.isActive();
                            },
                            showExtraOptions: false,
                            editor: {
                                lineNumbers: true,
                                viewportMargin: 20,
                                theme: 'seti',
                                mode: {
                                    'name': 'atlas',
                                    'apiPath': atlasQueryService.baseUrl(),
                                    'extraTags': []
                                },
                                extraKeys: {
                                    'Alt-Space': 'atlasHint',
                                    'Ctrl-Alt-F': 'atlasFormat'
                                },
                                onLoad: function(codemirror) {
                                    editor = codemirror;
                                }
                            }
                        };

                        // View Actions
                        ctrl.actions = {
                            format: function() {
                                editor.execCommand('atlasFormat');
                            }
                        };

                        // Watchers
                        $scope.$watch(function() {
                            return atlasQueryService.baseUrl();
                        }, function() {
                            initEditor();
                        });

                        $scope.$watch(function() {
                            return ctrl.query;
                        }, function() {
                            // Add also default options when query changes
                            angular.extend(ctrl.query, angular.extend(angular.copy(defaultQuery), ctrl.query));
                        }, true);

                        // Add default options to query

                        function initEditor() {
                            // Request Tag Names from Atlas and add them to the extraTags
                            if (!atlasQueryService.isActive()) {
                                $timeout(function() {
                                    ctrl.view.editor.readOnly = 'nocursor';
                                    ctrl.view.editor.mode.apiPath = null;
                                    ctrl.view.editor.mode.extraTags.length = 0;
                                });
                            } else {
                                atlasQueryService.fetchTags()
                                    .then(function(tagNames) {
                                        ctrl.view.editor.readOnly = false;
                                        ctrl.view.editor.mode.apiPath = atlasQueryService.baseUrl();
                                        ctrl.view.editor.mode.extraTags.length = 0;
                                        angular.forEach(tagNames, function(tagName) {
                                            ctrl.view.editor.mode.extraTags.push(tagName);
                                        });
                                    });
                            }
                        }
                    }
                ]
            };
        }
    ])

    // -----------------------------------
    // Query Result Directive
    // -----------------------------------
    .directive('atlasQueryResult', [
        function() {
            return {
                restrict: 'E',
                templateUrl: 'editor/query/result.tpl.html',
                controllerAs: 'resultCtrl',
                scope: {
                    query: '='
                },
                bindToController: true,
                controller: [
                    '$scope', 'atlasQueryService',
                    function($scope, atlasQueryService) {
                        var ctrl = this;

                        // This is extra option, used only for the result
                        ctrl.queryFormat = 'png'; // png|csv|txt|json|std.json|stats.json

                        // The results
                        ctrl.result = {
                            format: null,
                            data: null
                        };

                        ctrl.view = {
                            isEnabled: function() {
                                return atlasQueryService.isActive() && !!ctrl.query.q;
                            }
                        };

                        // View Actions
                        ctrl.actions = {

                            fetchResult: function(format) {
                                // If image, just set the url as img.src
                                if (!format || format === 'png') {
                                    ctrl.result.format = 'png';
                                    ctrl.result.data = atlasQueryService.graphUrl(ctrl.query);
                                    return;
                                }
                                // else load data from atlas with an xhr call
                                return atlasQueryService.fetchGraph(ctrl.query, format)
                                    .then(function(graphData) {
                                        ctrl.result.format = format;
                                        ctrl.result.data = graphData;
                                    });
                            }
                        };

                        // Watcher
                        $scope.$watch(function() {
                            return ctrl.query;
                        }, function() {
                            ctrl.actions.fetchResult(ctrl.queryFormat);
                        }, true);
                        $scope.$watch(function() {
                            return ctrl.view.isEnabled();
                        }, function() {
                            ctrl.actions.fetchResult(ctrl.queryFormat);
                        });
                    }
                ]
            };
        }
    ])

    // -----------------------------------
    // Query Service Provider
    // -----------------------------------
    .provider('atlasQueryService', function() {
        var atlasUrl = null;

        this.setBaseUrl = function(url) {
            atlasUrl = url;
        };

        this.$get = [
            '$window', '$http', '$q', '$httpParamSerializer',
            function($window, $http, $q, $httpParamSerializer) {

                var service = {
                    isActive: function() {
                        return !!atlasUrl;
                    },
                    setBaseUrl: function(_atlasUrl) {
                        atlasUrl = _atlasUrl;
                        // also add to the storage
                        if (atlasUrl) {
                            service.storeUrl(atlasUrl);
                        }
                    },
                    baseUrl: function() {
                        return atlasUrl;
                    },
                    tagUrl: function() {
                        return atlasUrl + '/tags';
                    },
                    graphUrl: function(query, format) {
                        if (!query || !angular.isObject(query)) {
                            return atlasUrl + '/graph';
                        }
                        return atlasUrl + '/graph?' + $httpParamSerializer(query) + (format ? '&format=' + format : '');
                    },
                    fetchTags: function() {
                        return $http.get(service.tagUrl())
                            .then(function(response) {
                                return response.data;
                            });
                    },
                    fetchGraph: function(query, format) {
                        return $http.get(service.graphUrl(query, format))
                            .then(function(response) {
                                return response.data;
                            }, function(errorResponse) {
                                return errorResponse.data;
                            });
                    },
                    checkConnection: function(atlasUrl) {
                        return $http.get(atlasUrl + '/tags')
                            .then(function(response) {
                                var tagNames = response.data;
                                if (angular.isArray(tagNames) && tagNames.indexOf('name') >= 0) {
                                    return response.data;
                                } else {
                                    return $q.reject('invalid response');
                                }
                            });
                    },
                    getStoredUrlList: function() {
                        try {
                            return JSON.parse(window.localStorage.getItem('atlas.query.editor.host.list') || '[]');
                        } catch (e) {
                            $window.localStorage.removeItem('atlas.query.editor.host.list');
                            return [];
                        }
                    },
                    storeUrl: function(atlasUrl) {
                        var list = service.getStoredUrlList();
                        if (list.indexOf((atlasUrl)) < 0) {
                            list.push(atlasUrl);
                            $window.localStorage.setItem('atlas.query.editor.host.list', JSON.stringify(list));
                        }
                    },

                    getStoredQueryList: function() {
                        try {
                            return JSON.parse(window.localStorage.getItem('atlas.query.editor.query.list') || '[]');
                        } catch (e) {
                            $window.localStorage.removeItem('atlas.query.editor.query.list');
                            return [];
                        }
                    },
                    storeQuery: function(name, description, data) {
                        var obj = {
                            name: name,
                            description: description,
                            data: data
                        };
                        var list = service.getStoredQueryList();
                        var pos = -1;
                        _.forEach(list, function(query, index) {

                            if (query.name === name) {
                                pos = index;
                            }
                        });
                        if (pos < 0) {
                            list.push(obj);
                        } else {
                            // Replace item:
                            angular.extend(list[pos], obj);
                        }
                        $window.localStorage.setItem('atlas.query.editor.query.list', JSON.stringify(list));
                    },
                    removeStoredQuery: function(name) {
                        var list = service.getStoredQueryList();
                        var pos = -1;
                        _.forEach(list, function(query, index) {

                            if (query.name === name) {
                                pos = index;
                            }
                        });
                        if (pos >= 0) {
                            list.splice(pos, 1);
                            $window.localStorage.setItem('atlas.query.editor.query.list', JSON.stringify(list));
                        }
                    }
                };

                return service;
            }
        ];
    });
