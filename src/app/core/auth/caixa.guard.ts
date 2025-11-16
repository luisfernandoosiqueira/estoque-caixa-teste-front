// src/app/core/auth/caixa.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { AlertService } from '../alert/alert.service';

export const caixaGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const alert = inject(AlertService);

  const perfil = auth.getUserPerfil();

  if (perfil === 'ADMINISTRADOR' || perfil === 'OPERADOR') {
    return true;
  }

  alert.warn('Acesso restrito', 'Você não tem permissão para acessar o módulo de vendas.');
  router.navigate(['/home']);
  return false;
};
