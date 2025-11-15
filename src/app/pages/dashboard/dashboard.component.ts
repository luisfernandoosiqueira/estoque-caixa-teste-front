import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, CardModule, ButtonModule, DividerModule, ChartModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
})
export class DashboardComponent implements OnInit {
  chartData: any;
  chartOptions: any;

  ngOnInit(): void {
    this.configurarGrafico();
  }

  private configurarGrafico(): void {
    this.chartData = {
      labels: ['Produtos', 'Usuários', 'Vendas', 'Movimentações'],
      datasets: [
        {
          data: [120, 45, 78, 32],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#AB47BC'],
          hoverBackgroundColor: ['#64B5F6', '#81C784', '#FFB74D', '#BA68C8'],
        },
      ],
    };

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: '#495057',
          },
        },
      },
    };
  }
}
