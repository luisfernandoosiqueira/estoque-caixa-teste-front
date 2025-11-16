import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DropdownModule } from 'primeng/dropdown';
import { CheckboxModule } from 'primeng/checkbox';

import { UsuariosService } from '../../../core/services/usuarios.service';
import { Usuario, Perfil } from '../../../core/models/usuario.model';
import { AlertService } from '../../../core/alert/alert.service';
import { CanComponentDeactivate } from '../../../core/auth/unsaved-changes.guard';

@Component({
  selector: 'app-cadastro-usuario',
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
  templateUrl: './cadastro-usuario.component.html',
  styleUrls: ['./cadastro-usuario.component.scss'],
})
export class CadastroUsuarioComponent implements OnInit, CanComponentDeactivate {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private usuarioApi = inject(UsuariosService);
  private alert = inject(AlertService);
  private fb = inject(FormBuilder);

  id?: number;
  labelSalvar = 'Salvar';
  form!: FormGroup;
  formAlterado = false;
  formOriginal = '';

  perfis = [
    { label: 'Administrador', value: 'ADMINISTRADOR' as Perfil },
    { label: 'Operador de Caixa', value: 'OPERADOR' as Perfil },
  ];

  ngOnInit(): void {
    this.criarForm();

    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      this.id = Number(param);
      this.labelSalvar = 'Atualizar';
      this.carregarUsuario(this.id);
    } else {
      this.salvarEstadoInicial();
    }

    this.form.valueChanges.subscribe(() => {
      this.formAlterado = true;
    });
  }

  private criarForm(): void {
    this.form = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: [''], // tratada manualmente (obrigatória só no cadastro)
      perfil: ['', Validators.required],
      ativo: [true],
    });
  }

  private carregarUsuario(id: number): void {
    this.usuarioApi.findById(id).subscribe({
      next: (u: Usuario) => {
        this.form.patchValue({
          nomeCompleto: u.nomeCompleto ?? '',
          email: u.email ?? '',
          perfil: u.perfil ?? '',
          ativo: u.ativo ?? true,
          senha: '',
        });
        this.salvarEstadoInicial();
        this.formAlterado = false;
      },
      error: () => {
        this.alert.error('Erro', 'Não foi possível carregar o usuário.');
        this.router.navigate(['/usuarios']);
      },
    });
  }

  salvar(): void {
    const raw = this.form.getRawValue();
    const isEdicao = !!this.id;

    const nomeCompleto = (raw.nomeCompleto ?? '').trim();
    const email = (raw.email ?? '').trim();
    const senha = (raw.senha ?? '').trim();
    const perfil = raw.perfil as Perfil;
    const ativo = !!raw.ativo;

    // Nome completo
    if (!nomeCompleto) {
      this.form.get('nomeCompleto')?.markAsTouched();
      this.alert.warn('Nome obrigatório', 'Informe o nome completo do usuário.');
      return;
    }
    if (nomeCompleto.length < 3) {
      this.form.get('nomeCompleto')?.markAsTouched();
      this.alert.warn('Nome inválido', 'O nome completo deve ter pelo menos 3 caracteres.');
      return;
    }

    // E-mail
    if (!email) {
      this.form.get('email')?.markAsTouched();
      this.alert.warn('E-mail obrigatório', 'Informe o e-mail do usuário.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      this.form.get('email')?.markAsTouched();
      this.alert.warn('E-mail inválido', 'Informe um e-mail válido (ex: usuario@empresa.com).');
      return;
    }

    // Perfil
    if (!perfil || (perfil !== 'ADMINISTRADOR' && perfil !== 'OPERADOR')) {
      this.form.get('perfil')?.markAsTouched();
      this.alert.warn('Perfil obrigatório', 'Selecione um perfil válido para o usuário.');
      return;
    }

    // Senha: obrigatória no cadastro, opcional na edição
    if (!isEdicao) {
      if (!senha) {
        this.form.get('senha')?.markAsTouched();
        this.alert.warn('Senha obrigatória', 'Informe a senha do usuário.');
        return;
      }
      if (senha.length < 8) {
        this.form.get('senha')?.markAsTouched();
        this.alert.warn('Senha fraca', 'A senha deve conter pelo menos 8 caracteres.');
        return;
      }
    } else {
      if (senha && senha.length < 8) {
        this.form.get('senha')?.markAsTouched();
        this.alert.warn('Senha fraca', 'A nova senha deve conter pelo menos 8 caracteres.');
        return;
      }
    }

    const body: Usuario = {
      nomeCompleto,
      email,
      perfil,
      ativo,
    };

    if (!isEdicao) {
      body.senha = senha;
    } else if (senha) {
      body.senha = senha;
    }

    const req$ = this.id
      ? this.usuarioApi.update(this.id, body)
      : this.usuarioApi.create(body);

    if (this.form.invalid) {
      this.form.markAllAsTouched();
    }

    req$.subscribe({
      next: () => {
        this.alert.success('Sucesso', 'Usuário salvo com sucesso!');
        this.salvarEstadoInicial();
        this.formAlterado = false;
        this.router.navigate(['/usuarios']);
      },
      error: (err) => {
        const msg =
          err?.error?.mensagem || 'Não foi possível salvar o usuário. Verifique os dados.';
        this.alert.error('Erro', msg);
      },
    });
  }

  cancelar(): void {
    this.router.navigate(['/usuarios']);
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
