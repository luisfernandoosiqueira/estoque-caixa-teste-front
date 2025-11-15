import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

import { ProdutosService } from '../../../core/services/produtos.service';
import { Produto } from '../../../core/models/produto.model';
import { AlertService } from '../../../core/alert/alert.service';

@Component({
  selector: 'app-lista-produto',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule, ButtonModule, TableModule, InputTextModule, DropdownModule],
  templateUrl: './lista-produto.component.html',
  styleUrls: ['./lista-produto.component.scss'],
})
export class ListaProdutoComponent implements OnInit {
  private router = inject(Router);
  private produtosService = inject(ProdutosService);
  private alert = inject(AlertService);

  produtos: Produto[] = [];
  loading = false;

  filtroCategoria?: string;
  filtroAtivo?: boolean;

  opcoesCategoria = [
    { label: 'Todas as categorias', value: undefined },
    { label: 'Informática', value: 'Informática' },
    { label: 'Periféricos', value: 'Periféricos' },
    { label: 'Acessórios', value: 'Acessórios' },
    { label: 'Outros', value: 'Outros' },
  ];

  opcoesAtivo = [
    { label: 'Todos', value: undefined },
    { label: 'Ativos', value: true },
    { label: 'Inativos', value: false },
  ];

  ngOnInit(): void {
    this.carregar(); // opcional: pode começar carregando
  }

  carregar(): void {
    this.loading = true;
    this.produtosService.findAll().subscribe({
      next: (lista) => {
        this.produtos = this.aplicarFiltros(lista);
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.alert.error('Erro', err?.message ?? 'Erro ao consultar API de produtos.');
      },
    });
  }

  private aplicarFiltros(lista: Produto[]): Produto[] {
    return lista.filter((p) => {
      const categoriaOk = !this.filtroCategoria || p.categoria === this.filtroCategoria;
      const ativoOk =
        this.filtroAtivo === undefined ? true : (p.ativo ?? true) === this.filtroAtivo;
      return categoriaOk && ativoOk;
    });
  }

  editar(id: number): void {
    this.router.navigate(['/produtos/editar', id]);
  }

  async excluir(id: number): Promise<void> {
    const confirm = await this.alert.confirm(
      'Excluir produto?',
      'Essa ação não poderá ser desfeita.'
    );

    if (confirm.isConfirmed) {
      this.produtosService.delete(id).subscribe({
        next: () => {
          this.alert.success('Excluído', 'Produto removido com sucesso.');
          this.carregar();
        },
        error: (err) =>
          this.alert.error('Erro', err?.message ?? 'Erro ao excluir produto.'),
      });
    }
  }
}
