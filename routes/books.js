var currencyInfo = require('../src/offer/currencyInfo');
var express = require('express');
var router = express.Router();

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
