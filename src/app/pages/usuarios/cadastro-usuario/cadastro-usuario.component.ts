import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

import { UsuariosService } from '../../../core/services/usuarios.service';
import { AlertService } from '../../../core/alert/alert.service';
import { Usuario, Perfil } from '../../../core/models/usuario.model';
import { CanComponentDeactivate } from '../../../core/auth/unsaved-changes.guard';

@Component({
  selector: 'app-cadastro-usuario',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DropdownModule,
    InputTextModule,
    ButtonModule,
    CardModule,
  ],
  templateUrl: './cadastro-usuario.component.html',
  styleUrls: ['./cadastro-usuario.component.scss'],
})
export class CadastroUsuarioComponent implements OnInit, CanComponentDeactivate {

  private fb = inject(FormBuilder);
  private usuariosApi = inject(UsuariosService);
  private alert = inject(AlertService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  usuarioForm!: FormGroup;
  id: number | null = null;
  labelSalvar = 'Salvar';

  perfis = [
    { label: 'Administrador', value: 'ADMINISTRADOR' as Perfil },
    { label: 'Operador de Caixa', value: 'OPERADOR' as Perfil },
  ];

  private formAlterado = false;
  private cadastroPublico = false; // rota /cadastro-usuario

  get form(): FormGroup {
    return this.usuarioForm;
  }

  ngOnInit(): void {
    this.criarForm();

    const currentPath = this.route.snapshot.routeConfig?.path;
    this.cadastroPublico = currentPath === 'cadastro-usuario';

    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.id = Number(idParam);
      this.labelSalvar = 'Atualizar';
      this.carregarUsuario(this.id);
    }

    this.usuarioForm.valueChanges.subscribe(() => {
      this.formAlterado = true;
    });
  }

  private criarForm(): void {
    this.usuarioForm = this.fb.group({
      nomeCompleto: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(8)]],
      perfil: ['OPERADOR', Validators.required],
      ativo: [true],
    });
  }

  private carregarUsuario(id: number): void {
    this.usuariosApi.findById(id).subscribe({
      next: (u: Usuario) => {
        this.usuarioForm.patchValue({
          nomeCompleto: u.nomeCompleto,
          email: u.email,
          perfil: u.perfil,
          ativo: u.ativo,
        });
        this.usuarioForm.markAsPristine();
        this.usuarioForm.markAsUntouched();
        this.formAlterado = false;
      },
      error: () => {
        this.alert.error('Erro', 'Não foi possível carregar os dados do usuário.');
        this.router.navigate(['/usuarios']);
      },
    });
  }

  salvar(): void {
    if (this.usuarioForm.invalid) {
      this.usuarioForm.markAllAsTouched();
      this.alert.warn(
        'Campos obrigatórios',
        'Preencha todos os campos corretamente.'
      );
      return;
    }

    const formValue = this.usuarioForm.value;

    const body: Usuario = {
      id: this.id ?? undefined,
      nomeCompleto: formValue.nomeCompleto,
      email: formValue.email,
      senha: formValue.senha,
      perfil: formValue.perfil,
      ativo: formValue.ativo,
    };

    if (this.id) {
      this.usuariosApi.update(this.id, body).subscribe({
        next: () => {
          this.alert.success('Sucesso', 'Usuário atualizado com sucesso.');
          this.formAlterado = false;
          this.usuarioForm.markAsPristine();
          this.usuarioForm.markAsUntouched();
          this.router.navigate(['/usuarios']);
        },
        error: () =>
          this.alert.error('Erro', 'Não foi possível atualizar o usuário.'),
      });
    } else {
      this.usuariosApi.create(body).subscribe({
        next: () => {
          this.formAlterado = false;
          this.usuarioForm.markAsPristine();
          this.usuarioForm.markAsUntouched();

          if (this.cadastroPublico) {
            this.router.navigate(['/login'], {
              queryParams: { cadastroSucesso: 'true' }
            });
          } else {
            this.alert.success('Sucesso', 'Usuário cadastrado com sucesso.');
            this.router.navigate(['/usuarios']);
          }
        },
        error: () =>
          this.alert.error('Erro', 'Não foi possível cadastrar o usuário.'),
      });
    }
  }

  cancelar(): void {
    if (this.cadastroPublico) {
      this.router.navigate(['/login']);
    } else {
      this.router.navigate(['/usuarios']);
    }
  }

  async podeSair(): Promise<boolean> {
    if (!this.formAlterado && !this.usuarioForm.dirty) {
      return true;
    }

    const confirm = await this.alert.confirm(
      'Alterações não salvas',
      'Deseja realmente sair desta tela?'
    );

    return confirm.isConfirmed;
  }
}
