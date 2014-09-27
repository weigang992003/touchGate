var math = require('mathjs');
var _ = require('underscore');
var drops = require('./config.js').drops;
var Amount = require('ripple-lib').Amount;
var profit_min_volumns = require('./config.js').profit_min_volumns;


function AmountUtil() {}

AmountUtil.prototype.calPrice = function(pays, gets) {
    if (getCurrency(pays) == "XRP") {
        return math.round(pays / (drops * gets.value), 15);
    }
    if (getCurrency(gets) == "XRP") {
        return math.round(pays.value * drops / gets, 15);
    }
    return math.round(pays.value / gets.value, 15);
};

AmountUtil.prototype.toExp = function(price) {
    return (price - 0).toExponential();
}

AmountUtil.prototype.isVolumnNotAllowed = function(amount) {
    return !this.isVolumnAllowed(amount);
}

AmountUtil.prototype.isVolumnAllowed = function(amount) {
    if (amount instanceof Amount) {
        if (amount.is_zero()) {
            return false;
        }
        amount = amount.to_json();
    }

    var currency = getCurrency(amount);

    var min_volumn = profit_min_volumns[currency];

    var isAllow;
    if (min_volumn) {
        if (currency == "XRP") {
            isAllow = min_volumn - amount < 0;
            if (!isAllow) {
                console.log(currency + " min_volumn:" + min_volumn, "real volumn:" + amount)
            }
        } else {
            isAllow = min_volumn - amount.value < 0;
            if (!isAllow) {
                console.log(currency + " min_volumn:" + min_volumn, "real volumn:" + amount.value);
            }
        }
    } else {
        console.log("we don't set min_volumn for currency:", currency);
    }

    return isAllow;
}

AmountUtil.prototype.minAmount = function(amounts) {
    return minAmount(amounts);
}

AmountUtil.prototype.getIssuer = function(amountJson) {
    return getIssuer(amountJson);
};

AmountUtil.prototype.getPrice = function(order, pays_currency, gets_currency) {
    return getPrice(order, pays_currency, gets_currency);
}

AmountUtil.prototype.getCurrency = function(amountJson) {
    return getCurrency(amountJson);
}

AmountUtil.prototype.getValue = function(amountJson) {
    if (getCurrency(amountJson) == "XRP") {
        return amountJson;
    } else {
        return amountJson.value;
    }
}

AmountUtil.prototype.setValue = function(src_amount, dst_amount) {
    return setValue(src_amount, dst_amount);
}

AmountUtil.prototype.product = function(amount, factor) {
    if (amount instanceof Amount) {
        return amount.product_human(factor);
    }

    if (typeof amount == "string") {
        return amount * factor + "";
    }

    if (typeof amount == "number") {
        return amount * factor + "";
    }

    if (amount.value) {
        amount.value = amount.value * factor + "";
        return amount;
    }
}

AmountUtil.prototype.ratio = function(src_amount, dst_amount) {
    if (src_amount instanceof Amount && dst_amount instanceof Amount) {
        var times = dst_amount.ratio_human(src_amount).to_human().replace(',', '');
        return math.round(times - 0, 6);
    }

    if (typeof src_amount == "string" && typeof dst_amount == "string") {
        return math.round(dst_amount / src_amount, 6);
    }

    if (typeof src_amount == "number" && typeof dst_amount == "number") {
        return math.round(dst_amount / src_amount, 6);
    }

    if (src_amount.value && dst_amount.value) {
        return math.round(dst_amount.value / src_amount.value, 6);
    }
}

AmountUtil.prototype.zoom = function(old_one, new_one, zoom_object) {
    var times = this.ratio(old_one, new_old);
    return this.product(zoom_object, times);
}


function minAmount(amounts) {
    if (!amounts || amounts.length == 0) {
        return;
    }
    if (amounts.length == 1) {
        return amounts[0];
    }
    var minAmount = amounts[0];

    _.each(amounts, function(amount) {
        if (minAmount.compareTo(amount) == 1) {
            minAmount = amount;
        }
    })

    return minAmount;
}

function getIssuer(amountJson) {
    return typeof amountJson == "string" ? "rrrrrrrrrrrrrrrrrrrrrhoLvTp" : amountJson.issuer;
}

function getCurrency(amountJson) {
    return typeof amountJson == "string" ? "XRP" : amountJson.currency;
}

function setValue(src_amount, dst_amount) {
    if (src_amount.currency().to_json() == "XRP") {
        return dst_amount;
    }

    var src_amount_json = src_amount.to_json();
    var dst_amount_json = dst_amount.to_json();

    src_amount_json.value = dst_amount_json.value;

    return Amount.from_json(src_amount_json);
}

function getPrice(order, pays_currency, gets_currency) {
    if (gets_currency == "XRP") {
        return math.round(order.quality * drops, 15) + "";
    } else if (pays_currency == "XRP") {
        return math.round(order.quality / drops, 15) + "";
    } else {
        return math.round(order.quality - 0, 15) + "";
    }
}

exports.Amount = Amount;
exports.setValue = setValue;
exports.getPrice = getPrice;
exports.minAmount = minAmount;
exports.getIssuer = getIssuer;
exports.AmountUtil = AmountUtil;
exports.getCurrency = getCurrency;