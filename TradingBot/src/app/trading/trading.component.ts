import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { startWith, map, debounceTime, tap, catchError } from 'rxjs/operators';
import { ExchangeService } from '../shared/exchange.service';
import { Order, BuyAndSellRequest, Balance, Balances } from '../data-model';
import { TradingStrategy } from '../strategy/trading-strategy.model';
import { MatSnackBar } from '@angular/material';
import { errorHandler } from '@angular/platform-browser/src/browser';
import 'rxjs/add/observable/empty';
import { StrategyComponent } from '../strategy/strategy.component';

@Component({
  selector: 'app-trading',
  templateUrl: './trading.component.html',
  styleUrls: ['./trading.component.css']
})
export class TradingComponent implements OnInit {

  @ViewChild(StrategyComponent)
  private strategyComponent: StrategyComponent;

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

    this.exchangeService.cancelOrders(this.currencyPair.value).subscribe(() => {
      this.refreshOrders();
    });
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

  updateBalance(balances: Balances) {
    const mainCryptocurrency = this.currencyPair.value.split('/')[1];

    let balance =  0;

    if (balances[mainCryptocurrency]) {
      balance = balances[mainCryptocurrency].free;
    }

    this.currentBalance = `${balance.toString()} ${mainCryptocurrency}`;
  }

  onStrategyChanged(strategy: TradingStrategy) {
    this.tradingStrategy = strategy;
  }

  filter(val: string): string[] {
    return this.currencyPairs.filter(option => option.includes(val.toUpperCase())).slice(0, 500);
  }

  updateVolume() {
    this.strategyComponent.strategyForm.get('volume').setValue(this.maxAmountToBuy);
  }

  ngOnInit() {
    this.exchangeService.getCurrencyPairs().subscribe((marketExchanges) => {
      this.currencyPairs = marketExchanges;
      this.currencyPair.setValue('');
    });

    this.filteredOptions = this.currencyPair.valueChanges
      .pipe(
        tap(val => {
          if (!this.currencyPairs.includes(val)) {
            return;
          }

          this.exchangeService.getBalances().subscribe(balances => {
            this.updateBalance(balances);

            this.exchangeService.getTicker(val.replace('/', '_')).subscribe(t => {
                const mainCryptocurrency = val.split('/')[1];

                this.maxAmountToBuy = balances[mainCryptocurrency].free / t.average;
            },
            errorResponse => {
              this.snackBar.open(errorResponse.error, 'Error');
              this.refreshOrders();
            });

            this.refreshOrders();
          },
          errorResponse => {
            this.snackBar.open(errorResponse.error, 'Error');
            this.refreshOrders();
          });
        }),
        map(val => this.filter(val),
      ));
  }
}
