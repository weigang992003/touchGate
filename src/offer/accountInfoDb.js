var mongoose = require('mongoose');
var config = require('../config');

var dbConnect = mongoose.createConnection(config.dbServer['accountInfo']);

var txHistorySchema = mongoose.Schema({
    __v: Number,
    hashs: Array,
    account: String,
    i_gets_currency: String,
    i_gets_value: Number,
    i_pays_currency: String,
    i_pays_value: Number,
    price: Number
}, {
    collection: 'txHisotry'
});

var currencyInfoSchema = mongoose.Schema({
    currency: String,
    issuers: Array,
    __v: String,
}, {
    collection: 'currencyInfo'
});

var CurrencyInfo = dbConnect.model('currencyInfo', currencyInfoSchema);
var TxHistory = dbConnect.model('TxHistory', txHistorySchema);

exports.getSupportCurrency = function(callback) {
    var query = CurrencyInfo.distinct('currency');
    query.exec(function(err, result) {
        if (err) {
            console.log(err);
            return;
        }
        if (callback) {
            callback(result);
        }
    });
}

exports.getIssuerByCurrency = function(currency, callback) {
    var query = CurrencyInfo.findOne({
        currency: currency
    });
    query.select('issuers -_id').exec(function(err, result) {
        if (err) {
            console.log(err);
            return;
        }
        if (callback) {
            var issuers = result['issuers'];
            callback(result);
        }
    });
}

exports.getCurrencyInfo = function(callback) {
    var query = CurrencyInfo.find({});
    query.select('issuers currency').exec(function(err, result) {
        if (err) {
            console.log(err);
            return;
        }
        if (callback) {
            var ret = {};
            for (var i = result.length - 1; i >= 0; i--) {
                ret[result[i]['currency']] = result[i]['issuers']
            };
            callback(ret);
        }
    });
}

exports.getAllTxHistoryData = function(callback) {
    TxHistory.find({}, function(err, result) {
        if (err) {
            console.log("find tx history error: " + err);
            callback('error');
        } else {
            callback(result);
        }
    });
}

/*
var self = this
this.getSupportCurrency(function(result) {
    console.log("getSupportCurrency");
    self.getIssuerByCurrency(result[4], function(is) {
        console.log("getIssuerByCurrency");
    });
});

this.getAllTxHistoryData(function(ret) {
    console.log("getAllTxHistoryData test");
    console.log(ret);
});

*/