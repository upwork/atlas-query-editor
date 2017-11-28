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
angular.module('atlas.query.editor', [
    // Vendor
    'ngRoute',
    'ngMessages',
    'ngclipboard',
    'ui.bootstrap',
    'ui.codemirror',
    'angular-loading-bar',

    // Templates
    'atlas.query.editor.templates',

    // Modules
    'atlas.query.editor.query',
    'atlas.query.editor.tools'
])

    .config([
        '$routeProvider',
        function($routeProvider) {
            // Default route
            $routeProvider.otherwise({
                redirectTo: '/'
            });

            $routeProvider.when('/', {
                templateUrl: 'editor/editor.tpl.html',
                controller: 'EditorController',
                controllerAs: 'editorCtrl',
                reloadOnSearch: false,
                resolve: {
                    config: [
                        'atlasQueryService',
                        function(atlasQueryService) {
                            return atlasQueryService.fetchConfig();
                        }
                    ]
                }
            });
        }
    ])

    // -----------------------------------
    // EditorController
    // -----------------------------------
    .controller('EditorController', [
        '$scope', '$location', 'atlasQueryToolsService', 'atlasQueryService', 'config',
        function($scope, $location, atlasQueryToolsService, atlasQueryService, config) {
            var ctrl = this;

            // Set default host, in case one is not defined in $location.search()
            var defaultHost = _.find(config.hosts, {'default': true});
            if (defaultHost && !$location.search().host) {
                $location.search('host', defaultHost.url);
            }

            // Read search parameters to initialize
            ctrl.data = angular.extend({
                hostList: config.hosts || [],
                host: null,
                query: null,
                format: 'png'
            }, fromLocation($location.search()));
            ctrl.result = {
                format: null,
                data: null
            };

            // Save / Load
            ctrl.openSave = function() {
                atlasQueryToolsService.openSave(ctrl.data);
            };
            ctrl.canOpenSave = function() {
                return ctrl.data.host && ctrl.data.query.q;
            };

            ctrl.openLoad = function() {
                atlasQueryToolsService.openLoad()
                    .then(function(newData) {
                        ctrl.result.format = null;
                        ctrl.result.data = null;
                        angular.extend(ctrl.data, newData);
                    });
            };

            // Import / Export
            ctrl.openImport = function() {
                atlasQueryToolsService.openImport()
                    .then(function(newData) {
                        ctrl.result.format = null;
                        ctrl.result.data = null;
                        angular.extend(ctrl.data, newData);
                    });
            };

            ctrl.openExport = function() {
                if (!ctrl.canOpenExport()) {
                    return;
                }
                atlasQueryToolsService.openExport(ctrl.data);
            };
            ctrl.canOpenExport = function() {
                return ctrl.data.host && ctrl.data.query.q;
            };

            // View Actions
            ctrl.canSubmit = function() {
                return atlasQueryService.isActive();
            };
            ctrl.isHostsEmpty = function() {
                return _.isEmpty(ctrl.data.hostList);
            };
            ctrl.isResultVisible = function() {
                return atlasQueryService.isActive() && ctrl.result.data;
            };

            ctrl.fetchResult = function(ngFormCtrl) {
                if (ngFormCtrl.$invalid) {
                    return;
                }
                return atlasQueryService.fetchGraph(ctrl.data.query, ctrl.data.format)
                    .then(function(graphData) {
                        ctrl.result.format = ctrl.data.format;
                        ctrl.result.data = graphData;
                        ngFormCtrl.$setPristine();
                    });
            };

            // Watch query and location and sync between them
            $scope.$on('$locationChangeSuccess', function() {
                angular.extend(ctrl.data, fromLocation($location.search()));
            });

            $scope.$watch(function() {
                return ctrl.data;
            }, function(newData) {
                $location.search(toLocation(newData));
            }, true);

            $scope.$watch(function() {
                return ctrl.isResultVisible();
            }, function(isResultVisible) {
                if (!isResultVisible) {
                    ctrl.result.format = null;
                    ctrl.result.data = null;
                }
            });

            // -------------------------
            // Transformation Functions:
            function fromLocation(locationSearch) {
                var host = locationSearch.host;
                var query = angular.extend({q: ''}, locationSearch);
                delete query.host;

                if (query.w !== undefined) {
                    query.w = (1 * query.w);
                }
                if (query.h !== undefined) {
                    query.h = (1 * query.h);
                }
                if (query.zoom !== undefined) {
                    query.zoom = (1 * query.zoom);
                }

                return {
                    host: host,
                    query: query
                };
            }

            function toLocation(data) {
                var location = angular.copy(data.query);
                location.host = data.host;

                return location;
            }
        }
    ]);
