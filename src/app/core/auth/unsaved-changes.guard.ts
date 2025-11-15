import { inject } from '@angular/core';
import { CanDeactivateFn } from '@angular/router';
import { AlertService } from '../alert/alert.service';

export interface CanComponentDeactivate {
  podeSair: () => boolean | Promise<boolean>;
}

export const unsavedChangesGuard: CanDeactivateFn<CanComponentDeactivate> = async (component) => {
  const alert = inject(AlertService);

  if (component.podeSair) {
    const result = component.podeSair();

    // Se o método retornar Promise<boolean>, aguardamos
    if (result instanceof Promise) return result;

    // Se retornar false, pede confirmação via SweetAlert2
    if (result === false) {
      const confirm = await alert.confirm(
        'Existem alterações não salvas.',
        'Deseja sair mesmo assim?'
      );
      return confirm.isConfirmed;
    }

    // Se retornar true → pode sair normalmente
    return result;
  }

  return true;
};
