var WebSocket = require('ws');
var _ = require('underscore');
var tfmjs = require('./the-future-manager.js');

function WSBookUtil() {
    this.ws;
    this.timer;
    this.wsConnected;
}

WSBookUtil.prototype.connect = function(callback) {
    var self = this;
    var ws = self.ws;

    tfmjs.getEnv(function(result) {
        ws = new WebSocket(result.wspm);
        ws.on('open', function() {
            self.wsConnected = true;
            self.ws = ws;
            if (callback) {
                callback();
            }
        });

        ws.on('close', function() {
            self.wsConnected = false;
            ws.close();
            self.connect();
        });
    })
};

WSBookUtil.prototype.exeCmd = function(cmd, callback) {
    var self = this;
    if (self.timer) {
        clearTimeout(self.timer);
    }

    var wsConnected = self.wsConnected;

    if (wsConnected) {
        self.exe(cmd, callback);
    } else {
        self.connect(function() {
            self.exe(cmd, callback);
        });
    }
};


WSBookUtil.prototype.exe = function(cmd, callback) {
    var self = this;
    var ws = this.ws;

    ws.once('message', function(data, flags) {
        if (self.timer) {
            clearTimeout(self.timer);
        }

        var books = JSON.parse(data);
        var orders = _.flatten(books);
        console.log("message received!! order number is", orders.length);

        callback(orders);
    });

    console.log("send request!!");

    ws.send(JSON.stringify(cmd));

    self.timer = setTimeout(function() {
        ws.removeAllListeners('message');
        self.exeCmd(cmd, callback);
    }, 3000);
}

exports.WSBookUtil = WSBookUtil;


// var wsbu = new WSBookUtil();
// wsbu.exeCmd({
//     "cmd": "book",
//     "params": {
//         "CNY": ["rKiCet8SdvWxPXnAgYarFUXMh1zCPz432Y"],
//         "USD": ["rMwjYedjc7qqtKYVLiAccJSmCwih4LnE2q"]
//     },
//     "limit": 1,
//     "filter": 0,
//     "cache": 1
// }, function(orders) {
//     console.log(orders);
// })