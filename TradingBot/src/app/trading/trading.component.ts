import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs/Observable';
import { startWith, map, debounceTime } from 'rxjs/operators';
import { ExchangeService } from '../shared/exchange.service';
import { Order } from '../data-model';

@Component({
  selector: 'app-trading',
  templateUrl: './trading.component.html',
  styleUrls: ['./trading.component.css']
})
export class TradingComponent implements OnInit {

  title = 'Pump and dump trading bot';

  currencyPair: FormControl = new FormControl();

  currencyPairs: string[] = [];
  filteredOptions: Observable<string[]>;

  orders: Order[] = [];

  constructor(private exchangeService: ExchangeService) {
  }

  cancelOrders() {
    if (!this.currencyPair.value) { return; }

    this.exchangeService.cancelOrders(this.currencyPair.value.replace('/', '_'));
  }

  refreshOrders() {
    if (!this.currencyPair.value) { return; }

    this.exchangeService.getOrders(this.currencyPair.value).subscribe(result => {
      this.orders = result;
    });
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
        map(val => this.filter(val)
      ));
  }
}
