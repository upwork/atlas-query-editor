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
'use strict';angular.module('atlas.query.editor',[
// Vendor
'ngRoute','ngMessages','ngclipboard','ui.bootstrap','ui.codemirror','angular-loading-bar',
// Templates
'atlas.query.editor.templates',
// Modules
'atlas.query.editor.query','atlas.query.editor.tools']).config(['$routeProvider',function(a){
// Default route
a.otherwise({redirectTo:'/'}),a.when('/',{templateUrl:'editor/editor.tpl.html',controller:'EditorController',controllerAs:'editorCtrl',resolve:{config:['atlasQueryService',function(a){return a.fetchConfig()}]}})}]).controller('EditorController',['$scope','$location','atlasQueryToolsService','atlasQueryService','config',function(a,b,c,d,e){
// -------------------------
// Transformation Functions:
function f(a){var b=a.host,c=angular.extend({q:''},a);return delete c.host,void 0!==c.w&&(c.w=1*c.w),void 0!==c.h&&(c.h=1*c.h),void 0!==c.zoom&&(c.zoom=1*c.zoom),{host:b,query:c}}function g(a){var b=angular.copy(a.query);return b.host=a.host,b}var h=this,i=_.find(e.hosts,{default:!0})||{url:null};
// Read search parameters to initialize
h.data=angular.extend({format:'png',host:i.url,hostList:e.hosts||[],query:null},f(b.search())),h.result={format:null,data:null},
// Save / Load
h.openSave=function(){c.openSave(h.data)},h.canOpenSave=function(){return h.data.host&&h.data.query.q},h.openLoad=function(){c.openLoad().then(function(a){h.result.format=null,h.result.data=null,angular.extend(h.data,a)})},
// Import / Export
h.openImport=function(){c.openImport().then(function(a){h.result.format=null,h.result.data=null,angular.extend(h.data,a)})},h.openExport=function(){h.canOpenExport()&&c.openExport(h.data)},h.canOpenExport=function(){return h.data.host&&h.data.query.q},
// View Actions
h.canSubmit=function(){return d.isActive()},h.isHostsEmpty=function(){return _.isEmpty(h.data.hostList)},h.isResultVisible=function(){return d.isActive()&&h.result.data},h.fetchResult=function(a){if(!a.$invalid)return d.fetchGraph(h.data.query,h.data.format).then(function(b){h.result.format=h.data.format,h.result.data=b,a.$setPristine()})},
// Watch query and location and sync between them
a.$on('$locationChangeSuccess',function(){angular.extend(h.data,f(b.search()))}),a.$watch(function(){return h.data},function(a){b.search(g(a))},!0),a.$watch(function(){return h.isResultVisible()},function(a){a||(h.result.format=null,h.result.data=null)})}]),/**
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
angular.module('atlas.query.editor.templates',[]).run(['$templateCache',function(a){a.put('editor/editor.tpl.html','<div><nav class="navbar navbar-inverse"><div class=container><div class=navbar-header><button type=button class="navbar-toggle collapsed" data-toggle=collapse data-target=#navbar aria-expanded=false aria-controls=navbar><span class=sr-only>Toggle navigation</span> <span class=icon-bar></span> <span class=icon-bar></span> <span class=icon-bar></span></button> <span class=navbar-brand>Atlas Query Editor</span></div><div id=navbar class="navbar-collapse collapse"><div class="btn-toolbar pull-right" role=toolbar><div class=btn-group role=group><button type=button class="btn btn-default navbar-btn" ng-click=editorCtrl.openSave() ng-disabled=!editorCtrl.canOpenSave()><i class="fa fa-save"></i> <span>Save</span></button> <button type=button class="btn btn-default navbar-btn" ng-click=editorCtrl.openLoad()><i class="fa fa-folder-open"></i> <span>Load</span></button></div><div class=btn-group role=group><button type=button class="btn btn-default navbar-btn" ng-click=editorCtrl.openExport() ng-disabled=!editorCtrl.canOpenExport()><i class="fa fa-upload"></i> <span>Export</span></button> <button type=button class="btn btn-default navbar-btn" ng-click=editorCtrl.openImport()><i class="fa fa-download"></i> <span>Import</span></button></div></div></div></div></nav><div class=container><form name=atlasQueryForm autocomplete=off ng-submit=editorCtrl.fetchResult(atlasQueryForm)><div ng-switch=editorCtrl.isHostsEmpty()><atlas-select ng-switch-when=false host=editorCtrl.data.host host-list=editorCtrl.data.hostList></atlas-select><atlas-connect ng-switch-default host=editorCtrl.data.host></atlas-connect></div><atlas-query-editor query=editorCtrl.data.query></atlas-query-editor><div class=row><div class=col-md-6><div class=form-group><fieldset><legend>Format</legend><div class=btn-group><label class="btn btn-default" ng-class="{active: editorCtrl.data.format === \'png\'}"><input id=format_png type=radio class=sr-only ng-model=editorCtrl.data.format value=png><span>PNG Image</span></label><label class="btn btn-default" ng-class="{active: editorCtrl.data.format === \'std.json\'}"><input id=format_std.json type=radio class=sr-only ng-model=editorCtrl.data.format ng-change="" value=std.json><span>Json</span></label><label class="btn btn-default" ng-class="{active: editorCtrl.data.format === \'stats.json\'}"><input id=format_stats.json type=radio class=sr-only ng-model=editorCtrl.data.format value=stats.json><span>Stats Json</span></label><label class="btn btn-default" ng-class="{active: editorCtrl.data.format === \'csv\'}"><input id=format_csv type=radio class=sr-only ng-model=editorCtrl.data.format value=csv><span>CSV</span></label><label class="btn btn-default" ng-class="{active: editorCtrl.data.format === \'txt\'}"><input id=format_txt type=radio class=sr-only ng-model=editorCtrl.data.format value=txt><span>TXT</span></label></div></fieldset></div></div><div class=col-md-6><div class=form-group><label class=control-label role=presentation>&nbsp;</label><div class=text-right><button type=submit class=btn ng-class="{\n                                    \'btn-secondary\' : editorCtrl.result.data !== null && atlasQueryForm.$pristine,\n                                    \'btn-success\' : editorCtrl.result.data == null || atlasQueryForm.$dirty\n                                }" ng-disabled=!editorCtrl.canSubmit()><span ng-if="editorCtrl.result.data == null || atlasQueryForm.$dirty"><i class="fa fa-play"></i> Execute</span> <span ng-if="editorCtrl.result.data !== null && atlasQueryForm.$pristine"><i class="fa fa-refresh"></i> Refresh</span></button></div></div></div></div></form><div ng-if=editorCtrl.isResultVisible()><atlas-query-result result=editorCtrl.result></atlas-query-result></div></div></div>'),a.put('editor/query/connect.tpl.html','<section><div class="form-group has-feedback" ng-class="{ \'has-success\': isHostValid(), \'has-error\': !isHostValid()}"><label class=control-label for=host>Atlas Host url</label><input type=url class=form-control name=host id=host placeholder="http(s)://<host>:<port>/api/v1" ng-model=connCtrl.host ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 } }" uib-typeahead="url as url for url in connCtrl.urlList() | filter:$viewValue" typeahead-show-hint=true typeahead-min-length=0 typeahead-editable=true ng-required=true atlas-validate-connection> <span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden=true ng-if=isHostValid()></span> <span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden=true ng-if=!isHostValid()></span></div></section>'),a.put('editor/query/editor.tpl.html','<section><ng-form name=queryForm><div class=form-group><div class=clearfix><label for=query>Query</label><div class="btn-toolbar pull-right"><label class="btn btn-default btn-sm" ng-class="{active: queryCtrl.view.editor.theme === \'seti-autoresize\'}"><input id=theme type=checkbox class=sr-only ng-model=queryCtrl.view.editor.theme ng-true-value="\'seti-autoresize\'" ng-false-value="\'seti\'"><i class="fa fa-arrows-v"></i> <span>Fit to content</span></label></div></div><div></div><textarea class="form-control autoresize" query=script id=query autofocus ui-codemirror=queryCtrl.view.editor ng-model=queryCtrl.query.q ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 500, \'blur\': 0 } }"></textarea><div ng-if=!queryCtrl.view.readOnly()><div class=pull-right><button type=button class="btn btn-default" ng-click="queryCtrl.view.showExtraOptions = !queryCtrl.view.showExtraOptions"><span ng-if=!queryCtrl.view.showExtraOptions><i class="fa fa-caret-right"></i> Show</span> <span ng-if=queryCtrl.view.showExtraOptions><i class="fa fa-caret-down"></i> Hide</span> Additional Parameters</button></div><div><p class=help-block><span>Press <kbd>alt-space</kbd> to activate autocompletion.</span></p><p><span>Press <kbd>ctrl-alt-f</kbd> or press here <button name=format type=button class="btn btn-default" ng-click=queryCtrl.actions.format()><i class="fa fa-align-left"></i> <span>Format</span></button> to activate autoformat</span></p></div></div><div ng-if=queryCtrl.view.readOnly()><p class=help-block><span>No valid connection with an Atlas Server, editor is disabled</span></p></div></div><div ng-if="!queryCtrl.view.readOnly() && queryCtrl.view.showExtraOptions"><uib-tabset><uib-tab index=0><uib-tab-heading><span>Time</span></uib-tab-heading><div><p class="help-block text-right"><a class="label label-default" href=https://github.com/Netflix/atlas/wiki/Graph#time target=_blank><i class="fa fa-question-circle"></i> <span>Help</span></a></p><div class=form-group><label for=startTime>Start Time</label><input class=form-control id=startTime ng-model=queryCtrl.query.s></div><div class=form-group><label for=endTime>End Time</label><input class=form-control id=endTime ng-model=queryCtrl.query.e></div></div></uib-tab><uib-tab index=1><uib-tab-heading><span>Data</span></uib-tab-heading><div><p class="help-block text-right"><a class="label label-default" href=https://github.com/Netflix/atlas/wiki/Graph#data target=_blank><i class="fa fa-question-circle"></i> <span>Help</span></a></p><div class=form-group><label for=step>Step</label><input class=form-control id=step ng-model=queryCtrl.query.step null-if-empty> <span class=help-block><i class="fa fa-warning"></i> In most cases users should not set step directly. The step parameter is deprecated.</span></div></div></uib-tab><uib-tab index=2><uib-tab-heading><span>Image Flags</span></uib-tab-heading><div><p class="help-block text-right"><a class="label label-default" href=https://github.com/Netflix/atlas/wiki/Graph#image-flags target=_blank><i class="fa fa-question-circle"></i> <span>Help</span></a></p><div class=form-group><label for=title>Set the graph title</label><input class=form-control id=title ng-model=queryCtrl.query.title></div><div class=checkbox><label><input type=checkbox ng-model=queryCtrl.query.no_legend ng-true-value=1 ng-false-value=0> <span>Suppress the legend</span></label></div><div class=checkbox><label><input type=checkbox ng-model=queryCtrl.query.no_legend_stats ng-true-value=1 ng-false-value=0> <span>Suppresses summary stats for the legend</span></label></div><div class=checkbox><label><input type=checkbox ng-model=queryCtrl.query.axis_per_line ng-true-value=1 ng-false-value=0> <span>Put each line on a separate Y-axis</span></label></div><div class=checkbox><label><input type=checkbox ng-model=queryCtrl.query.only_graph ng-true-value=1 ng-false-value=0> <span>Only show the graph canvas</span></label></div><div class=form-group><label for=vision>Simulate different vision types</label><select id=vision class=form-control ng-model=queryCtrl.query.vision ng-options="v for v in [\'normal\',\'protanopia\',\'protanomaly\',\'deuteranopia\',\'deuteranomaly\',\'tritanopia\',\'tritanomaly\',\'achromatopsia\',\'achromatomaly\']"></select></div></div></uib-tab><uib-tab index=3><uib-tab-heading><span>Image Size</span></uib-tab-heading><div><p class="help-block text-right"><a class="label label-default" href=https://github.com/Netflix/atlas/wiki/Graph#image-size target=_blank><i class="fa fa-question-circle"></i> <span>Help</span></a></p><fieldset><legend>Mode for controlling exact or relative sizing layout mode</legend><div class=radio><label><input type=radio name=layout id=layout_canvas value=canvas ng-model=queryCtrl.query.layout> Canvas: The width or height are for the canvas component within the chart. The actual image size will be calculated based on the number of entries in the legend, number of axes, etc. This is the default behavior.</label><label><input type=radio name=layout id=layout_image value=image ng-model=queryCtrl.query.layout> Image: The width or height are for the final image not including the zoom parameter. To try and adhere to layout goals when using this mode everything below the X-axes will automatically be suppressed. Vertical alignment will still hold as long as all graphs use the same number of Y-axes. Horizontal alignment will still hold as long as all graphs use the same number of X-axes.</label><label><input type=radio name=layout id=layout_iw value=iw ng-model=queryCtrl.query.layout> IW: Use exact image sizing for the width and canvas sizing for the height.</label><label><input type=radio name=layout id=layout_ih value=ih ng-model=queryCtrl.query.layout> IH: Use exact image sizing for the height and canvas sizing for the width.</label></div></fieldset><div class=form-group><label for=width>Width of the canvas or image</label><input type=number class=form-control id=width step=1 ng-model=queryCtrl.query.w></div><div class=form-group><label for=height>Height of the canvas or image</label><input type=number class=form-control id=height step=1 ng-model=queryCtrl.query.h></div><div class=form-group><label for=zoom>Transform the size by a zoom factor</label><input type=number class=form-control id=zoom step=0.1 ng-model=queryCtrl.query.zoom></div></div></uib-tab><uib-tab index=4><uib-tab-heading><span>Text Flags</span></uib-tab-heading><div><p class="help-block text-right"><a class="label label-default" href=https://github.com/Netflix/atlas/wiki/Graph#text-flags target=_blank><i class="fa fa-question-circle"></i> <span>Help</span></a></p><div class=form-group><label for=number_format>How to format numbers for text output types</label><input class=form-control id=number_format step=0.1 ng-model=queryCtrl.query.number_format> <span class=help-block><a href=https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#dndec target=_blank>Format options</a></span></div></div></uib-tab><uib-tab index=4><uib-tab-heading><span>Y-Axis</span></uib-tab-heading><div><p class="help-block text-right"><a class="label label-default" href=https://github.com/Netflix/atlas/wiki/Graph#y-axis target=_blank><i class="fa fa-question-circle"></i> <span>Help</span></a></p><div class=checkbox><label><input type=checkbox ng-model=queryCtrl.query.stack ng-true-value=1 ng-false-value=0> <span>Set the default line style to stack</span></label></div><fieldset><legend>Lower bound for the axis auto-style axis bound</legend><div class=radio><label><input type=radio name=l id=l_auto-style value=auto-style ng-model=queryCtrl.query.l> auto-style: automatically determine the bounds based on the data and the style settings for that data. In particular, if the line style is area or stack, then the bounds will be adjusted to show the filled area. This is the default behavior.</label><label><input type=radio name=l id=l_auto-data value=auto-data ng-model=queryCtrl.query.l> auto-data: automatically determine the bounds based on the data. This will only take into account the values of the lines. In the case of stack it will account for the position of the stacked lines, but not the filled area.</label></div></fieldset><fieldset><legend>Upper bound for the axis auto-style axis bound</legend><div class=radio><label><input type=radio name=u id=u_auto-style value=auto-style ng-model=queryCtrl.query.u> auto-style: automatically determine the bounds based on the data and the style settings for that data. In particular, if the line style is area or stack, then the bounds will be adjusted to show the filled area. This is the default behavior.</label><label><input type=radio name=u id=u_auto-data value=auto-data ng-model=queryCtrl.query.u> auto-data: automatically determine the bounds based on the data. This will only take into account the values of the lines. In the case of stack it will account for the position of the stacked lines, but not the filled area.</label></div></fieldset><div class=form-group><label for=ylabel>Label for the axis</label><input class=form-control id=ylabel ng-model=queryCtrl.query.ylabel></div><div class=form-group><label for=palette>Color palette to use</label><select class=form-control id=palette ng-model=queryCtrl.query.palette ng-options="p for p in [\'armytage\',\'epic\',\'blues\',\'greens\',\'oranges\',\'purples\',\'reds\']"></select></div><div class=checkbox><label><input type=checkbox ng-model=queryCtrl.query.o ng-true-value=1 ng-false-value=0> <span>Use a logarithmic scale</span></label></div><div class=form-group><label for=tick_labels>Set the mode to use for tick labels</label><select class=form-control id=tick_labels ng-model=queryCtrl.query.tick_labels ng-options="p for p in [\'decimal\',\'binary\',\'off\']"></select></div><fieldset><legend>Set the mode to use for sorting the legend e</legend><div class=radio><label><input type=radio name=sort id=sort_legend value=legend ng-model=queryCtrl.query.sort> legend: alphabetically based on the label used in the legend. This is the default.</label><label><input type=radio name=sort id=sort_min value=min ng-model=queryCtrl.query.sort> min: using the minimum value shown the legend stats.</label><label><input type=radio name=sort id=sort_max value=max ng-model=queryCtrl.query.sort> max: using the maximum value shown the legend stats.,</label><label><input type=radio name=sort id=sort_avg value=avg ng-model=queryCtrl.query.sort> avg: using the average value shown the legend stats.</label><label><input type=radio name=sort id=sort_count value=count ng-model=queryCtrl.query.sort> count: using the count value shown the legend stats.</label><label><input type=radio name=sort id=sort_total value=total ng-model=queryCtrl.query.sort> total: using the total value shown the legend stats.</label><label><input type=radio name=sort id=sort_last value=last ng-model=queryCtrl.query.sort> last: using the last value shown the legend stats.</label></div></fieldset><fieldset><legend>Set the order ascending or descending for the sort</legend><div class=radio><label><input type=radio name=order id=order_asc value=asc ng-model=queryCtrl.query.order>asc</label><label><input type=radio name=order id=order_desc value=desc ng-model=queryCtrl.query.order>desc</label></div></fieldset></div></uib-tab></uib-tabset><hr></div></ng-form></section>'),a.put('editor/query/result.tpl.html','<section><div ng-switch=result.format><textarea rows=30 ng-switch-when=json class=form-control readonly>{{result.data | json}}</textarea><textarea rows=30 ng-switch-when=std.json class=form-control readonly>{{result.data | json}}</textarea><textarea rows=30 ng-switch-when=stats.json class=form-control readonly>{{result.data | json}}</textarea><textarea rows=30 ng-switch-when=txt class=form-control readonly>{{result.data}}</textarea><textarea rows=30 ng-switch-when=csv class=form-control readonly>{{result.data}}</textarea><img width=100% ng-switch-default ng-src={{result.data}}></div></section>'),a.put('editor/query/select.tpl.html','<section><div class="form-group has-feedback" ng-class="{ \'has-success\': isHostValid(), \'has-error\': !isHostValid()}"><label class=control-label for=host>Atlas Host url</label><select class=form-control name=host id=host ng-options="host.url as (host.name + \' (\' + host.url + \')\') for host in selectCtrl.hostList" ng-model=selectCtrl.host ng-model-options="{ updateOn: \'default blur\', debounce: { \'default\': 0, \'blur\': 0 } }" ng-required=true atlas-validate-connection></select><span class="glyphicon glyphicon-ok form-control-feedback" aria-hidden=true ng-if=isHostValid()></span> <span class="glyphicon glyphicon-remove form-control-feedback" aria-hidden=true ng-if=!isHostValid()></span> <span class=help-block>{{selectCtrl.getMessage(selectCtrl.host)}}</span></div></section>'),a.put('editor/tools/tools.export.tpl.html','<form name=urlForm><div class=modal-header><h3 class=modal-title id=modal-title><span>Export Query</span></h3></div><div class=modal-body><div class=form-group><label class=control-label for=exportUrl>URL</label><textarea id=exportUrl class=form-control rows=10 ng-model=ctrl.url readonly></textarea><p class=help-block>Copy the text above and paste it to your browsers address bar</p></div><div class=btn-toolbar><label class="btn btn-default"><input type=checkbox ng-model=ctrl.options.time> <span>Include Time Parameters</span></label><label class="btn btn-default"><input type=checkbox ng-model=ctrl.options.image> <span>Include Image Parameters</span></label></div></div><div class=modal-footer><button class="btn btn-primary" type=button ngclipboard data-clipboard-target=#exportUrl><i class="fa fa-clipboard"></i> <span>Copy to clipboard</span></button> <button class="btn btn-warning" type=button ng-click=ctrl.cancel()><i class="fa fa-close"></i> <span>Cancel</span></button></div></form>'),a.put('editor/tools/tools.import.tpl.html','<form name=urlForm novalidate ng-submit=ctrl.import(urlForm)><div class=modal-header><h3 class=modal-title id=modal-title><span>Import Query</span></h3></div><div class=modal-body><div class=form-group ng-class="{\'has-error\' : (urlForm.$submitted || urlForm.importUrl.$dirty) && urlForm.importUrl.$invalid}"><label class=control-label for=importUrl>URL</label><textarea id=importUrl name=importUrl class=form-control rows=10 ng-model=ctrl.url ng-required=true></textarea><div role=alert ng-if="(urlForm.$submitted || urlForm.importUrl.$dirty) && urlForm.importUrl.$invalid" ng-messages=urlForm.importUrl.$error><p ng-message=required class=help-block>Please enter a value for this field.</p></div><p class=help-block>Paste here a valid Atlas Graph URL (e.g. http://host/api/v1/graph?q={some query})</p></div></div><div class=modal-footer><button class="btn btn-primary" type=submit><i class="fa fa-download"></i> <span>Import</span></button> <button class="btn btn-warning" type=button ng-click=ctrl.cancel()><i class="fa fa-close"></i> Cancel</button></div></form>'),a.put('editor/tools/tools.load.tpl.html','<div class=modal-header><h3 class=modal-title id=modal-title>Load Query</h3></div><div class=modal-body><div ng-if=!ctrl.queryList.length><p>There are no stored queries</p></div><div class=row ng-if=ctrl.queryList.length><div class=col-md-5><fieldset><legend><span>Saved Queries</span></legend><div style="max-height:400px; overflow-y: auto"><div class="list-group radio"><div class=list-group-item ng-repeat="query in ctrl.queryList" ng-class="{active: ctrl.selectedQuery.name === query.name}"><label style="word-break: break-all"><input type=radio name=query ng-value=query ng-model=ctrl.selectedQuery> <span>{{query.name}}</span></label></div></div></div></fieldset></div><div class=col-md-7><div class=thumbnail><img width=100% alt="Timeseries Graph" ng-src={{ctrl.imageUrl(ctrl.selectedQuery.data)}}><div class=caption><h3 class=caption-title style="word-break: break-all"><span>{{ctrl.selectedQuery.name}}</span><div class="btn-toolbar pull-right"><button class="btn btn-danger btn-sm" ng-click=ctrl.remove(ctrl.selectedQuery.name)><i class="fa fa-remove"></i> <span>Remove</span></button></div></h3><dl><dt>Query</dt><dd style="word-break: break-all"><textarea type=text name=queryString id=queryString class=form-control rows=3 ng-model=ctrl.selectedQuery.data.query.q readonly></textarea></dd></dl><dl><dt>Description</dt><dd style="word-break: break-all">{{ctrl.selectedQuery.description}}</dd></dl></div></div></div></div></div><div class=modal-footer><button class="btn btn-primary" ng-click=ctrl.load(ctrl.selectedQuery.data)><i class="fa fa-folder-open"></i> Load</button> <button class="btn btn-warning" type=button ng-click=ctrl.cancel()><i class="fa fa-close"></i> <span>Cancel</span></button></div>'),a.put('editor/tools/tools.save.tpl.html','<form name=saveQueryForm novalidate ng-submit=ctrl.save(saveQueryForm)><div class=modal-header><h3 class=modal-title id=modal-title>Save Query</h3></div><div class=modal-body><p>The query will be saved at the local storage of your browser. Please use a different name for different queries.</p><div class=form-group ng-class="{\'has-error\' : (saveQueryForm.$submitted || saveQueryForm.queryName.$dirty) && saveQueryForm.queryName.$invalid}"><label class="control-label mandatory" for=queryName>Name</label><input name=queryName id=queryName class=form-control ng-model=ctrl.name ng-required=true><div role=alert ng-if="(saveQueryForm.$submitted || saveQueryForm.queryName.$dirty) && saveQueryForm.queryName.$invalid" ng-messages=saveQueryForm.queryName.$error><p ng-message=required class=help-block>Please enter a value for this field.</p></div></div><div class=form-group><label class="control-label mandatory" for=queryHost>Host</label><input name=queryHost id=queryHost class=form-control ng-model=ctrl.data.host ng-required=true readonly></div><div class=form-group><label class="control-label mandatory" for=queryHost>Query</label><textarea type=text name=queryString id=queryString class=form-control rows=3 ng-model=ctrl.data.query.q ng-required=true readonly></textarea></div><div class=form-group ng-class="{\'has-error\' : (saveQueryForm.$submitted || saveQueryForm.queryDescription.$dirty) && saveQueryForm.queryDescription.$invalid}"><label class=control-label for=queryDescription>Description</label><textarea name=queryDescription id=queryDescription rows=6 class=form-control ng-model=ctrl.description></textarea><div role=alert ng-if="(saveQueryForm.$submitted || saveQueryForm.queryDescription.$dirty) && saveQueryForm.queryDescription.$invalid" ng-messages=saveQueryForm.queryDescription.$error><p ng-message=required class=help-block>Please enter a value for this field.</p></div></div></div><div class=modal-footer><button class="btn btn-primary" type=submit><i class="fa fa-save"></i> <span>Save</span></button> <button class="btn btn-warning" type=button ng-click=ctrl.cancel()><i class="fa fa-close"></i> <span>Cancel</span></button></div></form>')}]),angular.module('atlas.query.editor.query',[
// Vendor
'ui.bootstrap','ui.codemirror']).directive('atlasConnect',['atlasQueryService',function(a){return{restrict:'E',require:'^form',replace:!0,templateUrl:'editor/query/connect.tpl.html',scope:{host:'='},controllerAs:'connCtrl',bindToController:!0,controller:[function(){var b=this;
// Read the stored url list from service, for typeahead
b.urlList=a.getStoredUrlList}],link:function(b,c,d,e){
//Use for highlighting the field as red/green
b.isHostValid=function(){return e.host.$valid},
// When input is valid, update the url in atlasQueryService
b.$watch(function(){return e.host.$valid},function(c){a.setBaseUrl(c?b.connCtrl.host:null)})}}}]).directive('atlasSelect',['atlasQueryService',function(a){return{restrict:'E',require:'^form',replace:!0,templateUrl:'editor/query/select.tpl.html',scope:{host:'=',hostList:'='},controllerAs:'selectCtrl',bindToController:!0,controller:[function(){var a=this;a.getMessage=function(b){var c=_.find(a.hostList,{url:b});return console.log('getMessage',c),c?c.message:null}}],link:function(b,c,d,e){
//Use for highlighting the field as red/green
b.isHostValid=function(){return e.host.$valid},
// When input is valid, update the url in atlasQueryService
b.$watch(function(){return e.host.$valid},function(c){a.setBaseUrl(c?b.selectCtrl.host:null)})}}}]).directive('atlasValidateConnection',['$q','atlasQueryService',function(a,b){return{restrict:'A',require:'ngModel',link:function(c,d,e,f){f.$asyncValidators.connection=function(c,d){var e=c||d;return f.$isEmpty(e)?a.when('OK'):b.checkConnection(c)}}}}]).directive('atlasQueryEditor',['$http',function(a){var b={q:'',step:null,
// (1) Time
s:'e-3h',// Start time e-3h* Time
e:'now',//End time now* Time
tz:'UTC',//Time zone US/Pacific* Time zone ID
// (2) Image Flags
title:'',//Set the graph title String
no_legend:0,//Suppresses the legend 0 boolean
no_legend_stats:0,// Suppresses summary stats for the legend boolean
axis_per_line:0,// Put each line on a separate Y-axis boolean
only_graph:0,//Only show the graph canvas boolean
vision:'normal',//Simulate different vision types vision type: normal|protanopia|protanomaly|deuteranopia|deuteranomaly|tritanopia|tritanomaly|achromatopsia|achromatomaly
// (3) Image Size
layout:'canvas',// Mode for controlling exact or relative sizing layout mode: canvas: the width or height are for the canvas component within the chart. The actual image size will be calculated based on the number of entries in the legend, number of axes, etc. This is the default behavior.|image: the width or height are for the final image not including the zoom parameter. To try and adhere to layout goals when using this mode everything below the X-axes will automatically be suppressed. Vertical alignment will still hold as long as all graphs use the same number of Y-axes. Horizontal alignment will
// still hold as long as all graphs use the same number of X-axes.|iw: use exact image sizing for the width and canvas sizing for the height.|ih: use exact image sizing for the height and canvas sizing for the width.
w:700,//Width of the canvas or image int
h:300,//Height of the canvas or image int
zoom:1,//Transform the size by a zoom factor float
// (4) Text Flags
number_format:'%f',//How to format numbers for text output types %f float format (https://docs.oracle.com/javase/8/docs/api/java/util/Formatter.html#dndec)
// (5) Y-Axis
stack:0,//Set the default line style to stack 0 boolean
l:'auto-style',// Lower bound for the axis auto-style axis bound: auto-style: automatically determine the bounds based on the data and the style settings for that data. In particular, if the line style is area or stack, then the bounds will be adjusted to show the filled area. This is the default behavior.|auto-data: automatically determine the bounds based on the data. This will only take into account the values of the lines. In the case of stack it will account for the position of the stacked lines, but not the filled area.
u:'auto-style',// Upper bound for the axis auto-style axis bound: auto-style: automatically determine the bounds based on the data and the style settings for that data. In particular, if the line style is area or stack, then the bounds will be adjusted to show the filled area. This is the default behavior.|auto-data: automatically determine the bounds based on the data. This will only take into account the values of the lines. In the case of stack it will account for the position of the stacked lines, but not the filled area.
ylabel:'',// Label for the axis String
palette:'armytage',//Color palette to use armytage palette armytage|epic|blues|greens|oranges|purples|reds|colors:1a9850,91cf60,d9ef8b,fee08b,fc8d59,d73027
o:0,//Use a logarithmic scale 0 boolean
tick_labels:'decimal',//Set the mode to use for tick labels decimal tick label mode {decimal|binary|off}
sort:'legend',//Set the mode to use for sorting the legend expr order sort mode legend: alphabetically based on the label used in the legend. This is the default., min: using the minimum value shown the legend stats. max: using the maximum value shown the legend stats., avg: using the average value shown the legend stats., count: using the count value shown the legend stats., total: using the total value shown the legend stats., last: using the last value shown the legend stats.
order:'asc'};return{restrict:'E',require:'^form',replace:!0,templateUrl:'editor/query/editor.tpl.html',controllerAs:'queryCtrl',scope:{query:'='},bindToController:!0,controller:['$scope','$http','$timeout','atlasQueryService',function(a,c,d,e){
// Add default options to query
function f(){
// Request Tag Names from Atlas and add them to the extraTags
e.isActive()?e.fetchTags().then(function(a){g.view.editor.readOnly=!1,g.view.editor.mode.apiPath=e.baseUrl(),g.view.editor.mode.extraTags.length=0,angular.forEach(a,function(a){g.view.editor.mode.extraTags.push(a)})}):d(function(){g.view.editor.readOnly='nocursor',g.view.editor.mode.apiPath=null,g.view.editor.mode.extraTags.length=0})}var g=this,h=null;// Will be filled on codemirror load
// View Parameters
g.view={readOnly:function(){return!e.isActive()},showExtraOptions:!1,editor:{lineNumbers:!0,viewportMargin:1/0,theme:'seti',mode:{name:'atlas',apiPath:e.baseUrl(),extraTags:[]},extraKeys:{'Alt-Space':'atlasHint','Ctrl-Alt-F':'atlasFormat'},onLoad:function(a){h=a}}},
// View Actions
g.actions={format:function(){h.execCommand('atlasFormat')}},
// Watchers
a.$watch(function(){return e.baseUrl()},function(){f()}),a.$watch(function(){return g.query},function(){d(function(){
// Add also default options when query changes
var a=angular.extend(angular.copy(b),g.query);angular.extend(g.query,a)},0)},!0)}]}}]).directive('atlasQueryResult',[function(){return{restrict:'E',replace:!0,templateUrl:'editor/query/result.tpl.html',scope:{result:'='}}}]).provider('atlasQueryService',function(){var a=null;this.setBaseUrl=function(b){a=b},this.$get=['$window','$http','$q','$httpParamSerializer',function(b,c,d,e){var f={fetchConfig:function(){return c.get('/config/config.json').then(function(a){var b=a.data;return b},function(a){return[]})},isActive:function(){return!!a},setBaseUrl:function(b){a=b,
// also add to the storage
a&&f.storeUrl(a)},baseUrl:function(){return a},tagUrl:function(){return a+'/tags'},graphUrl:function(b,c){return b&&angular.isObject(b)?a+'/graph?'+e(b)+(c?'&format='+c:''):a+'/graph'},fetchTags:function(){return c.get(f.tagUrl(),{cache:!0}).then(function(a){return a.data})},checkConnection:function(a){return c.get(a+'/tags',{cache:!0}).then(function(a){var b=a.data;return angular.isArray(b)&&b.indexOf('name')>=0?a.data:d.reject('invalid response')})},fetchGraph:function(a,b){function d(a){for(var b='',c=new Uint8Array(a),d=c.byteLength,e=0;e<d;e++)b+=String.fromCharCode(c[e]);return window.btoa(b)}return'png'===b?c.get(f.graphUrl(a,b),{responseType:'arraybuffer'}).then(function(a){var b=d(a.data);return'data:image/png;base64,'+b}):c.get(f.graphUrl(a,b)).then(function(a){return a.data},function(a){return a.data})},getStoredUrlList:function(){try{return JSON.parse(window.localStorage.getItem('atlas.query.editor.host.list')||'[]')}catch(a){return b.localStorage.removeItem('atlas.query.editor.host.list'),[]}},storeUrl:function(a){var c=f.getStoredUrlList();c.indexOf(a)<0&&(c.push(a),b.localStorage.setItem('atlas.query.editor.host.list',JSON.stringify(c)))},getStoredQueryList:function(){try{return JSON.parse(window.localStorage.getItem('atlas.query.editor.query.list')||'[]')}catch(a){return b.localStorage.removeItem('atlas.query.editor.query.list'),[]}},storeQuery:function(a,c,d){var e={name:a,description:c,data:d},g=f.getStoredQueryList(),h=-1;_.forEach(g,function(b,c){b.name===a&&(h=c)}),h<0?g.push(e):
// Replace item:
angular.extend(g[h],e),b.localStorage.setItem('atlas.query.editor.query.list',JSON.stringify(g))},removeStoredQuery:function(a){var c=f.getStoredQueryList(),d=-1;_.forEach(c,function(b,c){b.name===a&&(d=c)}),d>=0&&(c.splice(d,1),b.localStorage.setItem('atlas.query.editor.query.list',JSON.stringify(c)))}};return f}]}).directive('nullIfEmpty',[function(){return{require:'ngModel',link:function(a,b,c,d){d.$parsers.unshift(function(a){return''===a?null:a})}}}]),angular.module('atlas.query.editor.tools',[
// Vendor
'ui.bootstrap']).factory('atlasQueryToolsService',['$uibModal','$httpParamSerializer',function(a,b){function c(a,c){c=c||{};
// Start with the query only
var d=_.pick(a.query,['q']);c.time&&
// Add time parameters
_.extend(d,_.pick(a.query,['s','e','tz','step'])),c.image&&
// Add all the rest
_.extend(d,_.omit(a.query,['q','s','e','tz','step'])),
// Strip query from white space characters
d.q=d.q.replace(/\s/g,'');var e=b(d);// Also encodes URI components
return a.host+'/graph?'+e}function d(){var b=a.open({animation:!0,size:'lg',templateUrl:'editor/tools/tools.import.tpl.html',controllerAs:'ctrl',controller:['$uibModalInstance',function(a){function b(a){var b=_.chain(a).map(function(a){if(/^([^=]+)=([^=]+)$/.test(a)){var b=a.split('=');return b[1]=decodeURIComponent(b[1]),b}}).compact().fromPairs().value();return void 0!==a.w&&(a.w=1*a.w),void 0!==a.h&&(a.h=1*a.h),void 0!==a.zoom&&(a.zoom=1*a.zoom),b}var c=this;c.url='',c.canSave=function(a){return a.$valid},c.import=function(d){if(c.canSave(d)){
// Parse url and return an object
var e=document.createElement('a');e.href=c.url;var f=e.protocol+'//'+e.host+e.pathname.replace(/\/graph/,''),g=b(e.search.slice(1).split('&'));a.close({host:f,query:g})}},c.cancel=function(){a.dismiss('cancel')}}]});return b.result}function e(b){var d=a.open({animation:!0,size:'lg',templateUrl:'editor/tools/tools.export.tpl.html',controllerAs:'ctrl',controller:['$scope','$uibModalInstance',function(a,d){var e=this;e.options={time:!1,image:!1},e.url='',e.cancel=function(){d.dismiss('cancel')},a.$watch(function(){return e.options},function(){e.url=c(b,e.options)},!0)}]});return d.result}function f(b){var c=a.open({animation:!0,size:'lg',templateUrl:'editor/tools/tools.save.tpl.html',controllerAs:'ctrl',controller:['$uibModalInstance','atlasQueryService',function(a,c){function d(a){
// Find the first name
var b=a.match(/^(.+,)?name,([^,]+),/m);return b?b[2]:null}var e=this;e.name=d(b.query.q),e.description='',e.data=b,e.canSave=function(a){return a.$valid},e.save=function(d){e.canSave(d)&&(c.storeQuery(e.name,e.description,e.data),
// Parse url and return an object
a.close(b))},e.cancel=function(){a.dismiss('cancel')}}]});return c.result}function g(){var b=a.open({animation:!0,size:'lg',templateUrl:'editor/tools/tools.load.tpl.html',controllerAs:'ctrl',controller:['$uibModalInstance','atlasQueryService',function(a,b){var d=this;d.queryList=b.getStoredQueryList(),d.selectedQuery=d.queryList[0],d.imageUrl=function(a){a=angular.copy(a),angular.extend(a.query,{w:350,h:150,only_graph:1,no_legend:1,layout:'image'});var b=c(a,{time:!0,image:!0});return b},d.load=function(b){
// Parse url and return an object
a.close(b)},d.remove=function(a){b.removeStoredQuery(a),d.queryList=b.getStoredQueryList(),d.selectedQuery=d.queryList[0]},d.cancel=function(){a.dismiss('cancel')}}]});return b.result}var h={openImport:d,openExport:e,openSave:f,openLoad:g};return h}]);