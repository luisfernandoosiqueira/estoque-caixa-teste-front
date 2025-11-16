import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { InputTextModule } from 'primeng/inputtext';

import { AlertService } from '../../../core/alert/alert.service';
import { UsuariosService } from '../../../core/services/usuarios.service';
import { Usuario, Perfil } from '../../../core/models/usuario.model';

@Component({
  selector: 'app-lista-usuario',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    TableModule,
    ButtonModule,
    DropdownModule,
    InputTextModule,
  ],
  templateUrl: './lista-usuario.component.html',
  styleUrls: ['./lista-usuario.component.scss'],
})
export class ListaUsuarioComponent implements OnInit {
  private router = inject(Router);
  private usuarioApi = inject(UsuariosService);
  private alert = inject(AlertService);

  usuarios: Usuario[] = [];
  loading = false;

  filtroPerfil?: Perfil;
  filtroAtivo?: boolean;

  perfis = [
    { label: 'Todos', value: undefined },
    { label: 'Administrador', value: 'ADMINISTRADOR' as Perfil },
    { label: 'Operador de Caixa', value: 'OPERADOR' as Perfil },
  ];

  opcoesAtivo = [
    { label: 'Todos', value: undefined },
    { label: 'Ativos', value: true },
    { label: 'Inativos', value: false },
  ];

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.loading = true;
    this.usuarioApi.findAll().subscribe({
      next: (lista) => {
        this.usuarios = lista.filter((u) => {
          const perfilOk = !this.filtroPerfil || u.perfil === this.filtroPerfil;
          const ativoOk =
            this.filtroAtivo === undefined || u.ativo === this.filtroAtivo;
          return perfilOk && ativoOk;
        });
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.alert.error('Erro', 'Não foi possível carregar os usuários.');
      },
    });
  }

  editar(id: number): void {
    // rota de edição correta
    this.router.navigate(['/usuarios/editar', id]);
  }

  excluir(id: number): void {
    // usuário não deve ser excluído, apenas inativado
    this.alert.warn(
      'Operação não permitida',
      'Usuários não podem ser excluídos. Utilize a opção de inativar.'
    );
  }

  async inativar(id: number): Promise<void> {
    const confirm = await this.alert.confirm(
      'Inativar usuário?',
      'O usuário não poderá mais acessar o sistema.'
    );

    if (confirm.isConfirmed) {
      this.usuarioApi.inativar(id).subscribe({
        next: () => {
          this.alert.success('Sucesso', 'Usuário inativado com sucesso.');
          this.carregar();
        },
        error: () =>
          this.alert.error('Erro', 'Não foi possível inativar o usuário.'),
      });
    }
  }

  async ativar(id: number): Promise<void> {
    const confirm = await this.alert.confirm(
      'Ativar usuário?',
      'O usuário voltará a ter acesso ao sistema.'
    );

    if (confirm.isConfirmed) {
      this.usuarioApi.ativar(id).subscribe({
        next: () => {
          this.alert.success('Sucesso', 'Usuário ativado com sucesso.');
          this.carregar();
        },
        error: () =>
          this.alert.error('Erro', 'Não foi possível ativar o usuário.'),
      });
    }
  }
}
