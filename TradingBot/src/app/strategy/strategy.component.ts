import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TradingStrategy } from './trading-strategy.model';

@Component({
  selector: 'app-strategy',
  templateUrl: './strategy.component.html',
  styleUrls: ['./strategy.component.css']
})
export class StrategyComponent implements OnInit {
  @Output() strategyChanged = new EventEmitter<TradingStrategy>();
  strategy = new TradingStrategy();

  strategyForm: FormGroup;

  ngOnInit() {
    this.strategyForm.valueChanges
      .subscribe(value => {
        const strategy = new TradingStrategy(
          this.strategyForm.get('volume').value,
          this.strategyForm.get('buyAt').value,
          this.strategyForm.get('sellAt').value);
        this.strategyChanged.emit(strategy);
      });
  }

  constructor(private fb: FormBuilder) {
    this.createForm();
  }

  createForm() {
    this.strategyForm = this.fb.group({
      volume: '',
      buyAt: '',
      sellAt: ''
    });
  }
}
