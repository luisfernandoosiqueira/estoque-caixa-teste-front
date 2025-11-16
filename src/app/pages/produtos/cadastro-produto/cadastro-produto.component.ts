import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputTextModule,
    ButtonModule,
    CardModule,
    DropdownModule,
    CheckboxModule,
  ],
  templateUrl: './cadastro-produto.component.html',
  styleUrls: ['./cadastro-produto.component.scss'],
})
export class CadastroProdutoComponent implements OnInit, CanComponentDeactivate {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private produtoApi = inject(ProdutosService);
  private alert = inject(AlertService);
  private fb = inject(FormBuilder);

  id?: number;
  labelSalvar = 'Salvar';
  form!: FormGroup;
  formAlterado = false;
  formOriginal = '';

  categorias = [
    { label: 'Informática', value: 'Informática' },
    { label: 'Periféricos', value: 'Periféricos' },
    { label: 'Acessórios', value: 'Acessórios' },
    { label: 'Outros', value: 'Outros' },
  ];

  ngOnInit(): void {
    this.criarForm();

    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      this.id = Number(param);
      this.labelSalvar = 'Atualizar';
      this.carregarProduto(this.id);
    } else {
      this.salvarEstadoInicial();
    }

    this.form.valueChanges.subscribe(() => {
      this.formAlterado = true;
    });
  }

  private criarForm(): void {
    this.form = this.fb.group({
      codigo: ['', Validators.required],
      nome: ['', Validators.required],
      categoria: ['', Validators.required],
      precoUnitario: [0, [Validators.required, Validators.min(0)]],
      quantidadeEstoque: [0, [Validators.required, Validators.min(0)]],
      ativo: [true], // padrão ativo
    });
  }

  private carregarProduto(id: number): void {
    this.produtoApi.findById(id).subscribe({
      next: (p: Produto) => {
        this.form.patchValue({
          codigo: p.codigo ?? '',
          nome: p.nome ?? '',
          categoria: p.categoria ?? '',
          precoUnitario: p.precoUnitario ?? 0,
          quantidadeEstoque: p.quantidadeEstoque ?? 0,
          ativo: p.ativo ?? true,
        });
        this.salvarEstadoInicial();
        this.formAlterado = false;
      },
      error: () => {
        this.alert.error('Erro', 'Não foi possível carregar o produto.');
        this.router.navigate(['/produtos']);
      },
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.alert.warn(
        'Campos obrigatórios',
        'Preencha código, nome, categoria, preço e quantidade corretamente.'
      );
      return;
    }

    const raw = this.form.getRawValue();
    const body: Produto = {
      ...raw,
      ativo: !!raw.ativo, // garante booleano (true/false) no payload
    };

    const req$ = this.id
      ? this.produtoApi.update(this.id, body)
      : this.produtoApi.create(body);

    req$.subscribe({
      next: () => {
        this.alert.success('Sucesso', 'Produto salvo com sucesso!');
        this.salvarEstadoInicial();
        this.formAlterado = false;
        this.router.navigate(['/produtos']);
      },
      error: () => this.alert.error('Erro', 'Não foi possível salvar o produto.'),
    });
  }

  cancelar(): void {
    this.router.navigate(['/produtos']);
  }

  private salvarEstadoInicial(): void {
    this.formOriginal = JSON.stringify(this.form.getRawValue());
  }

  async podeSair(): Promise<boolean> {
    if (this.formAlterado) {
      const atual = JSON.stringify(this.form.getRawValue());
      const alterado = this.formOriginal !== atual;
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
