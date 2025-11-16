// src/app/pages/movimentacoes/cadastro-movimentacao/cadastro-movimentacao.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
    ReactiveFormsModule,
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
  private fb = inject(FormBuilder);

  produtos: Produto[] = [];
  form!: FormGroup;
  formAlterado = false; // usado pelo guard

  tiposMovimentacao = [
    { label: 'Entrada em estoque', value: 'ENTRADA' as TipoMovimentacao },
    { label: 'Saída de estoque', value: 'SAIDA' as TipoMovimentacao },
    { label: 'Ajuste de estoque', value: 'AJUSTE' as TipoMovimentacao },
  ];

  ngOnInit(): void {
    this.criarForm();
    this.carregarProdutos();

    this.form.valueChanges.subscribe(() => {
      this.formAlterado = true;
    });
  }

  private criarForm(): void {
    this.form = this.fb.group({
      produtoId: [null, Validators.required],
      tipo: [null, Validators.required],
      quantidade: [1, [Validators.required, Validators.min(1)]],
      motivo: [''],
    });
  }

  private carregarProdutos(): void {
    this.produtosApi.findAll().subscribe({
      next: (lista: Produto[]) => (this.produtos = lista),
      error: () =>
        this.alert.error('Erro', 'Não foi possível carregar os produtos.'),
    });
  }

  salvar(): void {
    const raw = this.form.getRawValue();

    if (!raw.produtoId) {
      this.form.get('produtoId')?.markAsTouched();
      this.alert.warn('Campos obrigatórios', 'Selecione um produto.');
      return;
    }

    if (!raw.tipo) {
      this.form.get('tipo')?.markAsTouched();
      this.alert.warn('Campos obrigatórios', 'Selecione o tipo de movimentação.');
      return;
    }

    if (!raw.quantidade || raw.quantidade <= 0) {
      this.form.get('quantidade')?.markAsTouched();
      this.alert.warn(
        'Campos obrigatórios',
        'Informe uma quantidade maior que zero.'
      );
      return;
    }

    const motivo = (raw.motivo ?? '').trim();
    if (motivo.length > 255) {
      this.form.get('motivo')?.markAsTouched();
      this.alert.warn(
        'Motivo muito longo',
        'O motivo deve ter no máximo 255 caracteres.'
      );
      return;
    }

    const body: MovimentacaoRequest = {
      produtoId: raw.produtoId,
      tipo: raw.tipo,
      quantidade: raw.quantidade,
      motivo: motivo || undefined,
    };

    this.movimentacoesApi.create(body).subscribe({
      next: () => {
        this.alert.success('Sucesso', 'Movimentação registrada com sucesso!');

        // marca como salvo para o guard não exibir alerta
        this.formAlterado = false;
        this.form.markAsPristine();
        this.form.markAsUntouched();

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
    if (!this.form || (!this.formAlterado && !this.form.dirty)) {
      return true;
    }

    const confirm = await this.alert.confirm(
      'Alterações não salvas',
      'Deseja realmente sair?'
    );
    return confirm.isConfirmed;
  }
}
