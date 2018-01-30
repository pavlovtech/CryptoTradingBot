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

export class Strategy {
    buyAtPercentIncrease: number;
    amount: number;
    sellAtPercentIncrease: number;
    currencyPair: string;
}
