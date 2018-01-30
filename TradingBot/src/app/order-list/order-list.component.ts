import { Component, OnInit, Input } from '@angular/core';
import { MatTableDataSource } from '@angular/material';
import { Order } from '../data-model';

@Component({
  selector: 'app-order-list',
  templateUrl: './order-list.component.html',
  styleUrls: ['./order-list.component.css']
})
export class OrderListComponent implements OnInit {
  @Input() orders: Order[];

  displayedColumns = [
    'id',
    'datetime',
    'status',
    'symbol',
    'type',
    'side',
    'price',
    'cost',
    'amount',
    'filled',
    'remaining',
    'fee'
  ];

  dataSource = new MatTableDataSource<Order>(this.orders);

  constructor() { }

  ngOnInit() {
  }

}
