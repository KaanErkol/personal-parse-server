// Example express application adding the parse-server module to expose Parse
// compatible API routes.
var express = require('express');
var ParseServer = require('parse-server').ParseServer;
var forever = require('forever');
var Table = require('cli-table');
var timespan = require('timespan');



var databaseUri = process.env.DATABASE_URI || process.env.MONGOLAB_URI

if (!databaseUri) {
    console.log('DATABASE_URI not specified, falling back to localhost.');
}

var configs = {
    databaseURI: databaseUri || 'mongodb://localhost:27017/dev',
    cloud: process.env.CLOUD_CODE_MAIN || __dirname + '/cloud/main.js',
    appId: process.env.APP_ID || 'personalApp',
    masterKey: process.env.MASTER_KEY || '13871387',
    fileKey: '13871387',
    clientKey: 'blogApp',
    restAPIKey: '13871387',
    javascriptKey: 'blogApp',
    dotNetKey: '13871387',

}


var api = new ParseServer(configs);
// Client-keys like the javascript key or the .NET key are not necessary with parse-server
// If you wish you require them, you can set them as options in the initialization above:
// javascriptKey, restAPIKey, dotNetKey, clientKey

var app = express();

// Serve the Parse API on the /parse URL prefix
var mountPath = process.env.PARSE_MOUNT || '/parse';
app.use(mountPath, api);

// Parse Server plays nicely with the rest of your web routes
app.get('/', function(req, res) {

    forever.list(false, function(e, f) {
        var table = new Table({
            head: ['uid', 'sourceDir', 'logFile', 'upTime', 'status'],
            colWidths: [15, 60, 60, 30, 10]
        });
        for (var i = 0; i < f.length; i++) {
            var item = f[i];
            var time = timespan.fromDates(new Date(item.ctime), new Date()).toString();
            table.push([
                item.uid, item.sourceDir, item.logFile, time, item.running
            ]);
        }
        var type = req.query.type || 'text';
        if (type == 'text') {
            res.send('<pre>' + table.toString() + '</pre>');
        }
        if (type == 'json') {
            res.send(f);
        }
        res.send(null);

    });

});

app.get('/config',function(req,res){
    res.send({
        appID: configs.appId,
        restAPIKey: configs.restAPIKey,
        javascriptKey: configs.javascriptKey,
    })
});


var port = process.env.PORT || 1337;
app.listen(port, function() {
    console.log('server running on port ' + port + '.');
});