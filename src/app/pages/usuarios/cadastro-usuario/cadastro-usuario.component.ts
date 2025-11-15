import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
    CommonModule, FormsModule,
    InputTextModule, ButtonModule,
    CardModule, DropdownModule, CheckboxModule
  ],
  templateUrl: './cadastro-usuario.component.html',
  styleUrls: ['./cadastro-usuario.component.scss'],
})
export class CadastroUsuarioComponent implements OnInit, CanComponentDeactivate {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private usuarioApi = inject(UsuariosService);
  private alert = inject(AlertService);

  id?: number;
  labelSalvar = 'Salvar';
  formAlterado = false;
  formOriginal = '';

  // formulário
  nome = '';
  email = '';
  senha = '';
  perfil: Perfil | '' = '';   // ✅ tipagem ajustada
  ativo = true;

  perfis = [
    { label: 'Administrador', value: 'ADMIN' },
    { label: 'Operador de Caixa', value: 'CAIXA' },
    { label: 'Gerente', value: 'GERENTE' },
  ];

  ngOnInit(): void {
    const param = this.route.snapshot.paramMap.get('id');
    if (param) {
      this.id = Number(param);
      this.labelSalvar = 'Atualizar';
      this.carregarUsuario(this.id);
    } else {
      this.salvarEstadoInicial();
    }
  }

  marcarAlterado(): void {
    this.formAlterado = true;
  }

  private carregarUsuario(id: number): void {
    this.usuarioApi.findById(id).subscribe({
      next: (u: Usuario) => {
        this.nome = u.nome ?? '';
        this.email = u.email ?? '';
        this.perfil = u.perfil ?? '';   // compatível com Perfil | ''
        this.ativo = u.ativo ?? true;
        this.salvarEstadoInicial();
      },
      error: () => {
        this.alert.error('Erro', 'Não foi possível carregar o usuário.');
        this.router.navigate(['/usuarios']);
      },
    });
  }

  salvar(): void {
    const nome = this.nome.trim();
    const email = this.email.trim();
    const senha = this.senha.trim();
    const perfil = this.perfil as Perfil;   // conversão literal

    if (!nome || !email || (!this.id && !senha) || !perfil) {
      this.alert.warn('Campos obrigatórios', 'Preencha todos os campos corretamente.');
      return;
    }

    const body: Usuario = {
      nome,
      email,
      senha: this.id ? undefined : senha,
      perfil,
      ativo: this.ativo,
    };

    const req$ = this.id
      ? this.usuarioApi.update(this.id, body)
      : this.usuarioApi.create(body);

    req$.subscribe({
      next: () => {
        this.alert.success('Sucesso', 'Usuário salvo com sucesso!');
        this.formAlterado = false;
        this.salvarEstadoInicial();
        this.router.navigate(['/usuarios']);
      },
      error: () => this.alert.error('Erro', 'Não foi possível salvar o usuário.'),
    });
  }

  cancelar(): void {
    this.router.navigate(['/usuarios']);
  }

  private salvarEstadoInicial(): void {
    const estado = {
      nome: this.nome,
      email: this.email,
      perfil: this.perfil,
      ativo: this.ativo,
    };
    this.formOriginal = JSON.stringify(estado);
  }

  async podeSair(): Promise<boolean> {
    if (this.formAlterado) {
      const estadoAtual = {
        nome: this.nome,
        email: this.email,
        perfil: this.perfil,
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
