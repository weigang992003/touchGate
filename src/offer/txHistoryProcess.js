var txHistory = require('./accountInfoDb');
var math = require('mathjs');

// get the tx history data which format for html table show
// item = {paysCurrency,paysValue,paysPrice,getsCurrency,getsValue,getsPrice,profitRate, profit}
function getTableData(callback) {
    var ret = [];
    txHistory.getAllTxHistoryData(function(result) {
        for (var i = result.length - 1; i >= 0; i--) {
            var item = {};
            var tail = result.pop();
            item['paysCurrencyA'] = tail['i_pays_currency'];
            item['paysValueA'] = tail['i_pays_value'];
            item['getsCurrencyA'] = tail['i_gets_currency'];
            item['getsValueA'] = tail['i_gets_value'];
            item['priceA'] = tail['price'];
            if (item['paysCurrencyA'] === item['getsCurrencyA']) {
                item['profitRate'] = item['priceA'];
                item['priceB'] = 1;
                item['paysInc'] = 0;
                item['getsValueB'] = item['getsValueA'];
                item['profitRate'] = 1;
                item['profit'] = item['getsValueA'] - item['paysValueA'];
                ret.push(item);
                continue;
            }

            for (var j = result.length - 1; j >= 0; j--) {
                if (item['paysCurrencyA'] === result[j]['i_gets_currency']
                        && item['getsCurrencyA'] === result[j]['i_pays_currency']) {
                    item['paysCurrencyB'] = result[j]['i_pays_currency'];
                    item['paysValueB'] = result[j]['i_pays_value'];
                    item['getsCurrencyB'] = result[j]['i_gets_currency'];
                    item['getsValueB'] = result[j]['i_gets_value'];
                    item['priceB'] = result[j]['price'];
                    item['profitRate'] = item['priceA'] * item['priceB'];
                    calculateRate = (item['priceA'] * item['priceB'] - 1) / item['priceB'];
                    item['profit'] = calculateRate * math.min(item['getsValueA'], item['paysValueB']);
                    item['paysInc'] = item['getsValueA'] - item['paysValueB'];
                    ret.push(item);
                    break;
                }
            }
        }
        callback(ret);
    });
}

exports.getTableData = getTableData;
//getTableData(function(result) {});
