import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { startWith, map, debounceTime, tap, catchError } from 'rxjs/operators';
import { ExchangeService } from '../shared/exchange.service';
import { Order, BuyAndSellRequest } from '../data-model';
import { TradingStrategy } from '../strategy/trading-strategy.model';
import { MatSnackBar } from '@angular/material';
import { errorHandler } from '@angular/platform-browser/src/browser';
import 'rxjs/add/observable/empty';

@Component({
  selector: 'app-trading',
  templateUrl: './trading.component.html',
  styleUrls: ['./trading.component.css']
})
export class TradingComponent implements OnInit {

  title = 'Pump and dump trading bot';

  tradingStrategy: TradingStrategy;

  currencyPair: FormControl = new FormControl();

  currentBalance = '';
  maxAmountToBuy = 0;

  currencyPairs: string[] = [];
  filteredOptions: Observable<string[]>;

  orders: Order[] = [];

  constructor(
    private exchangeService: ExchangeService,
    private snackBar: MatSnackBar) {
  }

  cancelOrders() {
    if (!this.currencyPair.value) { return; }

    this.exchangeService.cancelOrders(this.currencyPair.value)
    .pipe(
      catchError(errorResponse => {
        this.snackBar.open(errorResponse.error, 'Error');
        this.refreshOrders();
        return Observable.empty();
      })
    );
  }

  trade() {
    if (!this.currencyPair.value) { return; }

    const request = new BuyAndSellRequest();
    request.amount = this.tradingStrategy.amount;
    request.buyAtPercentIncrease = this.tradingStrategy.buyAtPercentIncrease;
    request.sellAtPercentIncrease = this.tradingStrategy.sellAtPercentIncrease;

    request.currencyPair = this.currencyPair.value;

    this.exchangeService.buyAndSell(request).subscribe(response => {
      this.snackBar.open(response, 'Balance');
      this.refreshOrders();
    },
      errorResponse => {
        this.snackBar.open(errorResponse.error, 'Error');
        this.refreshOrders();
      });
  }

  refreshOrders() {
    if (!this.currencyPair.value) { return; }

    this.exchangeService.getOrders(this.currencyPair.value.replace('/', '_')).subscribe(result => {
      this.orders = result;
    });
  }

  updateBalance() {
    this.exchangeService.getBalances().subscribe(response => {

      const mainCryptocurrency = this.currencyPair.value.split('/')[0];

      let balance =  0;

      if (response[mainCryptocurrency]) {
        balance = response[mainCryptocurrency].total;
      }

      this.currentBalance = `${balance.toString()} ${mainCryptocurrency}`;
    },
    errorResponse => {
      this.snackBar.open(errorResponse.error, 'Error');
      this.refreshOrders();
    });
  }

  onStrategyChanged(strategy: TradingStrategy) {
    this.tradingStrategy = strategy;
  }

  filter(val: string): string[] {
    return this.currencyPairs.filter(option => option.includes(val.toUpperCase())).slice(0, 500);
  }

  ngOnInit() {
    this.exchangeService.getCurrencyPairs().subscribe((marketExchanges) => {
      this.currencyPairs = marketExchanges;
      this.currencyPair.setValue('');
    });

    this.filteredOptions = this.currencyPair.valueChanges
      .pipe(
        tap(val => {
          this.updateBalance();
        }),
        map(val => this.filter(val),
      ));
  }
}
