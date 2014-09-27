var express = require('express');
var dailyData = require('../src/statistics/dailyData');
var dbManager = require('../src/statistics/database-manager');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
    dbManager.getCurrencyPair(function(currencyPairArray) {
        res.render('index', {
            title: 'Kissingate',
            draw_height: '400px',
            startTimeArray: dailyData.getTimeArray(),
            endTimeArray: dailyData.getTimeArray(),
            currencyPairArray: currencyPairArray
        });
    });
});

module.exports = router;
