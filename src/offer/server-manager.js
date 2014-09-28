var ripple = require('ripple-lib');
var events = require('events');
var OfferService = require('./offer-service').OfferService;
var RemoteService = require('./remote-service');
var AmountUtil = require('./amount-util.js').AmountUtil;
var config = require('./config.js');
var crypto = require('./crypto-util.js');
var tfmjs = require('./the-future-manager.js');

var Amount = ripple.Amount;
var emitter = new events.EventEmitter();

var au = new AmountUtil();
var account = null;
var secret = null;
var remote = RemoteService.getRemote();

var offerService = null;

console.log("step1:getAccount!")
tfmjs.getAccount(config.marketMaker, function(result) {
    account = result.account;
    secret = result.secret;
    decrypt(secret);
});

function decrypt(encrypted) {
    console.log("step2:decrypt secret!")
    crypto.decrypt(encrypted, function(result) {
        secret = result;
        tfmjs.getEnv(function(result) {
            remoteConnect(result.env);
        })
    });
}

remoteConnect(1);

function remoteConnect(env) {
    console.log("step3:connect to remote!")
    RemoteService.getRemote(env, function(r) {
        remote = r;

        remote.connect(function() {
            offerService = new OfferService(remote, account, secret);
            console.log("server connect success");
            offerService.getOffers();

            /*
            tls = new TrustLineService(remote, account);
            tls.getLines(function() {
                listenProfitOrder();
            });
*/

            remote.on('error', function(error) {
                throw new Error("remote error!");
            });

            remote.on('disconnect', function() {
                console.log("server manager distconnect");
                remoteConnect(env);
            });
        });
    });
}

exports.makeOffer = function(takerPays, takerGets, callback) {
    var order = {};
    if (takerPays['currency'] === 'XRP')
        order['TakerPays'] = takerPays['value'];
    else
        order['TakerPays'] = takerPays;

    if (takerGets['currency'] === 'XRP')
        order['TakerGets'] = takerGets['value'];
    else
        order['TakerGets'] = takerGets;

    makeSameCurrencyProfit(order, callback);
}
function makeSameCurrencyProfit(order, callback) {
    console.log("create offer: " + JSON.stringify(order));
    var order_taker_pays = Amount.from_json(order.TakerPays);
    var order_taker_gets = Amount.from_json(order.TakerGets);

    order_taker_pays = order_taker_pays.product_human("1.0001");

    /*
    var order_pays_balance = tls.getBalance(au.getIssuer(order.TakerPays), au.getCurrency(order.TakerPays));
    var order_gets_capacity = tls.getCapacity(au.getIssuer(order.TakerGets), au.getCurrency(order.TakerGets));
    console.log("order_taker_pays for same currency:", order_taker_pays.to_text_full());
    console.log("order_gets_capacity for same currency:", order_gets_capacity.to_text_full());

    var min_taker_pays = au.minAmount([order_taker_pays, order_pays_balance]);
    var min_taker_gets = au.minAmount([order_taker_gets, order_gets_capacity]);

    if (au.isVolumnNotAllowed(min_taker_pays) || au.isVolumnNotAllowed(min_taker_gets)) {
        console.log("the volumn is too small to trade for same currency profit");
        emitter.once('makeSameCurrencyProfit', makeSameCurrencyProfit);
        return;
    }

*/
    var cmd = buildCmd(order);

    // need login ok
    return

    offerService.createSCPOffer(order_taker_pays.to_json(), order_taker_gets.to_json(), cmd, null, callback);
}

function buildCmd(order) {
    var pays_issuer = au.getIssuer(order.TakerPays);
    var pays_currency = au.getCurrency(order.TakerPays);
    var gets_issuer = au.getIssuer(order.TakerGets);
    var gets_currency = au.getCurrency(order.TakerGets);

    var cmd = {
        "cmd": "book",
        "params": {
            "pays_currency": [pays_currency],
            "gets_currency": [gets_currency]
        },
        "limit": 1,
        "filter": 1,
        "cache": 0
    }

    if (pays_currency == gets_currency) {
        cmd.filter = 0;
        cmd.params[pays_currency] = [pays_issuer, gets_issuer];
        cmd.params["pays_issuer"] = [pays_issuer];
        cmd.params["gets_issuer"] = [gets_issuer];
    } else {
        cmd.params[pays_currency] = [pays_issuer];
        cmd.params[gets_currency] = [gets_issuer];
    }

    console.log(cmd);

    return cmd;
}