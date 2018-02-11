export class Order {
    id: string;
    timestamp: number;
    datetime: string;
    status: 'open' | 'closed' | 'canceled';
    symbol: string;
    type: 'market' | 'limit';
    side: 'buy' | 'sell';
    price: number;
    cost: number;
    amount: number;
    filled: number;
    remaining: number;
    fee: number;
}

export class Balance {
    free: number;
    used: number;
    total: number;
}

export class Balances {
    info: any;
    [key: string]: Balance;
}

export class BuyAndSellRequest {
    buyAtPercentIncrease: number;
    amount: number;
    sellAtPercentIncrease: number;
    currencyPair: string;
}

export class Ticker {
    ask: number;
    average?: number;
    baseVolume?: number;
    bid: number;
    change?: number;
    close?: number;
    datetime: string;
    first?: number;
    high: number;
    info: object;
    last?: number;
    low: number;
    open?: number;
    percentage?: number;
    quoteVolume?: number;
    symbol: string;
    timestamp: number;
    vwap?: number;
}
