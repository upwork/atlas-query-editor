'use strict';

var express = require('express');
var httpProxy = require('http-proxy');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var _ = require('lodash');

var app = express();
var apiProxy = httpProxy.createProxyServer();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

/**************
 * ROUTES:
 **************/

// Default
app.get(/^\/(?!(vendor|editor|codemirror|atlas)\/).*/, function(req, res) {
    res.sendFile('index.html', {
        root: './target/build'
    });
});

// Static Assets
app.use('/vendor', express.static('./target/build/vendor'));
app.use('/editor', express.static('./target/build/editor'));
app.use('/codemirror', express.static('./target/build/codemirror'));

// Proxy to Atlas API
app.use("/atlas", function(req, res) {
    apiProxy.web(req, res, {
        target: 'http://atlas.dev.agora.odesk.com:7101/api/v1'
    });
});

/****************
 * SERVER
 ****************/
var server = app.listen(3000, function() {
    console.log('Listening on port %s...', server.address().port);
});
