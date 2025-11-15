import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon, SweetAlertResult } from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {

  /** Alerta genérico */
  show(
    title: string,
    text: string,
    icon: SweetAlertIcon = 'info'
  ): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title,
      text,
      icon,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3085d6'
    });
  }

  /** Sucesso ✅ */
  success(title: string, text: string): Promise<SweetAlertResult<any>> {
    return this.show(title, text, 'success');
  }

  /** Aviso ⚠️ */
  warn(title: string, text: string): Promise<SweetAlertResult<any>> {
    return this.show(title, text, 'warning');
  }

  /** Erro ❌ */
  error(title: string, text: string): Promise<SweetAlertResult<any>> {
    return this.show(title, text, 'error');
  }

  /** Confirmação ✅❌ */
  confirm(title: string, text: string): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      title,
      text,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Sim',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33'
    });
  }

  /** Toast (mensagem rápida no canto da tela) */
  toast(
    message: string,
    icon: SweetAlertIcon = 'info',
    timer = 2500
  ): Promise<SweetAlertResult<any>> {
    return Swal.fire({
      toast: true,
      position: 'top-end',
      icon,
      title: message,
      showConfirmButton: false,
      timer,
      timerProgressBar: true
    });
  }
}
