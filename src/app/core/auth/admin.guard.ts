import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { AlertService } from '../alert/alert.service';

export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const alert = inject(AlertService);

  const perfil = auth.getUserPerfil();

  if (perfil === 'ADMINISTRADOR') {
    return true;
  }

  alert.warn('Acesso restrito', 'Apenas administradores podem acessar esta funcionalidade.');
  router.navigate(['/home']);
  return false;
};
