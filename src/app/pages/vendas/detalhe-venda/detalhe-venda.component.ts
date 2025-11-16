import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';

import { VendasService } from '../../../core/services/vendas.service';

@Component({
  selector: 'app-detalhe-venda',
  standalone: true,
  imports: [CommonModule, TableModule, CardModule, ButtonModule],
  templateUrl: './detalhe-venda.component.html',
  styleUrls: ['./detalhe-venda.component.scss'],
})
export class DetalheVendaComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private vendasApi = inject(VendasService);

  venda: any;
  carregando = true;
  erro = false;

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/vendas']);
      return;
    }

    this.vendasApi.findById(id).subscribe({
      next: (venda) => {
        this.venda = venda;
        this.carregando = false;
      },
      error: () => {
        this.erro = true;
        this.carregando = false;
      },
    });
  }

  voltar(): void {
    this.router.navigate(['/vendas']);
  }
}
