var express = require('express');
var router = express.Router();
var databaseManager = require('../src/statistics/database-manager');

router.get('/', function(req, res) {
    res.render('gatewayinfo');
});

router.get('/getallinfo', function(req, res) {
    console.log('getallinfo');
    databaseManager.getAllGatewayInfo(function(result) {
        var ret = {};
        if (result.length > 0) {
            var tmp = result.sort(function(a, b) {
                return a['title'] !== null;
            });
            ret['status'] = 'success';
            ret['result'] = tmp;
        } else {
            ret['result'] = 'error';
        }
        res.json(ret);
    });
});

module.exports = router;
