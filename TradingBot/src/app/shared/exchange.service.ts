import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Order, Balances } from '../data-model';

@Injectable()
export class ExchangeService {
  host = 'http://localhost:3000';

  constructor(private http: HttpClient) { }

  getCurrencyPairs(): Observable<string[]> {
    return this.http.get<string[]>(`${this.host}/currency-pairs`);
  }

  cancelOrders(currencyPair: string) {
    return this.http.post(`${this.host}/orders-cancellation/${currencyPair}`, '');
  }

  getOrders(currencyPair: string): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.host}/orders/${currencyPair}`);
  }

  getBalances(): Observable<Balances> {
    return this.http.get<Balances>(`${this.host}/balances`);
  }
}
