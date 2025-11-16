// src/app/pages/movimentacoes/lista-movimentacao/lista-movimentacao.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';

import { MovimentacoesService } from '../../../core/services/movimentacoes.service';
import { Movimentacao, TipoMovimentacao } from '../../../core/models/movimentacao.model';
import { AlertService } from '../../../core/alert/alert.service';

@Component({
  selector: 'app-lista-movimentacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    CalendarModule,
    DropdownModule
  ],
  templateUrl: './lista-movimentacao.component.html',
  styleUrls: ['./lista-movimentacao.component.scss']
})
export class ListaMovimentacaoComponent implements OnInit {

  private movApi = inject(MovimentacoesService);
  private alert = inject(AlertService);

  movimentacoes: Movimentacao[] = [];
  loading = false;

  dataInicio: Date | null = null;
  dataFim: Date | null = null;

  // filtro por tipo
  filtroTipo?: TipoMovimentacao;

  tiposMovimentacaoFiltro = [
    { label: 'Todos os tipos', value: undefined },
    { label: 'Entrada em estoque', value: 'ENTRADA' as TipoMovimentacao },
    { label: 'Saída de estoque', value: 'SAIDA' as TipoMovimentacao },
    { label: 'Ajuste de estoque', value: 'AJUSTE' as TipoMovimentacao }
  ];

  ngOnInit(): void {
    // usuário decide quando buscar
  }

  carregar(): void {
    this.loading = true;

    // sem período → busca geral
    if (!this.dataInicio && !this.dataFim) {
      this.movApi.findAll().subscribe({
        next: (lista: Movimentacao[]) => {
          this.movimentacoes = this.aplicarFiltroTipo(lista);
          this.loading = false;
        },
        error: (err: any) => {
          this.loading = false;
          this.alert.error('Erro', err?.message ?? 'Erro ao buscar movimentações.');
        }
      });
      return;
    }

    // período incompleto
    if (!this.dataInicio || !this.dataFim) {
      this.loading = false;
      this.alert.warn(
        'Período incompleto',
        'Informe as duas datas (início e fim) para filtrar por período.'
      );
      return;
    }

    const inicio = this.formatInicio(this.dataInicio);
    const fim = this.formatFim(this.dataFim);

    this.movApi.findByPeriodo(inicio, fim).subscribe({
      next: (lista: Movimentacao[]) => {
        this.movimentacoes = this.aplicarFiltroTipo(lista);
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.alert.error('Erro', err?.message ?? 'Erro ao buscar movimentações por período.');
      }
    });
  }

  private aplicarFiltroTipo(lista: Movimentacao[]): Movimentacao[] {
    if (!this.filtroTipo) {
      return lista;
    }
    return lista.filter(m => m.tipo === this.filtroTipo);
  }

  limparFiltros(): void {
    this.dataInicio = null;
    this.dataFim = null;
    this.filtroTipo = undefined;
    this.movimentacoes = [];
  }

  private formatInicio(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T00:00:00`;
  }

  private formatFim(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T23:59:59`;
  }
}
