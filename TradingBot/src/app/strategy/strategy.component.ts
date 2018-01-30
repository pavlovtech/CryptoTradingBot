import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-strategy',
  templateUrl: './strategy.component.html',
  styleUrls: ['./strategy.component.css']
})
export class StrategyComponent implements OnInit {

  strategyForm: FormGroup;

  ngOnInit() {
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
