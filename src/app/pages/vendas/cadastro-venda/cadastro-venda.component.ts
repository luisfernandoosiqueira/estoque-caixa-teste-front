import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

import { ProdutosService } from '../../../core/services/produtos.service';
import { VendasService } from '../../../core/services/vendas.service';
import { UsuariosService } from '../../../core/services/usuarios.service';

import { Produto } from '../../../core/models/produto.model';
import { Usuario } from '../../../core/models/usuario.model';
import { ItemVenda } from '../../../core/models/item-venda.model';
import { VendaRequest } from '../../../core/models/venda.model';

import { AlertService } from '../../../core/alert/alert.service';
import { CanComponentDeactivate } from '../../../core/auth/unsaved-changes.guard';

@Component({
  selector: 'app-cadastro-venda',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DropdownModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    TableModule
  ],
  templateUrl: './cadastro-venda.component.html',
  styleUrls: ['./cadastro-venda.component.scss']
})
export class CadastroVendaComponent implements OnInit, CanComponentDeactivate {

  private produtosApi = inject(ProdutosService);
  private vendasApi = inject(VendasService);
  private usuariosApi = inject(UsuariosService);
  private alert = inject(AlertService);
  private router = inject(Router);

  produtos: Produto[] = [];
  usuarios: Usuario[] = [];

  usuarioId?: number;
  valorRecebido: number | null = null;

  itens: ItemVenda[] = [];
  itemSelecionado?: Produto;
  quantidade = 1;

  valorTotal = 0;
  troco = 0;

  private formAlterado = false;

  ngOnInit(): void {
    this.carregarProdutos();
    this.carregarUsuarios();
  }

  marcarAlterado(): void {
    this.formAlterado = true;
  }

  private carregarProdutos(): void {
    this.produtosApi.findAll().subscribe({
      next: (lista) => (this.produtos = lista),
      error: () =>
        this.alert.error('Erro', 'Não foi possível carregar os produtos.')
    });
  }

  private carregarUsuarios(): void {
    this.usuariosApi.findAll().subscribe({
      next: (lista) => (this.usuarios = lista),
      error: () =>
        this.alert.error('Erro', 'Não foi possível carregar os usuários.')
    });
  }

  adicionarItem(): void {
    if (!this.itemSelecionado) {
      this.alert.warn('Atenção', 'Selecione um produto.');
      return;
    }

    if (!this.quantidade || this.quantidade <= 0) {
      this.alert.warn('Atenção', 'Quantidade inválida.');
      return;
    }

    const p = this.itemSelecionado;
    if (!p.id) {
      this.alert.error('Erro', 'Produto sem ID válido.');
      return;
    }

    const preco = p.precoUnitario ?? 0;
    const qtd = this.quantidade;
    const subtotal = preco * qtd;

    const item: ItemVenda = {
      produto: p,
      produtoId: p.id, // agora existe na interface
      quantidade: qtd,
      precoUnitario: preco,
      subtotal
    };

    this.itens.push(item);
    this.recalcular();
    this.marcarAlterado();
  }

  removerItem(index: number): void {
    this.itens.splice(index, 1);
    this.recalcular();
    this.marcarAlterado();
  }

  recalcular(): void {
    this.valorTotal = (this.itens ?? []).reduce(
      (acc, i) => acc + (i.subtotal ?? 0),
      0
    );
    const recebido = this.valorRecebido ?? 0;
    this.troco = recebido - this.valorTotal;
  }

  salvar(): void {
    if (!this.usuarioId) {
      this.alert.warn('Campos obrigatórios', 'Selecione um usuário.');
      return;
    }

    if (!this.itens.length) {
      this.alert.warn('Campos obrigatórios', 'Adicione pelo menos um item.');
      return;
    }

    const recebido = this.valorRecebido ?? 0;
    if (recebido <= 0) {
      this.alert.warn('Campos obrigatórios', 'Informe o valor recebido.');
      return;
    }

    if (recebido < this.valorTotal) {
      this.alert.warn('Valor insuficiente', 'Valor recebido é menor que o total da venda.');
      return;
    }

    const body: VendaRequest = {
      usuarioId: this.usuarioId,
      valorRecebido: recebido,
      itens: this.itens.map(i => ({
        produtoId: i.produtoId ?? i.produto?.id!, // garante envio do ID
        quantidade: i.quantidade,
        precoUnitario: i.precoUnitario,
        subtotal: i.subtotal
      }))
    };

    this.vendasApi.create(body).subscribe({
      next: () => {
        this.alert.success('Sucesso', 'Venda registrada com sucesso!');
        this.formAlterado = false;
        this.router.navigate(['/vendas']);
      },
      error: () =>
        this.alert.error('Erro', 'Não foi possível registrar a venda.')
    });
  }

  cancelar(): void {
    this.router.navigate(['/vendas']);
  }

  async podeSair(): Promise<boolean> {
    if (!this.formAlterado) return true;

    const confirm = await this.alert.confirm(
      'Alterações não salvas',
      'Deseja realmente sair desta tela?'
    );

    return confirm.isConfirmed;
  }
}