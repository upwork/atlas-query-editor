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

// -----------------------------------
// EditorController
// -----------------------------------
    .controller('EditorController', [
        '$scope', '$location', 'atlasQueryToolsService',
        function($scope, $location, atlasQueryToolsService) {
            var ctrl = this;

            // Read search parameters to initialize
            ctrl.data = fromLocation($location.search());

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
                        angular.extend(ctrl.data, newData);
                    });
            };

            // Import / Export
            ctrl.openImport = function() {
                atlasQueryToolsService.openImport()
                    .then(function(newData) {
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

            // Watch query and location and sync between them
            $scope.$on('$locationChangeSuccess', function() {
                ctrl.data = fromLocation($location.search());
            });

            $scope.$watch(function() {
                return ctrl.data;
            }, function(newData) {
                $location.search(toLocation(newData));
            }, true);

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
