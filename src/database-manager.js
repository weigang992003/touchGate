var mongoose = require('mongoose');
var issuerToDomain = require('./issuerDomain');

//var connect = mongoose.connect('mongodb://localhost/ripple-info', function(e) {
var connect = mongoose.connect('mongodb://198.199.114.105/ripple-info', function(e) {
    if (e) console.log(e.message);
    console.log('connect success')
});

// store all domain
var issuerDomainMap = {};

var tradeDataSchema = mongoose.Schema({
    tx_hash: String,
    trade_type: String,
    taker_pays_currency: String,
    taker_pays_value: Number,
    taker_pays_issuer: String,
    taker_pays_domain: String,
    taker_gets_currency: String,
    taker_gets_value: Number,
    taker_gets_issuer: String,
    taker_gets_domain: String,
    account: String,
    currency_pair: String,
    time: Number
}, {
    collection: 'reallyTradeData'
});

var TradeData = mongoose.model('tradeData', tradeDataSchema);

exports.initialDrawDataByValue = function(startTime, endTime, currency, callback) {
    var issuerCategories = new Array();
    var paysSeries = new Array();
    var getsSeries = new Array();

    var rawIssuerCategories = new Array();
    var rawPaysSeries = new Array();
    var rawGetsSeries = new Array();

    var currencyPays = currency;
    var currencyList = currency.split('/');
    var currencyGets = currencyList[1] + '/' + currencyList[0];

    aggregateOperationPays(startTime, endTime, currency, function(resultPays) {
        rawPaysSeries = resultPays;
        aggregateOperationGets(startTime, endTime, currency, function(resultGets) {
            rawGetsSeries = resultGets;
            for (var i = rawPaysSeries.length - 1; i >= 0; i--) {
                var totalValue = rawPaysSeries[i]['totalPrice'];
                var paysIssuer = rawPaysSeries[i]['_id']['taker_pays_issuer'];
                var paysItem = {
                    name: currencyPays,
                    y: totalValue
                };
                paysSeries.push(paysItem);
                rawIssuerCategories.push(paysIssuer);
            };

            for (var i = 0; rawIssuerCategories.length > i; i++) {
                var issuer = rawIssuerCategories[i];
                var getCur = rawGetsSeries.length - 1;
                for (; getCur >= 0; getCur--) {
                    var getsIssuer = rawGetsSeries[getCur]['_id']['taker_gets_issuer'];
                    if (issuer === getsIssuer) {
                        var getsTotal = rawGetsSeries[getCur]['totalPrice'];
                        var getsItem = {
                            name: currencyGets,
                            y: getsTotal
                        };
                        getsSeries.push(getsItem);
                        rawGetsSeries.splice(getCur, 1);
                        break;
                    }
                }

                // not find match
                if (getCur === -1) {
                    var getsItem = {
                        name: currencyGets,
                        y: 0
                    };
                    getsSeries.push(getsItem);
                }
            }

            for (var i = rawGetsSeries.length - 1; i >= 0; i--) {
                var getsTotal = rawGetsSeries[i]['totalPrice'];
                var issuer = rawGetsSeries[i]['_id']['taker_gets_issuer'];
                var paysItem = {
                    name: currencyPays,
                    y: 0
                };
                var getsItem = {
                    name: currencyGets,
                    y: getsTotal
                };
                getsSeries.push(getsItem);
                paysSeries.push(paysItem);
                rawIssuerCategories.push(issuer);
            };

            /*
            console.log('in databaseManager');
            console.log(paysSeries);
            console.log(getsSeries);
            console.log(rawIssuerCategories);
            */
            var paysResult = {
                name: 'Trade Total',
                data: paysSeries
            };
            var getsResult = {
                name: 'Trade Total',
                data: getsSeries
            };
            var issuerResult = transIssuerToDomain(rawIssuerCategories);

            callback(paysResult, getsResult, issuerResult);
        });
    });
}

function transIssuerToDomain(issuers) {
    var ret = new Array();
    for (var i = 0; issuers.length > i; i++) {
        var domain = issuerToDomain.getDomain(issuers[i]);
        var tmp = issuers[i];
        if (domain != null) {
            tmp = domain;
        }
        ret.push(tmp);
    }
    return ret;
}

function aggregateOperationGets(startTime, endTime, currencyPair, callback) {
    var currencys = currencyPair.split('/');
    var baseStartTime = convertTimeToSeconds(startTime);
    var baseEndTime = convertTimeToSeconds(endTime) + (24 * 60 * 60 - 1);
    var querySumValue = TradeData.aggregate({
        $match: {
            taker_pays_currency: currencys[1],
            taker_gets_currency: currencys[0],
            time: {
                $lt: baseEndTime,
                $gte: baseStartTime
            }
        }
    }, {
        $group: {
            _id: {
                taker_gets_currency: '$taker_gets_currency',
                taker_pays_currency: '$taker_pays_currency',
                taker_gets_issuer: '$taker_gets_issuer'
            },
            totalPrice: {
                $sum: '$taker_gets_value'
            },
            count: {
                $sum: 1
            }
        }
    }, function(err, result) {
        if (err) console.error(err.message);
        callback(result);
    });
}

function aggregateOperationPays(startTime, endTime, currencyPair, callback) {
    var currencys = currencyPair.split('/');
    var baseStartTime = convertTimeToSeconds(startTime);
    var baseEndTime = convertTimeToSeconds(endTime) + (24 * 60 * 60 - 1);
    var querySumValue = TradeData.aggregate({
        $match: {
            taker_pays_currency: currencys[0],
            taker_gets_currency: currencys[1],
            time: {
                $lt: baseEndTime,
                $gte: baseStartTime
            }
        }
    }, {
        $group: {
            _id: {
                taker_gets_currency: '$taker_gets_currency',
                taker_pays_currency: '$taker_pays_currency',
                taker_pays_issuer: '$taker_pays_issuer'
            },
            totalPrice: {
                $sum: '$taker_pays_value'
            },
            count: {
                $sum: 1
            }
        }
    }, function(err, result) {
        if (err) console.error(err.message);
        callback(result);
    });
}

exports.getCurrencyPair = function(callback) {
    var curencyPair;
    var q = TradeData.distinct('currency_pair');
    q.exec(function(err, result) {
        currencyPair = result;
        for (var i = currencyPair.length - 1; i >= 0; i--) {
            var otherhSide = currencyPair[i].split('/');
            var tmp = otherhSide[1] + '/' + otherhSide[0];
            if (otherhSide[0] === 'XRP' || otherhSide[0].length != 3 || otherhSide[1].length != 3) {
                delete currencyPair[i];
            }
        }
        callback(currencyPair);
    });
}

// beginTime and endTime should be the format of xxxx-xx-xx(years-month-day)
exports.findByTime = function(beginTime, endTime, callback) {
    var bTime = convertTimeToSeconds(beginTime);
    var eTime = convertTimeToSeconds(endTime);
    TradeData.find()
        .where('time').gt(bTime).lt(eTime)
        .sort('time')
        .exec(callback);
};

// humanTime should be format by xxxx-xx-xx(years-month-day)
function convertTimeToSeconds(humanTime) {
    return Date.parse(humanTime) / 1000;
}

function convertSecondsToTime(seconds) {
    var date = new Date(seconds * 1000).toJSON();
    return date.split('T')[0];
}
