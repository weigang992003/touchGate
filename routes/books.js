var currencyInfo = require('../src/offer/currencyInfo');
var WSBookUtil = require('../src/offer/web-socket-book-util').WSBookUtil;
var AmountUtil = require('../src/offer/amount-util').AmountUtil;
var ServerManager = require('../src/offer/server-manager');
var express = require('express');
var router = express.Router();

var wsbu = new WSBookUtil();
var au = new AmountUtil();

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

    var paysCurrencyArray = new Array();
    var paysIssuersArray = new Array();
    var getsCurrencyArray = new Array();
    var getsIssuersArray = new Array();
    paysCurrencyArray.push(paysCurrency);
    getsCurrencyArray.push(getsCurrency);

    if (typeof(paysIssuers) === 'string') {
        paysIssuersArray.push(paysIssuers);
    } else {
        paysIssuersArray = paysIssuers;
    }
    if (typeof(getsIssuers) === 'string') {
        getsIssuersArray.push(getsIssuers);
    } else {
        getsIssuersArray = getsIssuers;
    }

    console.log(getsIssuersArray);
    console.log(paysIssuersArray);
    console.log(getsCurrencyArray);
    console.log(paysCurrencyArray);

    wsbu.exeCmd({
        "cmd": "book",
        "params": {
            "pays_currency": paysCurrencyArray,
            "pays_issuer": paysIssuersArray,
            "gets_currency": getsCurrencyArray,
            "gets_issuer": getsIssuersArray
        },
        "limit": 1,
        "filter": 0,
        "cache": 1
    }, function(orders) {
        res.json({
            books: formatOrder(orders)
        });
    });

});

function formatOrder(rawOrders) {
    var len = rawOrders.length;
    var ret = new Array();
    for (var i = 0; i < len; i++) {
        var item = {};
        item['paysCurrency'] = au.getCurrency(rawOrders[i]['TakerPays']);
        item['paysIssuer'] = au.getIssuer(rawOrders[i]['TakerPays']);
        item['paysValue'] = au.getValue(rawOrders[i]['TakerPays']);

        item['getsCurrency'] = au.getCurrency(rawOrders[i]['TakerGets']);
        item['getsIssuer'] = au.getIssuer(rawOrders[i]['TakerGets']);
        item['getsValue'] = au.getValue(rawOrders[i]['TakerGets']);

        item['quality'] = rawOrders[i]['quality'];

        ret.push(item);
    };
    return ret;
}

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
    var paysCurrency = req.query.paysCurrency;
    var paysIssuer = req.query.paysIssuer;
    var paysValue = req.query.paysValue;
    var getsCurrency = req.query.getCurrency;
    var getsIssuer = req.query.getIssuer;
    var getsValue = req.query.getsValue;
    var quality = req.query.quality;

    var takerPays = {
        "currency": paysCurrency,
        "value": paysValue.toString(),
        "issuer": paysIssuer
    };
    var takerGets = {
        "currency": getsCurrency,
        "value": getsValue.toString(),
        "issuer": getsIssuer
    };

    ServerManager.makeOffer(takerPays, takerGets, function(result) {
        console.log("offer create end");
        console.log(result);
        res.json({
            status: result,
        });
    });
});

module.exports = router;
