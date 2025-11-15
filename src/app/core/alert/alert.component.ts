import { Component } from '@angular/core';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-alert',
  standalone: true,
  templateUrl: './alert.component.html',
  styleUrls: ['./alert.component.scss']
})
export class AlertComponent {

  /** Exemplo de uso de Toast manual (opcional) */
  showToast(message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') {
    Swal.fire({
      toast: true,
      position: 'top-end',
      icon: type,
      title: message,
      showConfirmButton: false,
      timer: 3000,
      timerProgressBar: true
    });
  }
}
