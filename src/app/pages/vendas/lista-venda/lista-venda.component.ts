import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { DatePickerModule } from 'primeng/datepicker';

import { VendasService } from '../../../core/services/vendas.service';
import { UsuariosService } from '../../../core/services/usuarios.service';

import { Venda } from '../../../core/models/venda.model';
import { Usuario } from '../../../core/models/usuario.model';

import { AlertService } from '../../../core/alert/alert.service';
import { CurrencyBrPipe } from '../../../shared/pipes/currency-br.pipe';

@Component({
  selector: 'app-lista-venda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    TableModule,
    ButtonModule,
    DropdownModule,
    DatePickerModule,
    CurrencyBrPipe
  ],
  templateUrl: './lista-venda.component.html',
  styleUrls: ['./lista-venda.component.scss']
})
export class ListaVendaComponent implements OnInit {

  private vendasApi = inject(VendasService);
  private usuariosApi = inject(UsuariosService);
  private alert = inject(AlertService);

  vendas: Venda[] = [];
  usuarios: Usuario[] = [];

  filtroUsuarioId?: number;
  filtroInicio: Date | null = null;
  filtroFim: Date | null = null;

  loading = false;
  totalPeriodo = 0;

  ngOnInit(): void {
    this.carregarUsuarios();
    // deixa o usuário escolher quando buscar
  }

  private carregarUsuarios(): void {
    this.usuariosApi.findAll().subscribe({
      next: (lista) => (this.usuarios = lista),
      error: () =>
        this.alert.error('Erro', 'Não foi possível carregar os usuários.')
    });
  }

  private toLocalDateTimeString(d: Date, time: string): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}T${time}`;
  }

  buscar(): void {
    this.loading = true;

    // 1) Se tiver período, usa endpoint /periodo e filtra usuário no front (se houver)
    if (this.filtroInicio && this.filtroFim) {
      const inicioStr = this.toLocalDateTimeString(this.filtroInicio, '00:00:00');
      const fimStr = this.toLocalDateTimeString(this.filtroFim, '23:59:59');

      this.vendasApi.findByPeriodo(inicioStr, fimStr).subscribe({
        next: (lista) => {
          let resultado = lista;
          if (this.filtroUsuarioId) {
            resultado = resultado.filter(v => v.usuario?.id === this.filtroUsuarioId);
          }
          this.atualizarLista(resultado);
        },
        error: (err) => {
          this.loading = false;
          this.alert.error('Erro', err?.message ?? 'Erro ao buscar vendas por período.');
        }
      });
      return;
    }

    // 2) Se só tiver usuário
    if (this.filtroUsuarioId) {
      this.vendasApi.findByUsuario(this.filtroUsuarioId).subscribe({
        next: (lista) => this.atualizarLista(lista),
        error: (err) => {
          this.loading = false;
          this.alert.error('Erro', err?.message ?? 'Erro ao buscar vendas por usuário.');
        }
      });
      return;
    }

    // 3) Sem filtros → lista todas
    this.vendasApi.findAll().subscribe({
      next: (lista) => this.atualizarLista(lista),
      error: (err) => {
        this.loading = false;
        this.alert.error('Erro', err?.message ?? 'Erro ao buscar vendas.');
      }
    });
  }

  private atualizarLista(lista: Venda[]): void {
    this.vendas = lista ?? [];
    this.totalPeriodo = this.vendas.reduce(
      (acc, v) => acc + (v.valorTotal ?? 0),
      0
    );
    this.loading = false;
  }

  async excluir(id: number | undefined): Promise<void> {
    if (!id) return;

    const confirm = await this.alert.confirm(
      'Excluir venda?',
      'Essa ação não poderá ser desfeita.'
    );

    if (!confirm.isConfirmed) {
      return;
    }

    this.vendasApi.delete(id).subscribe({
      next: () => {
        this.alert.success('Sucesso', 'Venda excluída com sucesso.');
        this.buscar();
      },
      error: (err) =>
        this.alert.error('Erro', err?.message ?? 'Erro ao excluir venda.')
    });
  }

  qtdItens(v: Venda): number {
    return v.itens?.length ?? 0;
  }
}