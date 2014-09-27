exports.drops = 1000000;

exports.motherAccount = "rf9q1WE2Kdmv9AWtesCaANJyNxnFjp5T7z";

exports.marketEvent = {
    buy: '-buy-price-change',
    sell: '-sell-price-change'
};

exports.strategyEvents = {
    deal: 'make-a-deal'
};

exports.mongodb_server = {
    host: '127.0.0.1',
    port: '27017',
    server_options: {},
    db_options: {
        w: -1
    }
};

exports.remote_options = {
    // see the API Reference for available options
    // trace: true,
    trusted: true,
    local_signing: true,
    local_fee: true,
    fee_cushion: 1.5,
    max_fee: 100,
    servers: [{
        host: 's1.ripple.com',
        port: 443,
        secure: true
    }]
};

exports.currency_unit = {
    "XRP": "40000000",
    "BTC": "0.00016",
    "USD": "0.200",
    "JPY": "20",
    "CNY": "1.400",
    "FMM": "1.400",
    "EUR": "0.160",
    "CAD": "0.200",
    "ILS": "2.000",
    "CHF": "0.200",
    "NZD": "0.200",
    "XAU": "0.00012"
};

exports.transfer_rates = {
    'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B': 0.002,
    'r9Dr5xwkeLegBeXq6ujinjSBLQzQ1zQGjH': 0.002,
    'rPDXxSZcuVL3ZWoyU82bcde3zwvmShkRyF': 0.025,
    'rNPRNzBB92BVpAhhZr4iXDTveCgV5Pofm9': 0.002,
    'rfYv1TXnwgDDK4WQNbFALykYuEBnrR4pDX': 0.0015
}

exports.same_currency_issuers = {
    'CNY': ['rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y', 'razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA', 'rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK'],
    'USD': ['rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q', 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'],
    'BTC': ['rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q', 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B']
}

exports.same_currency_profit = ["CNY"];
exports.same_issuer_profit = ["rNPRNzBB92BVpAhhZr4iXDTveCgV5Pofm9"];

exports.first_order_currencies = ["CNY", "XRP", "USD", "BTC", "JPY"];
exports.first_order_allow_volumns = {
    "CNY": "10",
    "JPY": "100",
    "USD": "2",
    "XRP": "200000000",
    "BTC": "0.0001"
}
exports.first_order_allow_issuers = {
    'CNY': ['rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y', 'razqQKzJRdB4UxFPWf5NEpEG3WMkmwgcXA', 'rnuF96W4SZoCJmbHYBFoJZpR8eCaxNvekK'],
    'XRP': ['rrrrrrrrrrrrrrrrrrrrrhoLvTp'],
    'USD': ['rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q', 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B'],
    'JPY': ['rMAz5ZnK73nyNUL4foAvaxdreczCkG3vA6'],
    'BTC': ['rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q', 'rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B']
}
exports.profit_min_volumns = {
    "XRP": "20000000",
    "BTC": "0.0002",
    "USD": "1",
    "JPY": "20",
    "CNY": "2",
    "FMM": "2",
    "EUR": "0.8"
}

exports.currencies_no = {
    "XRP": 2,
    "CNY": 3,
    "JPY": 5,
    "USD": 7,
    "BTC": 11
}

exports.mother = -1;
exports.newAccount = 0;
exports.tradeFailed = 1;
exports.marketMaker = 2;
exports.trustLine = 3;

exports.factorWeight = 5;
exports.profitRate = 0.999;
exports.delayWhenFailure = 60000;
exports.ratio = 1.2;

exports.xrpIssuer = "rrrrrrrrrrrrrrrrrrrrrhoLvTp";


//websocket port map (server)
//3003 web-socket-polling-monitor
//3004 listen-account-util
//3005 offer-service
//3006 first-order-polling-monitor
//3007 web-socket-tri-polling-monitor