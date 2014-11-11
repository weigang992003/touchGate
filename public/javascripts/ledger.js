var wsUri = 'wss://s1.ripple.com/';
var websocket;
var wsCmdLedger;
var ledgerStatus = document.getElementById('ledgerStatus');
var ledgerIndex = document.getElementById('ledgerIndex');
var currentIndex = 9000000;

function writeResultStatus(status) {
    ledgerStatus.innerHTML = status;
}

function makeLedgerCmd(index) {}

function sendLedgerRequest(index) {
    CustomSpinner.play();
    if (websocket === null) {
        startWebSocket();
        return;
    }
    wsCmdLedger = JSON.stringify({
        id: 1,
        command: 'ledger',
        ledger_index: index,
        expand: true,
        transactions: true
    });
    websocket.send(wsCmdLedger);
}

function createTable(data) {
    $('#offerTable').remove();
    $('#offersDiv').append("<table id='offerTable' class='reference'><tr><th>OfferData</th><th>Offer Traded Data</th><th>Account</th><th>TransactionType</th><th>Quality</th></tr>");
    for (var i = data.length - 1; i >= 0; i--) {
        $('#offerTable').append(data[i]);
    };
}

function startWebSocket() {
    if (websocket) websocket.close();
    websocket = new WebSocket(wsUri);
    websocket.onopen = function(result) {
        onOpen(result);
    };
    websocket.onclose = function(result) {
        onClose(result);
    };
    websocket.onmessage = function(result) {
        onMessage(result);
    };
    websocket.onerror = function(result) {
        onError(result);
    };
}

function onOpen(result) {
    sendLedgerRequest(currentIndex);
}

function onError(result) {
    console.log(result.data);
    websocket.close();
    websocket = null;
}

function onClose(result) {
    console.log(result.data);
    websocket = null;
}

function onMessage(result) {
    CustomSpinner.stop();
    //    console.log(result.data);
    var data = JSON.parse(result.data);
    if (data.id === undefined) {
        writeResultStatus('Get ledger faild');
        return;
    }
    switch (data.id) {
        case 1:
            processLedger(data);
            break;
        default:
            processLedger(data);
    }
}

function processLedger(data) {
    console.log('on processLedger');
    console.log(data.result.ledger.transactions);
    var txs = data.result.ledger.transactions;
    var ret = [];
    txs.forEach(function(tx) {
        var item;
        if (tx.TransactionType === 'OfferCreate')
            item = processOfferCreateTx(tx);
        else if (tx.TransactionType === 'OfferCancel')
            item = processOfferCancelTx(tx);
        else if (tx.TransactionType === 'Payment')
            item = processPaymentTx(tx);
        else
            item = null;
        if (item)
            ret.push(item);
    });
    createTable(ret);
}

function processOfferCreateTx(tx) {
    if (tx.TakerGets === undefined)
        return null;
    return makeTableItem(tx.TakerGets, tx.TakerPays, tx.Account, 'OfferCreate');
}

function processOfferCancelTx(tx) {
    for (var i = tx.metaData.AffectedNodes.length - 1; i >= 0; i--) {
        var affNode = tx.metaData.AffectedNodes[i]
        var node = affNode.DeletedNode;

        if (!node || node.LedgerEntryType !== 'Offer') {
            continue;
        }

        if (!node.FinalFields || !node.FinalFields.TakerPays || !node.FinalFields.TakerGets) {
            continue;
        }

        return makeTableItem(node.FinalFields.TakerGets, node.FinalFields.TakerPays, tx.Account, tx.TransactionType);
    };
}

function processPaymentTx(tx) {
    return null;
}

function makeTableItem(takerGets, takerPays, account, txType) {
    var item = '<tr>';
    var currency = '';
    var value = '';
    var issuer = '';
    var getsValue = 0;
    var paysValue = 0;
    if (takerPays.currency === undefined) {
        currency += 'XRP -> ';
        value += takerPays / 1000000 + ' -> ';
        issuer += 'XRP -> ';
        paysValue = takerPays / 1000000;
    } else {
        currency += takerPays.currency + ' -> ';
        value += takerPays.value + ' -> ';
        issuer += getIssuerName(takerPays.issuer) + ' -> ';
        paysValue = takerPays.value;
    }
    if (takerGets.currency === undefined) {
        currency += 'XRP<br>';
        value += takerGets / 1000000 + '<br>';
        issuer += 'XRP<br>';
        getsValue = takerGets / 1000000;
    } else {
        currency += takerGets.currency + '<br>';
        value += takerGets.value + '<br>';
        issuer += getIssuerName(takerGets.issuer);
        getsValue = takerGets.value;
    }
    item += '<td>' + currency + value + issuer + '</td>';
    item += '<td></td>';
    item += '<td>' + account + '</td>';
    if (txType === 'OfferCancel')
        item += '<td bgcolor="#FF0000">' + txType + '</td>';
    else
        item += '<td>' + txType + '</td>';
    item += '<td>' + paysValue / getsValue + '</td>';
    item += '</tr>';

    return item;
}

function getReallyTradeValue(tx) {
    var payCurr,
        payIssuer,
        payAmnt,
        getCurr,
        getIssuer,
        getAmnt;

    tx.metaData.AffectedNodes.forEach(function(affNode) {
        var node = affNode.ModifiedNode || affNode.DeletedNode;

        if (!node || node.LedgerEntryType !== 'Offer') {
            return '<td></td>';
        }

        if (!node.PreviousFields || !node.PreviousFields.TakerPays || !node.PreviousFields.TakerGets) {
            return '<td></td>';
        }

        if (typeof node.PreviousFields.TakerPays === 'object') {
            payCurr = node.PreviousFields.TakerPays.currency;
            payAmnt = node.PreviousFields.TakerPays.value - node.FinalFields.TakerPays.value;
            payIssuer = getIssuerName(node.PreviousFields.TakerPays.issuer);
        } else {
            payCurr = 'XRP';
            payAmnt = (node.PreviousFields.TakerPays - node.FinalFields.TakerPays) / 1000000.0;
            payIssuer = 'XRP';
        }

        if (typeof node.PreviousFields.TakerGets === 'object') {
            getCurr = node.PreviousFields.TakerGets.currency;
            getAmnt = node.PreviousFields.TakerGets.value - node.FinalFields.TakerGets.value;
            getIssuer = getIssuerName(node.PreviousFields.TakerGets.issuer);
        } else {
            getCurr = 'XRP';
            getAmnt = (node.PreviousFields.TakerGets - node.FinalFields.TakerGets) / 1000000.0;
            getIssuer = 'XRP';
        }
        console.log('getReallyTradeValue begin');
        console.log('payCurr:' + payCurr + '/payIssuer:' + payIssuer + '/payAmnt:' + payAmnt + '/getCurr:' + getCurr + '/getIssuer:' + getIssuer + '/getAmnt:' + getAmnt);
        console.log('getReallyTradeValue end');
    });
}

function getIssuerName(issuer) {
    if (issuer === undefined)
        return 'XRP';
    return issuer;
}

function getResult() {
    currentIndex = parseInt(ledgerIndex.value);
    sendLedgerRequest(currentIndex);
    console.log(currentIndex);
}

startWebSocket();
