import { Component } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: '',
})
export class ConfirmDialogComponent {

  confirm(title: string, text: string) {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3B82F6',
      cancelButtonColor: '#6B7280',
      reverseButtons: true,
    });
  }

  success(title: string, text?: string) {
    return this.showAlert('success', title, text);
  }

  error(title: string, text?: string) {
    return this.showAlert('error', title, text);
  }

  warn(title: string, text?: string) {
    return this.showAlert('warning', title, text);
  }

  info(title: string, text?: string) {
    return this.showAlert('info', title, text);
  }

  private showAlert(icon: SweetAlertIcon, title: string, text?: string) {
    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3B82F6',
    });
  }
}
