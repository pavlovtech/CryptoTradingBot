let ccxt = require('ccxt');
let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let cors = require('cors');

let app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    exdended: false
}));

const asyncMiddleware = fn =>
    (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next);
    };

const yobitClient = new ccxt.yobit({
    apiKey: 'FDE6120BA3AB897F517D3651FC98DF29',
    secret: '1e8a385fe5ede0891f607109978d9f82'
});


let markets = [];

yobitClient.loadMarkets().then((availableMarkets) => {
    markets = availableMarkets;
});

app.get('/markets',  asyncMiddleware(async (req, res) => {
    res.json(markets);
}));

app.get('/currency-pairs', asyncMiddleware(async (req, res) => {
    var keys = Object.keys(markets)
    res.json(keys);
}));

app.get('/order-books/:currency_pair', asyncMiddleware(async (req, res) => {
    let pair = req.params.currency_pair.replace('_', '/').toUpperCase();
    let orderBooks = await yobitClient.fetchOrderBook(pair);
    res.json(orderBooks);
}));

// personal orders
app.get('/orders/:currency_pair', asyncMiddleware(async (req, res) => {
    let pair = req.params.currency_pair.replace('_', '/').toUpperCase();
    let orders = await yobitClient.fetchOpenOrders(pair);
    res.json(orders);
}));

// personal open orders
app.get('/open-orders/:currency_pair', asyncMiddleware(async (req, res) => {
    let pair = req.params.currency_pair.replace('_', '/').toUpperCase();
    let orders = await yobitClient.fetchOpenOrders(pair);
    res.json(orders);
}));

app.post('/orders-cancellation', asyncMiddleware(async (req, res) => {
    let pair = req.body.currencyPair; //.replace('_', '/').toUpperCase();
    let orders = await yobitClient.fetchOpenOrders(pair);

    let responses = [];
    orders.forEach(async element => {
        responses += await yobitClient.cancelOrder(element.id);
    });

    res.json(responses);
}));

app.get('/ticker/:currency_pair',  asyncMiddleware(async (req, res) => {
    let pair = req.params.currency_pair.replace('_', '/').toUpperCase();
    let ticker = await yobitClient.fetchTicker(pair);

    res.json(ticker);
}));

app.get('/trades/:currency_pair', asyncMiddleware(async (req, res) => {
    let pair = req.params.currency_pair.replace('_', '/').toUpperCase();
    let ticker = await yobitClient.fetchTrades(pair);

    res.json(ticker);
}));

app.get('/balances', asyncMiddleware(async (req, res) => {
    let balances = await yobitClient.fetchBalance();
    res.json(balances);
}));

app.post('/commands/buy-and-sell', asyncMiddleware(async (req, res) => {
    let buyAtPercentIncrease = parseFloat(req.body.buyAtPercentIncrease);
    let amount = parseFloat(req.body.amount);
    let sellAtPercentIncrease = parseFloat(req.body.sellAtPercentIncrease);
    let currencyPair = req.body.currencyPair; //.replace('_', '/').toUpperCase();;

    let ticker = await yobitClient.fetchTicker(currencyPair);
    let buyPrice = ((100 + buyAtPercentIncrease) * ticker.ask) / 100;

    let orderBooks = await yobitClient.fetchOrderBook(currencyPair);

    let fittingSellingOrders =
        orderBooks.asks
        .filter(sellingOrder => sellingOrder[0] <= buyPrice && sellingOrder[1] >= amount)
        .map(sellingOrder => sellingOrder[0]);

    if (fittingSellingOrders.length == 0) {
        res.status(500).send(`No selling orders for price ${ buyPrice } and amount ${amount}`);
    }

    let cheapestOrderPrice = Math.min(...fittingSellingOrders);

    console.log(`Buying... price: ${cheapestOrderPrice}`);
    let buyResult = await yobitClient.createOrder(currencyPair, 'limit', 'buy', amount, cheapestOrderPrice);
    console.log(buyResult);

    while (true) {
        try {
            order = await yobitClient.fetchOrder(buyResult.id);
            if (order.remaining == 0) break;
        } catch (err) {
            console.log(err);
        }

        await sleep(1000);
    }

    let sellAmount = order.amount;
    let sellPrice = ((100 + sellAtPercentIncrease) * ticker.last) / 100;

    console.log(`Selling... price: ${sellPrice}`);

    let sellResult;
    while (true) {
        try {
            sellResult = await yobitClient.createOrder(currencyPair, 'limit', 'sell', sellAmount, sellPrice);
            break;
        } catch (err) {
            console.log(err);
        }

        await sleep(1000);
    }

    console.log(sellResult);
    res.json(sellResult.funds);
}));

app.use(function (err, req, res, next) {
    console.error(err);

    if (err.statusCode) {
        console.error(err.statusCode);

        if (err.statusCode == 500) {
            res.status(500).send(err);
        }
    }

    let rawStr = err.message;
    let jsonParsed = rawStr.substring(rawStr.indexOf('{'), rawStr.indexOf('}') + 1);
    let message = JSON.parse(jsonParsed);
    res.status(500).send(message.error);
});


function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

app.listen(3000, () => {
    console.log('Server started...');
});