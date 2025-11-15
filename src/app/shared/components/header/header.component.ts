import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MenubarModule } from 'primeng/menubar';
import { ButtonModule } from 'primeng/button';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../core/auth/auth.service';
import { AlertService } from '../../../core/alert/alert.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [MenubarModule, ButtonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  private router = inject(Router);
  private auth = inject(AuthService);
  private alert = inject(AlertService);

  userEmail = '';
  items: MenuItem[] = [];

  ngOnInit(): void {
    this.userEmail = this.auth.getUserEmail?.() ?? '';

    this.items = [
      { label: 'Início', icon: 'pi pi-home', routerLink: ['/home'] },
      { separator: true },
      {
        label: 'Produtos',
        icon: 'pi pi-box',
        items: [
          { label: 'Cadastro', icon: 'pi pi-plus', routerLink: ['/produtos/novo'] },
          { label: 'Lista', icon: 'pi pi-list', routerLink: ['/produtos'] },
        ],
      },
      {
        label: 'Usuários',
        icon: 'pi pi-users',
        items: [
          { label: 'Cadastro', icon: 'pi pi-user-plus', routerLink: ['/usuarios/novo'] },
          { label: 'Lista', icon: 'pi pi-list-check', routerLink: ['/usuarios'] },
        ],
      },
      {
        label: 'Vendas',
        icon: 'pi pi-shopping-cart',
        items: [
          { label: 'Nova Venda', icon: 'pi pi-cart-plus', routerLink: ['/vendas/novo'] },
          { label: 'Histórico', icon: 'pi pi-history', routerLink: ['/vendas'] },
        ],
      },
      {
        label: 'Movimentações',
        icon: 'pi pi-sync',
        items: [
          { label: 'Registrar', icon: 'pi pi-plus-circle', routerLink: ['/movimentacoes/cadastro'] },
          { label: 'Listar', icon: 'pi pi-bars', routerLink: ['/movimentacoes'] },
        ],
      },
    ];
  }

  async sair(): Promise<void> {
    const confirm = await this.alert.confirm('Deseja sair?', 'Sua sessão será encerrada.');
    if (confirm.isConfirmed) {
      this.auth.logout();
      this.alert.success('Sessão encerrada', 'Você saiu com sucesso.');
      this.router.navigate(['/login']);
    }
  }
}
