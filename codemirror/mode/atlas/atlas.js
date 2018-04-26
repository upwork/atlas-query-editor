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
a(CodeMirror)}(function(a){var b,c=['name'],d=['-rot','2over','abs','add','all','alpha','and','area','avg','axis','by','call','cf-avg','cf-max','cf-min','cf-sum','clear','color','const','count','cq','decode','depth','derivative','des','des-epic-signal','des-epic-viz','des-fast','des-simple','des-slow','des-slower','dist-avg','dist-max','dist-stddev','div','drop','dup','each','eq','fadd','false','fcall','fdiv','filter','fmul','format','fsub','ge','get','gt','has','head','integral','le','legend','line','list','ls','lt','lw','map','max','median','min','mul','ndrop','neg','nip','nlist','not','offset','or','order','over','pct','per-step','percentiles','pick','random','re','reic','roll','rolling-count','rot','sdes','sdes-fast','sdes-simple','sdes-slow','sdes-slower','set','sort','sqrt','sset','stack','stat','stat-avg','stat-avg-mf','stat-max','stat-max-mf','stat-min','stat-min-mf','stat-total','sub','sum','swap','time','trend','true','tuck','vspan'].reverse(),e=['count,:eq','gauge,:eq','totalAmount,:eq','totalTime,:eq','duration,:eq','activeTasks,:eq','interval,:eq','count,:eq,bucket,:has,:and','totalAmount,:eq,bucket,:has,:and','totalTime,:eq,bucket,:has,:and','percentile,:eq,percentile,D,:re,:and','percentile,:eq,percentile,T,:re,:and'];
// -----------------------------------
// Atlas Mode
// -----------------------------------
a.defineMode('atlas',function(a,f){function g(a){for(var b='',c=a.peek();c&&','!==c;)b+=a.next(),c=a.peek();return b}function h(a,b){for(var c=a.concat(),d=0;d<b.length;d+=1)c.indexOf(b[d])<0&&c.push(b[d]);return c}function i(a){var b={};return a&&_.forEach(e,function(c){var d=new XMLHttpRequest;d.open('GET',a+'/tags/name?q=statistic,'+c),d.send(null),d.onreadystatechange=function(){var a=4,e=200;// status 200 is a successful return.
if(d.readyState===a&&d.status===e){var f=JSON.parse(d.responseText);_.forEach(f,function(a){'undefined'==typeof b[a]?b[a]=[c]:b[a].includes(c)||b[a].push(c)})}}}),b}
// Uses the following properties in modeConfig:
// 1. modeConfig.apiPath: string (Required for hints)
// 2. modeConfig.extraTags: []
c=h(c,f.extraTags||[]),b=i(f.apiPath);var j={operator:new RegExp('^:('+d.join('|')+')$'),tag:new RegExp('^('+c.join('|')+')$')};return{startState:function(){return{}},token:function(a,b){if(','==a.peek())return a.next(),'atom';var c=g(a);return j.operator.test(c)?'operator':j.tag.test(c)?'tag':null}}}),
// -----------------------------------
// Atlas Mode Commands
// -----------------------------------
a.commands.atlasHint=function(b){a.showHint(b,a.hint.atlas,{async:!0})},a.commands.atlasFormat=function(a){var b=a.getValue();
// Format code, add a newline after every operation
b=b.replace(/\s/g,'').replace(/:[^:^,.]+,/g,'$&\n'),a.setValue(b),a.execCommand('goDocEnd')},
// -----------------------------------
// Atlas Mode Hints
// -----------------------------------
a.registerHelper('hint','atlas',function(e,f){for(var g=e.options.mode.apiPath,h=e.getCursor(),i=e.getLine(h.line),j=h.ch,k=j;k&&','!==i.charAt(k-1);)--k;for(;i.charAt(j)&&','!==i.charAt(j);)++j;
// Read tokens removing whitespace (reads full string, maybe find some optimization as we need the last two tokens)
var l=e.getRange({line:0,ch:0},h).replace(/\s/g,'').split(','),m=l.length>1?l[l.length-1]:l[0],n=l.length>1?l[l.length-2]:null,o=l.lastIndexOf('name')!=-1&&('undefined'!=typeof l[l.lastIndexOf('name')+1])<l.length?l[l.lastIndexOf('name')+1]:null,p=l.lastIndexOf('(')>l.lastIndexOf(')');setTimeout(function(){function e(a,b){return b?g+'/tags/'+a+'?q='+a+','+('*'+b+'*'||'*')+',:re':g+'/tags/'+a}var i=[];if('statistic'==n&&o&&'undefined'!=typeof b[o])_.forEach(b[o],function(a){i.push({text:a,displayText:'value('+n+'('+o+')) '+a})});else if(n&&c.indexOf(n)>=0&&!p){if(g){
// If apiPath is not configured, only the values hints will be disabled
// Previous word is a tagName, => Add all matching tag values
var l=new XMLHttpRequest;return l.open('GET',e(n,m)),l.send(null),void(l.onreadystatechange=function(){var b=4,c=200;// status 200 is a successful return.
if(l.readyState===b&&l.status===c){var d=JSON.parse(l.responseText);i=_.map(d,function(a){return{text:a,displayText:'value('+n+') '+a}}),f({list:i,from:a.Pos(h.line,k),to:a.Pos(h.line,j)})}})}}else m?m.startsWith(':')?
// Word Starting with ':' => Add all matching operations
_.forEach(d,function(a){(':'+a).startsWith(m)&&i.push({text:':'+a,displayText:'operator :'+a})}):
// Word Default => Add matching tags
_.forEach(c,function(a){m&&!a.startsWith(m)||i.push({text:a,displayText:'tag '+a})}):
// Empty Word => Add all tags
i=_.map(c,function(a){return{text:a,displayText:'tag '+a}});
// Return result
f({list:i,from:a.Pos(h.line,k),to:a.Pos(h.line,j)})},0)})});