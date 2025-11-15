// src/app/pages/movimentacoes/lista-movimentacao/lista-movimentacao.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CalendarModule } from 'primeng/calendar';

import { MovimentacoesService } from '../../../core/services/movimentacoes.service';
import { Movimentacao } from '../../../core/models/movimentacao.model';
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
    CalendarModule
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

  ngOnInit(): void {
    // usuário escolhe quando carregar
  }

  carregar(): void {
    this.loading = true;

    // sem período → busca geral
    if (!this.dataInicio && !this.dataFim) {
      this.movApi.findAll().subscribe({
        next: (lista: Movimentacao[]) => {
          this.movimentacoes = lista;
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
        this.movimentacoes = lista;
        this.loading = false;
      },
      error: (err: any) => {
        this.loading = false;
        this.alert.error('Erro', err?.message ?? 'Erro ao buscar movimentações por período.');
      }
    });
  }

  limparFiltros(): void {
    this.dataInicio = null;
    this.dataFim = null;
    this.movimentacoes = [];
  }

  async excluir(id: number | undefined): Promise<void> {
    if (!id) return;

    const confirm = await this.alert.confirm(
      'Excluir movimentação?',
      'Essa ação não poderá ser desfeita.'
    );

    if (!confirm.isConfirmed) return;

    this.movApi.delete(id).subscribe({
      next: () => {
        this.alert.success('Excluída', 'Movimentação removida com sucesso.');
        this.carregar();
      },
      error: (err: any) =>
        this.alert.error('Erro', err?.message ?? 'Erro ao excluir movimentação.')
    });
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