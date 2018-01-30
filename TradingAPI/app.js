let ccxt = require('ccxt');
let express = require('express');
let bodyParser = require('body-parser');
let path = require('path');
var cors = require('cors');

let app = express();

app.use(cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({exdended: false}));

const yobitClient = new ccxt.yobit({
    apiKey: 'FDE6120BA3AB897F517D3651FC98DF29',
    secret: '1e8a385fe5ede0891f607109978d9f82',
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

app.post('/orders-cancellation/:currency_pair', async (req, res) => {
    let pair = req.params.currency_pair.replace('_', '/').toUpperCase();
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

app.get('/balances', async (req, res) => {
    let balances = await yobitClient.fetchBalance();
    res.json(balances);
});

app.post('commands/buy-and-sell', async (req, res) => {
    let buyAtPercentIncrease = req.params.buyAt;
    let amount = req.params.amount;
    let sellAtPercentIncrease = req.params.sellAt;
    let currencyPair = req.params.currencyPair.replace('_', '/').toUpperCase();;

    let ticker = await yobitClient.fetchTicker(currencyPair);
    let buyPrice = (1.0 + buyAtPercentIncrease) * ticker.last;
    let orderBooks = await yobitClient.fetchOrderBook(pair);
    let fittingSellingOrders = orderBooks.asks.map(buyingOrder => buyingOrder[0]).filter(ask => ask <= buyPrice && ask >= amount);
    let cheapestOrderPrice = Math.min(...fittingOrders);
    console.log(`Buying... price: ${cheapestOrderPrice}`);
    let buyResult = await yobitClient.createOrder(currencyPair, 'limit', 'buy', amount, cheapestOrderPrice);
    console.log(buyResult);

    console.log(`Selling... price: ${sellPrice}`);
    let sellPrice = (1.0 + sellAtPercentIncrease) * ticker.last;
    let sellResult = await yobitClient.createOrder(currencyPair, 'limit', 'sell', amount, sellPrice);

    console.log(sellResult);
});

// app.get('/currency-pairs/lookup/:q', async (req, res) => {
//     let markets = await yobitClient.loadMarkets();

//     let param = req.params.q.toUpperCase();

//     var keys = Object.keys(markets).filter((m) => m.includes(param))

//     res.json(keys);
// });

// app.get('/currency-pairs/lookup', async (req, res) => {
//     res.json([]);
// });

app.listen(3000, () => {
    console.log('Server started...');
});
