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

export const routes: Routes = [
  // redireciona raiz para login
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // login público
  { path: 'login', component: LoginComponent },

  // layout autenticado (Home = header + <router-outlet>)
  {
    path: '',
    component: HomeComponent,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      // início / dashboard
      { path: 'dashboard', component: DashboardComponent },
      { path: 'home', redirectTo: 'dashboard', pathMatch: 'full' },

      // PRODUTOS
      { path: 'produtos', component: ListaProdutoComponent },
      {
        path: 'produtos/novo',
        component: CadastroProdutoComponent,
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'produtos/editar/:id',
        component: CadastroProdutoComponent,
        canDeactivate: [unsavedChangesGuard],
      },

      // USUÁRIOS
      { path: 'usuarios', component: ListaUsuarioComponent },
      {
        path: 'usuarios/novo',
        component: CadastroUsuarioComponent,
        canDeactivate: [unsavedChangesGuard],
      },
      {
        path: 'usuarios/editar/:id',
        component: CadastroUsuarioComponent,
        canDeactivate: [unsavedChangesGuard],
      },

      // VENDAS
      { path: 'vendas', component: ListaVendaComponent },
      {
        path: 'vendas/novo',
        component: CadastroVendaComponent,
        canDeactivate: [unsavedChangesGuard],
      },

      // MOVIMENTAÇÕES DE ESTOQUE
      { path: 'movimentacoes', component: ListaMovimentacaoComponent },
      {
        path: 'movimentacoes/cadastro',
        component: CadastroMovimentacaoComponent,
        canDeactivate: [unsavedChangesGuard],
      },
    ],
  },

  // rota coringa
  { path: '**', redirectTo: 'login' },
];