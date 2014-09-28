var _ = require('underscore');
var math = require('mathjs');
var Amount = require('./amount-util.js').Amount;
var AmountUtil = require('./amount-util.js').AmountUtil;
var WSBookUtil = require('./web-socket-book-util.js').WSBookUtil;

var au = new AmountUtil();
var wsbu = new WSBookUtil();

function OfferService(r, a, s) {
    this.remote = r;
    this.secret = s;
    this.accountId = a;
    this.offers = [];
}

OfferService.prototype.getOffers = function(callback) {
    var self = this;
    var remote = this.remote;
    var accountId = this.accountId;

    remote.requestAccountOffers(accountId, function(err, result) {
        self.offers = [];
        _.each(result.offers, function(offer) {
            offer.quality = au.calPrice(offer.taker_pays, offer.taker_gets);
            self.offers.push(offer);
        });

        console.log("get offers success");

        if (callback) {
            callback("success");
        }
    });
};

OfferService.prototype.currentOffers = function() {
    return this.offers;
};

OfferService.prototype.ifOfferExist = function(pays, gets) {
    var offers = this.offers;

    var result = findSameBookOffer(offers, pays, gets);

    if (result.length > 0) {
        return true;
    }

    return false;
}

function findSameBookOffer(offers, pays, gets) {
    if (offers.length == 0) {
        return [];
    }

    if (pays instanceof Amount) {
        pays = pays.to_json();
    }
    if (gets instanceof Amount) {
        gets = gets.to_json();
    }

    var result = _.filter(offers, function(offer) {
        return offer.taker_pays.currency == pays.currency && offer.taker_pays.issuer == pays.issuer && offer.taker_gets.currency == gets.currency && offer.taker_gets.issuer == gets.issuer;
    });

    return result;
}

OfferService.prototype.createOffer = function(taker_pays, taker_gets, logger, createFO, callback) {
    console.log("create offer 1");
    var self = this;
    var remote = this.remote;
    var secret = this.secret;
    var accountId = this.accountId;
    var offers = this.offers;

    var tx = remote.transaction();
    if (secret) {
        tx.secret(secret);
    } else {
        return;
    }

    tx.offerCreate(accountId, taker_pays, taker_gets);
    tx.on("success", function(res) {
        self.getOffers(callback);
    });

    tx.on('proposed', function(res) {});

    tx.on("error", function(res) {
        if (callback) {
            callback(res);
        }
    });

    tx.submit();
}

OfferService.prototype.createSCPOffer = function(taker_pays, taker_gets, cmd, logger, callback) {
    var self = this;

    wsbu.exeCmd(cmd, function(cmdResult) {
        if (cmdResult.length == 0) {
            throw new Error("it is weird we get empty book!!!");
        }

        sameBookO = cmdResult[0];

        // var sameBookO = _.find(cmdResult, function(o) {
        //     return au.getIssuer(taker_pays) == au.getIssuer(o.TakerPays) &&
        //         au.getIssuer(taker_gets) == au.getIssuer(o.TakerGets);
        // })

        if (sameBookO && sameBookO.Account != self.accountId) {
            console.log("first order owner is ", sameBookO.Account);
            self.createOffer(taker_pays, taker_gets, logger, false, callback);
        } else {
            if (callback) {
                callback("our order in the first place!");
            }
        }
    });
}

OfferService.prototype.canCreateDCPOffers = function(cmds, i, callback) {
    var self = this;

    if (cmds.length > i) {
        var cmd = cmds[i];
        wsbu.exeCmd(cmd, function(result) {
            if (result.length == 0) {
                throw new Error("it is weird we get empty book!!!");
            }

            var taker_pays = result[0].TakerPays;
            var taker_gets = result[0].TakerGets;

            var sbo = findSameBookOffer(self.offers, taker_pays, taker_gets);
            if (result[0].Account == self.accountId) {
                if (sbo && sbo.length > 0) {
                    console.log(" find same book offers:", sbo.length);
                    self.cancelOffers(sbo, 0, function() {
                        console.log("cancel offers for dcp");
                        if (callback) {
                            callback(false);
                        }
                    });
                }
            } else {
                console.log("the first place owner is:" + result[0].Account);
                if (sbo && sbo.length > 3) {
                    console.log("can't create offer anymore, since find same book offers :", sbo.length);
                    if (callback) {
                        callback(false);
                    }
                } else {
                    i = i + 1;
                    self.canCreateDCPOffers(cmds, i, callback);
                }
            }
        });
    } else {
        if (callback) {
            callback(true)
        }
    }
}

