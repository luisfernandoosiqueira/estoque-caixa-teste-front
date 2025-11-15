import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';

import { ProdutosService } from '../../../core/services/produtos.service';
import { Produto } from '../../../core/models/produto.model';
import { AlertService } from '../../../core/alert/alert.service';
import { CanComponentDeactivate } from '../../../core/auth/unsaved-changes.guard';

@Component({
  selector: 'app-cadastro-produto',
  standalone: true,
  imports: [CommonModule, FormsModule, InputTextModule, ButtonModule, CardModule, DropdownModule, CheckboxModule],
  templateUrl: './cadastro-produto.component.html',
  styleUrls: ['./cadastro-produto.component.scss'],
})
export class CadastroProdutoComponent implements OnInit, CanComponentDeactivate {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private produtoApi = inject(ProdutosService);
  private alert = inject(AlertService);

  id?: number;
  labelSalvar = 'Salvar';
  formAlterado = false;
  formOriginal = '';

  // formulário
  codigo = '';
  nome = '';
  categoria = '';
  precoUnitario: number | null = null;
  quantidadeEstoque: number | null = null;
  ativo = true;

  // opções fixas de categoria
  categorias = [
    { label: 'Informática', value: 'Informática' },
    { label: 'Periféricos', value: 'Periféricos' },
    { label: 'Acessórios', value: 'Acessórios' },
    { label: 'Outros', value: 'Outros' },
  ];

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      this.id = Number(param);
      this.labelSalvar = 'Atualizar';
      this.carregarProduto(this.id);
    } else {
      this.salvarEstadoInicial();
    }
  }

  marcarAlterado(): void {
    this.formAlterado = true;
  }

  private carregarProduto(id: number): void {
    this.produtoApi.findById(id).subscribe({
      next: (p: Produto) => {
        this.codigo = p.codigo ?? '';
        this.nome = p.nome ?? '';
        this.categoria = p.categoria ?? '';
        this.precoUnitario = p.precoUnitario ?? null;
        this.quantidadeEstoque = p.quantidadeEstoque ?? null;
        this.ativo = p.ativo ?? true;
        this.salvarEstadoInicial();
      },
      error: () => {
        this.alert.error('Erro', 'Não foi possível carregar o produto.');
        this.router.navigate(['/produtos']);
      },
    });
  }

  salvar(): void {
    const codigo = this.codigo.trim();
    const nome = this.nome.trim();
    const categoria = this.categoria.trim();
    const precoUnitario = this.precoUnitario ?? 0;
    const quantidadeEstoque = this.quantidadeEstoque ?? 0;

    if (!codigo || !nome || !categoria || precoUnitario <= 0 || quantidadeEstoque < 0) {
      this.alert.warn('Campos obrigatórios', 'Preencha todos os campos corretamente.');
      return;
    }

    const body: Produto = {
      codigo,
      nome,
      categoria,
      precoUnitario,
      quantidadeEstoque,
      ativo: this.ativo,
    };

    const req$ = this.id
      ? this.produtoApi.update(this.id, body)
      : this.produtoApi.create(body);

    req$.subscribe({
      next: () => {
        this.alert.success('Sucesso', 'Produto salvo com sucesso!');
        this.formAlterado = false;
        this.salvarEstadoInicial();
        this.router.navigate(['/produtos']);
      },
      error: () => this.alert.error('Erro', 'Não foi possível salvar o produto.'),
    });
  }

  cancelar(): void {
    this.router.navigate(['/produtos']);
  }

  private salvarEstadoInicial(): void {
    const estado = {
      codigo: this.codigo,
      nome: this.nome,
      categoria: this.categoria,
      precoUnitario: this.precoUnitario,
      quantidadeEstoque: this.quantidadeEstoque,
      ativo: this.ativo,
    };
    this.formOriginal = JSON.stringify(estado);
  }

  async podeSair(): Promise<boolean> {
    if (this.formAlterado) {
      const estadoAtual = {
        codigo: this.codigo,
        nome: this.nome,
        categoria: this.categoria,
        precoUnitario: this.precoUnitario,
        quantidadeEstoque: this.quantidadeEstoque,
        ativo: this.ativo,
      };
      const alterado = this.formOriginal !== JSON.stringify(estadoAtual);
      if (alterado) {
        const confirm = await this.alert.confirm(
          'Existem alterações não salvas.',
          'Deseja sair mesmo assim?'
        );
        return confirm.isConfirmed;
      }
    }
    return true;
  }
}
