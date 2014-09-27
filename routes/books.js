var currencyInfo = require('../src/offer/currencyInfo');
var WSBookUtil = require('../src/offer/web-socket-book-util').WSBookUtil;
var express = require('express');
var router = express.Router();

var wsbu = new WSBookUtil();

router.get('/', function(req, res) {
    res.render('books', {
        title: 'books'
    });
});

router.get('/getbooks', function(req, res) {
    var getsIssuers = req.query.getsIssuer;
    var paysIssuers = req.query.paysIssuer;
    var getsCurrency = req.query.currencyGetsSelector;
    var paysCurrency = req.query.currencyPaysSelector;

    console.log(getsIssuers);
    console.log(paysIssuers);
    console.log(getsCurrency);

    var paysCurrencyArray = new Array();
    var getsCurrencyArray = new Array();
    paysCurrencyArray.push(paysCurrency);
    getsCurrencyArray.push(getsCurrency);
    wsbu.exeCmd({
        "cmd": "book",
        "params": {
            "pays_currency":paysCurrencyArray,
            "pays_issuer":paysIssuers,
            "gets_currency":getsCurrencyArray,
            "gets_issuer":getsIssuers
        },
        "limit": 1,
        "filter": 0,
        "cache": 1
    }, function(orders) {
        console.log(orders);
    });
    console.log(paysCurrency);

    res.render('books', {
        title: 'getbooks'
    });
});

router.get('/getcurrencies', function(req, res) {
    currencyInfo.getSupportCurrency(function(result) {
        currencyInfo.getCurrencyInfo(function(alldata) {
            res.json({
                currencies: result,
                all: alldata
            });
        });
    });
});

router.get('/offercreate', function(req, res) {
    res.render('books', {
        title: 'offercreate'
    });
});

module.exports = router;
