var express = require('express');
var dailyData = require('../src/dailyData');
var dbManager = require('../src/database-manager');
var router = express.Router();

/* GET users listing. */
router.get('/', function(req, res) {
    //    res.send('respond with a resource');
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

module.exports = router;
