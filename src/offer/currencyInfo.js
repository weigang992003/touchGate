var mongoose = require('mongoose');

//var connect = mongoose.connect('mongodb://localhost/currencyInfo', function(e) {
var connect = mongoose.createConnection('mongodb://198.199.114.105/account-info');
/*
var connect = mongoose.connect('mongodb://198.199.114.105/account-info', function(e) {
    if (e) console.log(e.message);
    console.log('currency info connect success')
});
*/

var currencyInfoSchema = mongoose.Schema({
    currency: String,
    issuers: Array,
    __v: String,
}, {
    collection: 'currencyInfo'
});

var CurrencyInfo = connect.model('currencyInfo', currencyInfoSchema);

exports.getSupportCurrency = function(callback) {
    var query = CurrencyInfo.distinct('currency');
    query.exec(function(err, result) {
        if (err) {
            console.log("getSupportCurrency failed");
            return;
        }
        if (callback) {
            console.log("in getSupportCurrency(callback)");
            console.log(result);
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
            console.log(issuers);
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

/*
var self = this
this.getSupportCurrency(function(result) {
    console.log("getSupportCurrency");
    self.getIssuerByCurrency(result[4], function(is) {
        console.log("getIssuerByCurrency");
    });
});
*/
