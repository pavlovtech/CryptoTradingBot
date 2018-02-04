let ccxt = require('ccxt');
let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
let cors = require('cors');

let app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ exdended: false }));

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

app.get('/markets', async (req, res) => {
    res.json(markets);
});

app.get('/currency-pairs', async (req, res) => {
    var keys = Object.keys(markets)
    res.json(keys);
});

app.get('/order-books/:currency_pair', async (req, res) => {
    let pair = req.params.currency_pair.replace('_', '/').toUpperCase();
    let orderBooks = await yobitClient.fetchOrderBook(pair);
    res.json(orderBooks);
});

// personal orders
app.get('/orders/:currency_pair', async (req, res) => {
    let pair = req.params.currency_pair.replace('_', '/').toUpperCase();
    let orders = await yobitClient.fetchOrders(pair);
    res.json(orders);
});

// personal open orders
app.get('/open-orders/:currency_pair', async (req, res) => {
    let pair = req.params.currency_pair.replace('_', '/').toUpperCase();
    let orders = await yobitClient.fetchOpenOrders(pair);
    res.json(orders);
});

app.post('/orders-cancellation', async (req, res) => {
    let pair = req.body.currencyPair;//.replace('_', '/').toUpperCase();
    let orders = await yobitClient.fetchOpenOrders(pair);

    orders.forEach(async element => {
        await yobitClient.cancelOrder(element.id);
    });
});

app.get('/ticker/:currency_pair', async (req, res) => {
    let pair = req.params.currency_pair.replace('_', '/').toUpperCase();
    let ticker = await yobitClient.fetchTicker(pair);

    res.json(ticker);
});

app.get('/trades/:currency_pair', async (req, res) => {
    let pair = req.params.currency_pair.replace('_', '/').toUpperCase();
    let ticker = await yobitClient.fetchTrades(pair);

    res.json(ticker);
});

app.get('/balances', asyncMiddleware(async (req, res) => {
    let balances = await yobitClient.fetchBalance();
    res.json(balances);
}));

app.post('/commands/buy-and-sell', asyncMiddleware(async (req, res) => {
    // TODO: check selling or buying order should be specified

    let buyAtPercentIncrease = parseFloat(req.body.buyAtPercentIncrease);
    let amount = parseFloat(req.body.amount);
    let sellAtPercentIncrease = parseFloat(req.body.sellAtPercentIncrease);
    let currencyPair = req.body.currencyPair;//.replace('_', '/').toUpperCase();;

    let ticker = await yobitClient.fetchTicker(currencyPair);
    let buyPrice = ((100 + buyAtPercentIncrease) * ticker.last) / 100;
    let orderBooks = await yobitClient.fetchOrderBook(currencyPair);

    let fittingSellingOrders =
        orderBooks.asks
            .filter(buyingOrder => buyingOrder[0] <= buyPrice && buyingOrder[1] >= amount)
            .map(buyingOrder => buyingOrder[0]);

    let cheapestOrderPrice = Math.min(...fittingSellingOrders);

    console.log(`Buying... price: ${cheapestOrderPrice}`);
    let buyResult;
    if(cheapestOrderPrice) {
        buyResult = await yobitClient.createOrder(currencyPair, 'limit', 'buy', amount, cheapestOrderPrice);
    } else {
        throw new Error(`No selling orders with for price ${ buyPrice } and amount ${amount}`);
    }

    console.log(buyResult);

    await sleep(1000);

    let sellAmount = parseFloat(buyResult.return.received);

    console.log(`Selling... price: ${sellPrice}`);
    let sellPrice = ((100 + sellAtPercentIncrease) * ticker.last) / 100;

    let sellResult = await yobitClient.createOrder(currencyPair, 'limit', 'sell', sellAmount, sellPrice);

    console.log(sellResult);

    res.json(sellResult.funds);
}));

app.use(function (err, req, res, next) {
    console.error(err);
    console.error(err.statusCode);

    if (err.statusCode == 500) {
        res.status(500).send(err);
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
