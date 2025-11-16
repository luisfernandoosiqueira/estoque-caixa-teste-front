// src/app/app.routes.ts
import { Routes } from '@angular/router';

// Páginas principais
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';

// Produtos
import { ListaProdutoComponent } from './pages/produtos/lista-produto/lista-produto.component';
import { CadastroProdutoComponent } from './pages/produtos/cadastro-produto/cadastro-produto.component';

// Usuários
import { ListaUsuarioComponent } from './pages/usuarios/lista-usuario/lista-usuario.component';
import { CadastroUsuarioComponent } from './pages/usuarios/cadastro-usuario/cadastro-usuario.component';

// Vendas
import { ListaVendaComponent } from './pages/vendas/lista-venda/lista-venda.component';
import { CadastroVendaComponent } from './pages/vendas/cadastro-venda/cadastro-venda.component';

// Movimentações
import { ListaMovimentacaoComponent } from './pages/movimentacoes/lista-movimentacao/lista-movimentacao.component';
import { CadastroMovimentacaoComponent } from './pages/movimentacoes/cadastro-movimentacao/cadastro-movimentacao.component';

// Guards
import { authGuard } from './core/auth/auth.guard';
import { unsavedChangesGuard } from './core/auth/unsaved-changes.guard';
import { adminGuard } from './core/auth/admin.guard';
import { caixaGuard } from './core/auth/caixa.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },

  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      { path: 'dashboard', component: DashboardComponent },
      { path: 'home', redirectTo: 'dashboard', pathMatch: 'full' },

      // PRODUTOS (somente ADMIN)
      {
        path: 'produtos',
        component: ListaProdutoComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'produtos/novo',
        component: CadastroProdutoComponent,
        canActivate: [adminGuard],
        canDeactivate: [unsavedChangesGuard]
      },
      {
        path: 'produtos/editar/:id',
        component: CadastroProdutoComponent,
        canActivate: [adminGuard],
        canDeactivate: [unsavedChangesGuard]
      },

      // USUÁRIOS (somente ADMIN)
      {
        path: 'usuarios',
        component: ListaUsuarioComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'usuarios/novo',
        component: CadastroUsuarioComponent,
        canActivate: [adminGuard],
        canDeactivate: [unsavedChangesGuard]
      },
      {
        path: 'usuarios/editar/:id',
        component: CadastroUsuarioComponent,
        canActivate: [adminGuard],
        canDeactivate: [unsavedChangesGuard]
      },

      // VENDAS / CAIXA (ADMIN + OPERADOR)
      {
        path: 'vendas',
        component: ListaVendaComponent,
        canActivate: [caixaGuard]
      },
      {
        path: 'vendas/novo',
        component: CadastroVendaComponent,
        canActivate: [caixaGuard],
        canDeactivate: [unsavedChangesGuard]
      },

      // MOVIMENTAÇÕES DE ESTOQUE (somente ADMIN)
      {
        path: 'movimentacoes',
        component: ListaMovimentacaoComponent,
        canActivate: [adminGuard]
      },
      {
        path: 'movimentacoes/cadastro',
        component: CadastroMovimentacaoComponent,
        canActivate: [adminGuard],
        canDeactivate: [unsavedChangesGuard]
      }
    ]
  },

  { path: '**', redirectTo: 'login' }
];
