export class TradingStrategy {
    constructor(
        public buyAtPercentIncrease: number = 0,
        public amount: number = 0,
        public sellAtPercentIncrease: number = 0) {
    }
}
