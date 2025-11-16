import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { Router } from '@angular/router';

import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { TableModule } from 'primeng/table';

import { ProdutosService } from '../../../core/services/produtos.service';
import { VendasService } from '../../../core/services/vendas.service'; // ✅ sem o ponto antes de core
import { UsuariosService } from '../../../core/services/usuarios.service';

import { Produto } from '../../../core/models/produto.model';
import { Usuario } from '../../../core/models/usuario.model';
import { ItemVenda } from '../../../core/models/item-venda.model';
import {
  VendaRequest,
  ItemVendaRequest
} from '../../../core/models/venda.model';

import { AlertService } from '../../../core/alert/alert.service';
import { CanComponentDeactivate } from '../../../core/auth/unsaved-changes.guard';

@Component({
  selector: 'app-cadastro-venda',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    InputNumberModule,
    ButtonModule,
    CardModule,
    TableModule,
  ],
  templateUrl: './cadastro-venda.component.html',
  styleUrls: ['./cadastro-venda.component.scss'],
})
export class CadastroVendaComponent implements OnInit, CanComponentDeactivate {
  private produtosApi = inject(ProdutosService);
  private vendasApi = inject(VendasService);
  private usuariosApi = inject(UsuariosService);
  private alert = inject(AlertService);
  private router = inject(Router);
  private fb = inject(FormBuilder);

  // formulário principal
  vendaForm!: FormGroup;

  produtos: Produto[] = [];
  usuarios: Usuario[] = [];

  // itens da venda
  itens: ItemVenda[] = [];

  valorTotal = 0;
  troco = 0;

  private formAlterado = false;

  // getters de apoio
  get itemGroup(): FormGroup {
    return this.vendaForm.get('item') as FormGroup;
  }

  get produtoSelecionado(): Produto | null {
    return (this.itemGroup.get('produtoSelecionado')?.value as Produto) ?? null;
  }

  get quantidade(): number {
    return (this.itemGroup.get('quantidadeItem')?.value as number) ?? 0;
  }

  ngOnInit(): void {
    this.criarForm();
    this.carregarProdutos();
    this.carregarUsuarios();

    this.vendaForm.valueChanges.subscribe(() => {
      this.formAlterado = true;
      this.recalcular();
    });
  }

  private criarForm(): void {
    this.vendaForm = this.fb.group({
      usuarioId: [null, Validators.required],
      valorRecebido: [null, [Validators.required, Validators.min(0.01)]],
      item: this.fb.group({
        produtoSelecionado: [null],
        quantidadeItem: [1],
      }),
    });
  }

  private carregarProdutos(): void {
    this.produtosApi.findAll().subscribe({
      next: (lista) => (this.produtos = lista),
      error: () =>
        this.alert.error('Erro', 'Não foi possível carregar os produtos.'),
    });
  }

  private carregarUsuarios(): void {
    // carrega apenas usuários ativos do back-end
    this.usuariosApi.findAtivos().subscribe({
      next: (lista) => (this.usuarios = lista),
      error: () =>
        this.alert.error('Erro', 'Não foi possível carregar os usuários.'),
    });
  }

  adicionarItem(): void {
    const p = this.produtoSelecionado;
    const qtd = this.quantidade;

    if (!p) {
      this.alert.warn('Atenção', 'Selecione um produto.');
      return;
    }

    if (!qtd || qtd <= 0) {
      this.alert.warn('Atenção', 'Quantidade inválida.');
      return;
    }

    if (!p.id) {
      this.alert.error('Erro', 'Produto sem ID válido.');
      return;
    }

    if (p.quantidadeEstoque != null && qtd > p.quantidadeEstoque) {
      this.alert.warn(
        'Estoque insuficiente',
        `Quantidade solicitada (${qtd}) é maior que o estoque disponível (${p.quantidadeEstoque}).`
      );
      return;
    }

    const preco = p.precoUnitario ?? 0;
    const subtotal = preco * qtd;

    const item: ItemVenda = {
      produto: p,
      produtoId: p.id,
      quantidade: qtd,
      precoUnitario: preco,
      subtotal,
    };

    this.itens.push(item);

    this.itemGroup.patchValue({
      produtoSelecionado: null,
      quantidadeItem: 1,
    });
    this.itemGroup.markAsPristine();
    this.itemGroup.markAsUntouched();

    this.recalcular();
    this.formAlterado = true;
  }

  removerItem(index: number): void {
    this.itens.splice(index, 1);
    this.recalcular();
    this.formAlterado = true;
  }

  recalcular(): void {
    this.valorTotal = (this.itens ?? []).reduce(
      (acc, i) => acc + (i.subtotal ?? 0),
      0
    );

    const recebido =
      (this.vendaForm.get('valorRecebido')?.value as number | null) ?? 0;

    this.troco = recebido - this.valorTotal;
  }

  salvar(): void {
    if (this.vendaForm.invalid) {
      this.vendaForm.get('usuarioId')?.markAsTouched();
      this.vendaForm.get('valorRecebido')?.markAsTouched();

      this.alert.warn(
        'Campos obrigatórios',
        'Preencha usuário e valor recebido corretamente.'
      );
      return;
    }

    if (!this.itens.length) {
      this.alert.warn(
        'Campos obrigatórios',
        'Adicione pelo menos um item.'
      );
      return;
    }

    const usuarioId = this.vendaForm.get('usuarioId')?.value as number | null;
    const recebido =
      (this.vendaForm.get('valorRecebido')?.value as number | null) ?? 0;

    if (!usuarioId) {
      this.alert.warn('Campos obrigatórios', 'Selecione um usuário.');
      return;
    }

    // defesa extra: garante que o usuário ainda é ativo
    const usuarioSelecionado = this.usuarios.find((u) => u.id === usuarioId);
    if (!usuarioSelecionado || !usuarioSelecionado.ativo) {
      this.alert.warn(
        'Usuário inválido',
        'Selecione um usuário ativo para registrar a venda.'
      );
      return;
    }

    if (recebido <= 0) {
      this.alert.warn(
        'Campos obrigatórios',
        'Informe o valor recebido.'
      );
      return;
    }

    if (recebido < this.valorTotal) {
      this.alert.warn(
        'Valor insuficiente',
        'Valor recebido é menor que o total da venda.'
      );
      return;
    }

    const itensRequest: ItemVendaRequest[] = this.itens.map((i) => ({
      produtoId: i.produtoId ?? i.produto?.id!,
      quantidade: i.quantidade,
      precoUnitario: i.precoUnitario,
      subtotal: i.subtotal,
    }));

    const body: VendaRequest = {
      usuarioId,
      valorRecebido: recebido,
      itens: itensRequest,
    };

    this.vendasApi.create(body).subscribe({
      next: () => {
        this.alert.success('Sucesso', 'Venda registrada com sucesso!');
        this.formAlterado = false;
        this.vendaForm.markAsPristine();
        this.vendaForm.markAsUntouched();
        this.router.navigate(['/vendas']);
      },
      error: () =>
        this.alert.error(
          'Erro',
          'Não foi possível registrar a venda.'
        ),
    });
  }

  cancelar(): void {
    this.router.navigate(['/vendas']);
  }

  async podeSair(): Promise<boolean> {
    if (!this.formAlterado && !this.vendaForm.dirty) return true;

    const resposta = await this.alert.confirm(
      'Alterações não salvas',
      'Deseja realmente sair desta tela?'
    );

    // cast para o formato retornado pelo SweetAlert
    const result = resposta as { isConfirmed: boolean };

    return !!result.isConfirmed;
  }
}
