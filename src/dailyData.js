var tradeDataDb = require('./database-manager');

var constStartBaseTime = '2014-09-16';
var currencyPair = new Array();

exports.getTimeArray = function() {
    var beginTime = new Array();
    var endBaseTime = new Date();
    var startBaseTime = Date.parse(constStartBaseTime);
    var oneDateMSeconds = 24 * 60 * 60 * 1000;

    for (var i = startBaseTime; i <= endBaseTime; i += oneDateMSeconds) {
        t = new Date(i);
        humanTime = t.toISOString().split('T')[0];
        beginTime.push(humanTime);
    };
    return beginTime;
}

function convertSecondsToTime(seconds) {
    var date = new Date(seconds * 1000).toJSON();
    var result = date.split('T')[0];
    console.log(result);
}
