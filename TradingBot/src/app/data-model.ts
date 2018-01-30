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

export interface Balance {
    free: number;
    used: number;
    total: number;
}

export interface Balances {
    info: any;
    [key: string]: Balance;
}
