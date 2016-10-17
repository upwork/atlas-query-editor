/**
 * @license Atlas Query Editor
 *
 * Copyright (C) 2016 Upwork.com
 *
 * This software may be modified and distributed under the terms
 * of the MIT license.  See the LICENSE file for details.
 **/

'use strict';
(function(mod) {
    if (typeof exports == 'object' && typeof module == 'object') {
        // CommonJS
        mod(require('../../lib/codemirror'));
    } else if (typeof define === 'function' && define.amd) {
        // AMD
        define(['../../lib/codemirror'], mod);
    } else {
        // Plain browser env
        mod(CodeMirror);
    }
})(function(CodeMirror) {

    var tagNames = ['name'];

    var operations = [
        '-rot', '2over', 'abs', 'add', 'all', 'alpha', 'and', 'area', 'avg', 'axis', 'by', 'call', 'cf-avg', 'cf-max', 'cf-min', 'cf-sum', 'clear', 'color', 'const', 'count', 'cq', 'decode', 'depth', 'derivative', 'des', 'des-epic-signal', 'des-epic-viz', 'des-fast', 'des-simple', 'des-slow', 'des-slower', 'dist-avg', 'dist-max', 'dist-stddev', 'div', 'drop', 'dup', 'each', 'eq', 'fadd', 'false', 'fcall', 'fdiv', 'filter', 'fmul', 'format', 'fsub', 'ge', 'get', 'gt', 'has', 'head', 'integral', 'le', 'legend', 'line', 'list', 'ls', 'lt', 'lw', 'map', 'max', 'median', 'min', 'mul', 'ndrop', 'neg', 'nip', 'nlist', 'not', 'offset',
        'or', 'order', 'over', 'pct', 'per-step', 'percentiles', 'pick', 'random', 're', 'reic', 'roll', 'rolling-count', 'rot', 'sdes', 'sdes-fast', 'sdes-simple', 'sdes-slow', 'sdes-slower', 'set', 'sort', 'sqrt', 'sset', 'stack', 'stat', 'stat-avg', 'stat-avg-mf', 'stat-max', 'stat-max-mf', 'stat-min', 'stat-min-mf', 'stat-total', 'sub', 'sum', 'swap', 'time', 'trend', 'true', 'tuck', 'vspan'
    ].reverse();

    // -----------------------------------
    // Atlas Mode
    // -----------------------------------
    CodeMirror.defineMode('atlas', function(editorConfig, modeConfig) {
        // Uses the following properties in modeConfig:
        // 1. modeConfig.apiPath: string (Required for hints)
        // 2. modeConfig.extraTags: []
        tagNames = mergeTagNames(tagNames, modeConfig.extraTags || []);

        return CodeMirror.simpleMode(editorConfig, {
            start: [
                {
                    regex: /,/,
                    token: 'atom'
                },
                {
                    regex: new RegExp(':(' + operations.join('|') + ')'),
                    token: 'operator'
                },
                {
                    regex: new RegExp(tagNames.join('|')),
                    token: 'tag'
                }
            ]
        });

        function mergeTagNames(tagNames1, tagNames2) {
            var result = tagNames1.concat();
            for (var i = 0; i < tagNames2.length; i += 1) {
                if (result.indexOf(tagNames2[i]) < 0) {
                    result.push(tagNames2[i]);
                }
            }
            return result;
        }
    });

    // -----------------------------------
    // Atlas Mode Commands
    // -----------------------------------
    CodeMirror.commands.atlasHint = function(cm) {
        CodeMirror.showHint(cm, CodeMirror.hint.atlas, {
            async: true
        });
    };

    CodeMirror.commands.atlasFormat = function(cm) {
        var text = cm.getValue();
        // Format code, add a newline after every operation
        text = text.replace(/\s/g, '').replace(/:[^:^,.]+,/g, '$&\n');
        cm.setValue(text);
        cm.execCommand('goDocEnd');
    };

    // -----------------------------------
    // Atlas Mode Hints
    // -----------------------------------
    CodeMirror.registerHelper('hint', 'atlas', function(editor, callback) {
        var apiPath = editor.options.mode.apiPath;
        // Find positions to replace
        var cursor = editor.getCursor();
        var curLine = editor.getLine(cursor.line);
        var end = cursor.ch;
        var start = end;
        while (start && curLine.charAt(start - 1) !== ',') {
            --start;
        }
        while (curLine.charAt(end) && curLine.charAt(end) !== ',') {
            ++end;
        }

        // Read tokens (reads full string, maybe find some optimization as we need the last two tokens)
        var tokens = editor.getRange({line: 0, ch: 0}, cursor).split(',');
        // Keep last two
        var currentWord = (tokens.length > 1 ? tokens[tokens.length - 1] : tokens[0]).replace(/\s/g, '');
        var previousWord = tokens.length > 1 ? tokens[tokens.length - 2].replace(/\s/g, '') : null;

        setTimeout(function() {
            function tagUrl(tagName, tagValue) {
                if (!tagValue) {
                    return apiPath + '/tags/' + tagName;
                }
                return apiPath + '/tags/' + tagName + '?q=' + tagName + ',' + ('*' + tagValue + '*' || '*') + ',:re';
            }

            var list = [];

            if (previousWord && tagNames.indexOf(previousWord) >= 0) {
                if (apiPath) {
                    // If apiPath is not configured, only the values hints will be disabled
                    // Previous word is a tagName, => Add all matching tag values
                    var xhr = new XMLHttpRequest();
                    xhr.open('GET', tagUrl(previousWord, currentWord));
                    xhr.send(null);
                    xhr.onreadystatechange = function() {
                        var DONE = 4; // readyState 4 means the request is done.
                        var OK = 200; // status 200 is a successful return.
                        if (xhr.readyState === DONE && xhr.status === OK) {
                            var values = JSON.parse(xhr.responseText);
                            list = _.map(values, function(val) {
                                return {
                                    text: val,
                                    displayText: 'value(' + previousWord + ') ' + val
                                };
                            });
                            callback({
                                list: list,
                                from: CodeMirror.Pos(cursor.line, start),
                                to: CodeMirror.Pos(cursor.line, end)
                            });
                        }
                    };
                    return;
                }
            } else if (!currentWord) {
                // Empty Word => Add all tags
                list = _.map(tagNames, function(tagName) {
                    return {
                        text: tagName,
                        displayText: 'tag ' + tagName
                    };
                });
            } else if (currentWord.startsWith(':')) {
                // Word Starting with ':' => Add all matching operations
                _.forEach(operations, function(operation) {
                    if ((':' + operation).startsWith(currentWord)) {
                        list.push({
                            text: ':' + operation,
                            displayText: 'operator ' + ':' + operation
                        });
                    }
                });
            } else {
                // Word Default => Add matching tags
                _.forEach(tagNames, function(tagName) {
                    if (!currentWord || tagName.startsWith(currentWord)) {
                        list.push({
                            text: tagName,
                            displayText: 'tag ' + tagName
                        });
                    }
                });
            }

            // Return result
            callback({
                list: list,
                from: CodeMirror.Pos(cursor.line, start),
                to: CodeMirror.Pos(cursor.line, end)
            });

        }, 0);
    });

});
