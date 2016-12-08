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

angular.module('atlas.query.editor.tools', [
    // Vendor
    'ui.bootstrap'
])

// -----------------------------------
// EditorController
// -----------------------------------
    .factory('atlasQueryToolsService', [
        '$uibModal', '$httpParamSerializer',
        function($uibModal, $httpParamSerializer) {

            var service = {
                openImport: openImport,
                openExport: openExport,
                openSave: openSave,
                openLoad: openLoad
            };

            return service;

            function toGraphUrl(data, options) {
                options = options || {};
                // Start with the query only
                var queryParams = _.pick(data.query, ['q']);
                if (options.time) {
                    // Add time parameters
                    _.extend(queryParams, _.pick(data.query, ['s', 'e', 'tz']));
                }
                if (options.image) {
                    // Add all the rest
                    _.extend(queryParams, _.omit(data.query, ['q', 's', 'e', 'tz']));
                }
                // Strip query from white space characters
                queryParams.q = queryParams.q.replace(/\s/g, '');

                var queryString = $httpParamSerializer(queryParams); // Also encodes URI components
                return data.host + '/graph?' + queryString;
            }

            function openImport() {
                var modalInstance = $uibModal.open({
                    animation: true,
                    size: 'small',
                    templateUrl: 'editor/tools/tools.import.tpl.html',
                    controllerAs: 'ctrl',
                    controller: function($uibModalInstance) {
                        var ctrl = this;
                        ctrl.url = '';

                        ctrl.canSave = function(formCtrl) {
                            return formCtrl.$valid;
                        };

                        ctrl.import = function(formCtrl) {
                            if (!ctrl.canSave(formCtrl)) {
                                return;
                            }
                            // Parse url and return an object
                            var $a = document.createElement('a');
                            $a.href = ctrl.url;
                            var host = $a.protocol + '//' + $a.host + $a.pathname.replace(/\/graph/, '');
                            var query = parseQuery($a.search.slice(1).split('&'));

                            $uibModalInstance.close({
                                host: host,
                                query: query
                            });
                        };

                        ctrl.cancel = function() {
                            $uibModalInstance.dismiss('cancel');
                        };

                        function parseQuery(queryString) {
                            var queryObject = _.chain(queryString)
                                .map(function(item) {
                                    if (/^([^=]+)=([^=]+)$/.test(item)) {
                                        var parts = item.split('=');
                                        parts[1] = decodeURIComponent(parts[1]);
                                        return parts;
                                    }
                                }) // 'a=b' -> ['a', 'b']
                                .compact() // Remove {0, null, false} values from array
                                .fromPairs() // [['a', 1], ['b', 2]] -> { 'a': 1, 'b': 2 }
                                .value();
                            if (queryString.w !== undefined) {
                                queryString.w = (1 * queryString.w);
                            }
                            if (queryString.h !== undefined) {
                                queryString.h = (1 * queryString.h);
                            }
                            if (queryString.zoom !== undefined) {
                                queryString.zoom = (1 * queryString.zoom);
                            }

                            return queryObject;
                        }
                    }
                });

                return modalInstance.result;
            }

            function openExport(data) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    size: 'small',
                    templateUrl: 'editor/tools/tools.export.tpl.html',
                    controllerAs: 'ctrl',
                    controller: [
                        '$scope', '$uibModalInstance',
                        function($scope, $uibModalInstance) {
                            var ctrl = this;

                            ctrl.options = {
                                time: false,
                                image: false
                            };
                            ctrl.url = '';

                            ctrl.cancel = function() {
                                $uibModalInstance.dismiss('cancel');
                            };

                            $scope.$watch(function() {
                                return ctrl.options;
                            }, function() {
                                ctrl.url = toGraphUrl(data, ctrl.options);
                            }, true);
                        }
                    ]
                });

                return modalInstance.result;
            }

            function openSave(data) {
                var modalInstance = $uibModal.open({
                    animation: true,
                    templateUrl: 'editor/tools/tools.save.tpl.html',
                    controllerAs: 'ctrl',
                    resolve: {
                        'legend': [
                            'atlasQueryService',
                            function(atlasQueryService) {
                                return atlasQueryService.fetchGraph(data.query, 'stats.json')
                                    .then(function(timeseries) {
                                        return timeseries.legend.join('\n');
                                    });
                            }
                        ]
                    },
                    controller: [
                        '$uibModalInstance', 'atlasQueryService', 'legend',
                        function($uibModalInstance, atlasQueryService, legend) {
                            var ctrl = this;
                            ctrl.name = null;
                            ctrl.description = legend;
                            ctrl.data = data;

                            ctrl.canSave = function(formCtrl) {
                                return formCtrl.$valid;
                            };

                            ctrl.save = function(formCtrl) {
                                if (!ctrl.canSave(formCtrl)) {
                                    return;
                                }
                                atlasQueryService.storeQuery(ctrl.name, ctrl.description, ctrl.data);

                                // Parse url and return an object
                                $uibModalInstance.close(data);
                            };

                            ctrl.cancel = function() {
                                $uibModalInstance.dismiss('cancel');
                            };
                        }
                    ]
                });

                return modalInstance.result;
            }

            function openLoad() {
                var modalInstance = $uibModal.open({
                    animation: true,
                    size: 'small',
                    templateUrl: 'editor/tools/tools.load.tpl.html',
                    controllerAs: 'ctrl',
                    controller: function($uibModalInstance, atlasQueryService) {
                        var ctrl = this;
                        ctrl.queryList = atlasQueryService.getStoredQueryList();
                        ctrl.selectedQuery = ctrl.queryList[0];

                        ctrl.imageUrl = function(data) {
                            data = angular.copy(data);
                            angular.extend(data.query, {
                                w: 350,
                                h: 150,
                                only_graph: 1,
                                no_legend: 1,
                                layout: 'image'
                            });
                            var url = toGraphUrl(data, {
                                'time': true,
                                'image': true
                            });
                            return url;
                        };

                        ctrl.load = function(data) {
                            // Parse url and return an object
                            $uibModalInstance.close(data);
                        };

                        ctrl.remove = function(name) {
                            atlasQueryService.removeStoredQuery(name);
                            ctrl.queryList = atlasQueryService.getStoredQueryList();
                            ctrl.selectedQuery = ctrl.queryList[0];
                        };

                        ctrl.cancel = function() {
                            $uibModalInstance.dismiss('cancel');
                        };
                    }
                });

                return modalInstance.result;
            }
        }
    ]);
