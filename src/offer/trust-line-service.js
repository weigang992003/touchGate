var _ = require('underscore');
var Amount = require('ripple-lib').Amount;

var config = require('../config.js');
var xrpIssuer = config.xrpIssuer;

function TrustLineService(r, a) {
    this.remote = r;
    this.accountId = a;
    this.lines = [];
    this.account_limits = {};
    this.account_balances = {};
    this.issuerMap = {};
}

TrustLineService.prototype.getLines = function(callback) {
    var self = this;
    var remote = this.remote;
    var accountId = this.accountId;
    var issuerMap = this.issuerMap;
    var account_limits = this.account_limits;
    var account_balances = this.account_balances;

    remote.requestAccountBalance(accountId, function(err, balance) {
        if (err) {
            throw new Error("error happen when we get account root!");
        }
        account_balances[xrpIssuer + "XRP"] = balance.to_text();

        remote.requestAccountLines(accountId, function() {
            lines = arguments[1].lines;
            _.each(lines, function(line) {
                if (line.limit == 0) {
                    return;
                }

                account_limits[line.account + line.currency] = line.limit;
                account_balances[line.account + line.currency] = line.balance;

                var issuers = issuerMap[line.currency];
                if (!issuers) {
                    issuers = [];
                }
                if (!_.contains(issuers, line.account)) {
                    issuers.push(line.account);
                }
                issuerMap[line.currency] = issuers;
            });

            self.issuerMap = issuerMap;
            self.account_limits = account_limits;
            self.account_balances = account_balances;

            console.log("get account_limits success!!");

            if (callback) {
                callback(lines);
            }
        });
    });
};

TrustLineService.prototype.getBalance = function(issuer, currency) {
    var value = this.account_balances[issuer + currency];
    if (value && currency == "XRP") {
        return Amount.from_json(value + "");
    }

    if (value) {
        return Amount.from_json({
            'issuer': issuer,
            'currency': currency,
            'value': value
        });
    }
}

TrustLineService.prototype.setBalance = function(issuer, currency, balance) {
    this.account_balances[issuer + currency] = balance;
};

TrustLineService.prototype.getIssuers = function(currency) {
    return currency == "XRP" ? [xrpIssuer] : this.issuerMap[currency];
}

TrustLineService.prototype.overLimit = function(issuer, currency) {
    if (currency == "XRP") {
        return false;
    }

    var limit = this.account_limit[issuer + currency];
    var value = this.account_balances[issuer + currency];
    if (limit && value) {
        return value - limit >= 0;
    }

    return true;
};

TrustLineService.prototype.getCapacity = function(issuer, currency) {
    if (currency == "XRP") {
        return Amount.from_json("1000000000000000000000");
    }

    var limit = this.account_limits[issuer + currency];
    var value = this.account_balances[issuer + currency];

    if (limit && value && limit - value > 0) {
        return Amount.from_json({
            'issuer': issuer,
            'currency': currency,
            'value': limit - value + ""
        });
    }

    return Amount.from_json({
        'issuer': issuer,
        'currency': currency,
        'value': "0"
    });;
}

exports.TrustLineService = TrustLineService;
