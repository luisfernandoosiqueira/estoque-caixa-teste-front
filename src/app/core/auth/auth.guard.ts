import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AlertService } from '../alert/alert.service';

export const authGuard: CanActivateFn = (_route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const alert = inject(AlertService);

  if (auth.isAuthenticated()) return true;

  // Exibe aviso
  alert.warn('Acesso negado', 'Você precisa fazer login para acessar o sistema.');

  // Redireciona ao login e mantém a rota original
  router.navigate(['/login'], {
    queryParams: { redirect: state.url },
    state: { authError: true }
  });

  return false;
};
