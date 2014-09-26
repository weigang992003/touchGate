var series_pays_gets = {name:'Trade times ',data:[{name:'XRP/CNY',y:10}, {name:'XRP/USD',y:207},{name:'CNY/CNY',y:107},{name:'CNY/STR',y:127}]}
var series_gets_pays = {name:'Trade times ',data:[{name:'CNY/XRP',y:100}, {name:'USD/XRP',y:247},{name:'CNY/CNY',y:207},{name:'STR/CNY',y:17}]}
var currency_categories = ['CNY/XRP', 'USD/XRP', 'CNY/CNY', 'STR/CNY']


function showResult(container) {
    container.highcharts({
        chart: {
            type: 'bar'
        },
        title: {
            text: 'History of trade times'
        },
        subtitle: {
            text: 'Currency pair'
        },
        xAxis: {
            categories: currency_categories,
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Really trade (times)',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            //valueSuffix: ' times'
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        legend: {
            layout: 'vertical',
            align: 'buttom',
            x: -40,
            y: 100,
            floating: true,
            borderWidth: 1,
            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
            shadow: true
        },
        credits: {
            enabled: false
        },
        series: [series_pays_gets,series_gets_pays]
    });
}

function startDraw(container) {
    showResult(container);
}

function showResultByCondition(container, seriesPays, seriesGets, issuers) {
    container.highcharts({
        chart: {
            type: 'bar'
        },
        title: {
            text: 'History of trade total'
        },
        subtitle: {
            text: 'Base currency is ' + seriesPays['data'][0]['name'].split('/')[0]
        },
        xAxis: {
            categories: issuers,
            title: {
                text: null
            }
        },
        yAxis: {
            min: 0,
            title: {
                text: 'Really trade (total)',
                align: 'high'
            },
            labels: {
                overflow: 'justify'
            }
        },
        tooltip: {
            //valueSuffix: ' times'
        },
        plotOptions: {
            bar: {
                dataLabels: {
                    enabled: true
                }
            }
        },
        legend: {
            layout: 'vertical',
            align: 'buttom',
            x: -40,
            y: 100,
            floating: true,
            borderWidth: 1,
            backgroundColor: ((Highcharts.theme && Highcharts.theme.legendBackgroundColor) || '#FFFFFF'),
            shadow: true
        },
        credits: {
            enabled: false
        },
        series: [seriesPays,seriesGets]
    });
}