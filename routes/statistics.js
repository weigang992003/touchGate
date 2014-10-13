var express = require('express');
var dailyData = require('../src/statistics/dailyData');
var dbManager = require('../src/statistics/database-manager');
var router = express.Router();

router.get('/tradehistorydata', function(req, res) {
    startTime = req.query.startTime;
    endTime = req.query.endTime;
    currencyPair = req.query.currencyPair;

    console.log(startTime);
    console.log(endTime);
    console.log(currencyPair);
    dbManager.initialDrawDataByValue(startTime, endTime, currencyPair, function(paysSerial, getSeiral, issuerCategories) {
        var len = issuerCategories.length;
        if (len > 0) {
            var result = {
                status: 'success',
                pays: paysSerial,
                gets: getSeiral,
                issuer: issuerCategories
            };
            res.json(result);
        } else {
            res.json({
                status: 'failed'
            });
        }
    });
});

router.get('/', function(req, res) {
    dbManager.getCurrencyPair(function(currencyPairArray) {
        res.render('tradeHistory', {
            title: 'Kissingate',
            draw_height: '400px',
            startTimeArray: dailyData.getTimeArray(),
            endTimeArray: dailyData.getTimeArray(),
            currencyPairArray: currencyPairArray
        });
    });
});

module.exports = router;
