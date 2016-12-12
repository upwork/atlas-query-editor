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
'use strict';!function(a){'object'==typeof exports&&'object'==typeof module?
// CommonJS
a(require('../../lib/codemirror')):'function'==typeof define&&define.amd?
// AMD
define(['../../lib/codemirror'],a):
// Plain browser env
a(CodeMirror)}(function(a){var b=['name'],c=['-rot','2over','abs','add','all','alpha','and','area','avg','axis','by','call','cf-avg','cf-max','cf-min','cf-sum','clear','color','const','count','cq','decode','depth','derivative','des','des-epic-signal','des-epic-viz','des-fast','des-simple','des-slow','des-slower','dist-avg','dist-max','dist-stddev','div','drop','dup','each','eq','fadd','false','fcall','fdiv','filter','fmul','format','fsub','ge','get','gt','has','head','integral','le','legend','line','list','ls','lt','lw','map','max','median','min','mul','ndrop','neg','nip','nlist','not','offset','or','order','over','pct','per-step','percentiles','pick','random','re','reic','roll','rolling-count','rot','sdes','sdes-fast','sdes-simple','sdes-slow','sdes-slower','set','sort','sqrt','sset','stack','stat','stat-avg','stat-avg-mf','stat-max','stat-max-mf','stat-min','stat-min-mf','stat-total','sub','sum','swap','time','trend','true','tuck','vspan'].reverse();
// -----------------------------------
// Atlas Mode
// -----------------------------------
a.defineMode('atlas',function(a,d){function e(a){for(var b='',c=a.peek();c&&','!==c;)b+=a.next(),c=a.peek();return b}function f(a,b){for(var c=a.concat(),d=0;d<b.length;d+=1)c.indexOf(b[d])<0&&c.push(b[d]);return c}
// Uses the following properties in modeConfig:
// 1. modeConfig.apiPath: string (Required for hints)
// 2. modeConfig.extraTags: []
b=f(b,d.extraTags||[]);var g={operator:new RegExp('^:('+c.join('|')+')$'),tag:new RegExp('^('+b.join('|')+')$')};return{startState:function(){return{}},token:function(a,b){if(','==a.peek())return a.next(),'atom';var c=e(a);return g.operator.test(c)?'operator':g.tag.test(c)?'tag':null}}}),
// -----------------------------------
// Atlas Mode Commands
// -----------------------------------
a.commands.atlasHint=function(b){a.showHint(b,a.hint.atlas,{async:!0})},a.commands.atlasFormat=function(a){var b=a.getValue();
// Format code, add a newline after every operation
b=b.replace(/\s/g,'').replace(/:[^:^,.]+,/g,'$&\n'),a.setValue(b),a.execCommand('goDocEnd')},
// -----------------------------------
// Atlas Mode Hints
// -----------------------------------
a.registerHelper('hint','atlas',function(d,e){for(var f=d.options.mode.apiPath,g=d.getCursor(),h=d.getLine(g.line),i=g.ch,j=i;j&&','!==h.charAt(j-1);)--j;for(;h.charAt(i)&&','!==h.charAt(i);)++i;
// Read tokens (reads full string, maybe find some optimization as we need the last two tokens)
var k=d.getRange({line:0,ch:0},g).split(','),l=(k.length>1?k[k.length-1]:k[0]).replace(/\s/g,''),m=k.length>1?k[k.length-2].replace(/\s/g,''):null;setTimeout(function(){function d(a,b){return b?f+'/tags/'+a+'?q='+a+','+('*'+b+'*'||'*')+',:re':f+'/tags/'+a}var h=[];if(m&&b.indexOf(m)>=0){if(f){
// If apiPath is not configured, only the values hints will be disabled
// Previous word is a tagName, => Add all matching tag values
var k=new XMLHttpRequest;return k.open('GET',d(m,l)),k.send(null),void(k.onreadystatechange=function(){var b=4,c=200;// status 200 is a successful return.
if(k.readyState===b&&k.status===c){var d=JSON.parse(k.responseText);h=_.map(d,function(a){return{text:a,displayText:'value('+m+') '+a}}),e({list:h,from:a.Pos(g.line,j),to:a.Pos(g.line,i)})}})}}else l?l.startsWith(':')?
// Word Starting with ':' => Add all matching operations
_.forEach(c,function(a){(':'+a).startsWith(l)&&h.push({text:':'+a,displayText:'operator :'+a})}):
// Word Default => Add matching tags
_.forEach(b,function(a){l&&!a.startsWith(l)||h.push({text:a,displayText:'tag '+a})}):
// Empty Word => Add all tags
h=_.map(b,function(a){return{text:a,displayText:'tag '+a}});
// Return result
e({list:h,from:a.Pos(g.line,j),to:a.Pos(g.line,i)})},0)})});