OfferService.prototype.createFirstOffer = function(taker_pays, taker_gets, removeOld, cmd, logger, callback) {
    var self = this;

    if (removeOld) {
        wsbu.exeCmd(cmd, function(cmdResult) {
            if (cmdResult.length == 0) {
                throw new Error("it is weird we get empty book!!!");
            }

            if (cmdResult[0].Account != self.accountId) {
                console.log("first order owner:", cmdResult[0].Account);
                var results = findSameBookOffer(self.offers, taker_pays, taker_gets);
                if (results && results.length > 0) {
                    console.log("find same book offers:", results.length);
                    self.cancelOffers(results, 0, function() {
                        console.log("we have cleaned all non-first offers, now we create new offer.");
                        self.createOffer(taker_pays, taker_gets, logger, true, callback);
                    });
                } else {
                    self.createOffer(taker_pays, taker_gets, logger, true, callback);
                }
            } else {
                console.log("our offer already in the first place. we don't need to create another!!!");
                if (callback) {
                    callback("success");
                }
            }
        });
    } else {
        self.createOffer(taker_pays, taker_gets, logger, true, callback);
    }
}


OfferService.prototype.canCreate = function(order) {
    var self = this;
    var firstOrders = self.offers;
    var dst_currency = au.getCurrency(order.TakerGets);
    var src_currency = au.getCurrency(order.TakerPays);

    if (firstOrders.length == 0) {
        return true;
    }

    var orders = _.filter(firstOrders, function(o) {
        return src_currency == o.dst_currency && dst_currency == o.src_currency;
    });

    var hasProfit = false;
    orders.every(function(o) {
        if (o.quality * order.quality < 1) {
            hasProfit = true;
        }
        return !hasProfit;
    });

    return !hasProfit;
};


OfferService.prototype.cancelOffers = function(offersToCancel, i, callback) {
    var self = this;

    if (offersToCancel.length > i) {
        self.cancelOffer(offersToCancel[i], function() {
            i = i + 1;
            self.cancelOffers(offersToCancel, i, callback);
            return;
        });
    } else {
        if (callback) {
            callback();
        }
    }
}

function logOffer(offer) {
    var offer_taker_pays_issuer = au.getIssuer(offer.taker_pays);
    var offer_taker_gets_issuer = au.getIssuer(offer.taker_gets);
    var offer_taker_pays_currency = au.getCurrency(offer.taker_pays);
    var offer_taker_gets_currency = au.getCurrency(offer.taker_gets);


    console.log("offer:" + offer_taker_pays_currency + "(" + offer_taker_pays_issuer + ")->" +
        offer_taker_gets_currency + "(" + offer_taker_gets_issuer + ")");
}

OfferService.prototype.cancelOffer = function(offer, callback) {
    var self = this;

    console.log("start to cancel offer:" + offer.seq);
    self.remote.transaction().offerCancel(self.accountId, offer.seq).secret(self.secret).on('success', function() {
        console.log('offer Cancel success!!!');
        logOffer(offer);

        self.offers = _.without(self.offers, _.findWhere(self.offers, {
            'seq': offer.seq
        }));

        if (callback) {
            callback();
        }
    }).submit();
}

OfferService.prototype.cancelOfferUnderSameBook = function(pays, gets) {
    var offers = this.offers;
    var secret = this.secret;
    var accountId = this.accountId;

    var offersCancel = _.filter(offers, function(offer) {
        return offer.taker_pays.currency == pays.currency && offer.taker_pays.issuer == pays.issuer &&
            offer.taker_gets.currency == gets.currency && offer.taker_gets.issuer == gets.issuer;
    });

    _.each(offersCancel, function(offer) {
        remote.transaction().offerCancel(accountId, offer.seq).secret(secret).on('success', function() {
            console.log('offerCancel', offer.taker_pays, offer.taker_gets);
        }).submit();
    });
}

OfferService.prototype.allExist = function(offers) {
    var self = this;
    var allIsExist = true;

    offers.every(function(offer) {
        allIsExist = self.ifOfferExist(offer.TakerPays, offer.TakerGets);
        return allIsExist;
    })

    return allIsExist;
}

OfferService.prototype.atLeastExistOne = function(offers, reversed) {
    var self = this;
    var existOne = false;

    offers.every(function(offer) {
        if (reversed) {
            existOne = self.ifOfferExist(offer.TakerGets, offer.TakerPays);
        } else {
            existOne = self.ifOfferExist(offer.TakerPays, offer.TakerGets);
        }
        return !existOne;
    })

    return existOne;
}

exports.OfferService = OfferService;
