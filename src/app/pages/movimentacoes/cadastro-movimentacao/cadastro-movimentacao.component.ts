// src/app/pages/movimentacoes/cadastro-movimentacao/cadastro-movimentacao.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { ProdutosService } from '../../../core/services/produtos.service';
import { MovimentacoesService } from '../../../core/services/movimentacoes.service';

import { Produto } from '../../../core/models/produto.model';
import {
  TipoMovimentacao,
  MovimentacaoRequest,
} from '../../../core/models/movimentacao.model';

import { AlertService } from '../../../core/alert/alert.service';
import { CanComponentDeactivate } from '../../../core/auth/unsaved-changes.guard';

@Component({
  selector: 'app-cadastro-movimentacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
  ],
  templateUrl: './cadastro-movimentacao.component.html',
  styleUrls: ['./cadastro-movimentacao.component.scss'],
})
export class CadastroMovimentacaoComponent
  implements OnInit, CanComponentDeactivate
{
  private produtosApi = inject(ProdutosService);
  private movimentacoesApi = inject(MovimentacoesService);
  private alert = inject(AlertService);
  private router = inject(Router);

  produtos: Produto[] = [];

  // campos do formulário
  produtoId?: number;
  tipo: TipoMovimentacao | '' = '';
  quantidade: number | null = null;
  observacao = '';

  formAlterado = false;

  tiposMovimentacao = [
    { label: 'Entrada em estoque', value: 'ENTRADA' as TipoMovimentacao },
    { label: 'Saída de estoque', value: 'SAIDA' as TipoMovimentacao },
    { label: 'Ajuste de estoque', value: 'AJUSTE' as TipoMovimentacao },
  ];

  ngOnInit(): void {
    this.carregarProdutos();
  }

  marcarAlterado(): void {
    this.formAlterado = true;
  }

  private carregarProdutos(): void {
    this.produtosApi.findAll().subscribe({
      next: (lista: Produto[]) => (this.produtos = lista),
      error: () =>
        this.alert.error('Erro', 'Não foi possível carregar os produtos.'),
    });
  }

  salvar(): void {
    if (!this.produtoId) {
      this.alert.warn('Campos obrigatórios', 'Selecione um produto.');
      return;
    }

    if (!this.tipo) {
      this.alert.warn('Campos obrigatórios', 'Selecione o tipo de movimentação.');
      return;
    }

    if (!this.quantidade || this.quantidade <= 0) {
      this.alert.warn(
        'Campos obrigatórios',
        'Informe uma quantidade maior que zero.'
      );
      return;
    }

    const body: MovimentacaoRequest = {
      produtoId: this.produtoId,
      tipo: this.tipo,
      quantidade: this.quantidade,
      observacao: this.observacao?.trim() || undefined,
    };

    this.movimentacoesApi.create(body).subscribe({
      next: () => {
        this.alert.success('Sucesso', 'Movimentação registrada com sucesso!');
        this.formAlterado = false;
        this.router.navigate(['/movimentacoes']);
      },
      error: () =>
        this.alert.error(
          'Erro',
          'Não foi possível registrar a movimentação de estoque.'
        ),
    });
  }

  cancelar(): void {
    this.router.navigate(['/movimentacoes']);
  }

  async podeSair(): Promise<boolean> {
    if (!this.formAlterado) return true;

    const confirm = await this.alert.confirm(
      'Alterações não salvas',
      'Deseja realmente sair?'
    );
    return confirm.isConfirmed;
  }
}