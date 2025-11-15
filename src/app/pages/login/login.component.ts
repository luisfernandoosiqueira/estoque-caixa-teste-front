import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { AuthService } from '../../core/auth/auth.service';
import { AlertService } from '../../core/alert/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, CardModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  email = '';
  senha = '';

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alert = inject(AlertService);
  private auth = inject(AuthService);

  private redirectUrl: string | null = null;

  ngOnInit(): void {
    // Se veio de uma rota protegida, mostra aviso
    this.mostrarAlertaSeNaoAutenticado(this.route.snapshot.queryParamMap);

    // Atualiza caso haja mudança de query params
    this.route.queryParamMap.subscribe((p) => {
      this.redirectUrl = p.get('redirect');
      this.mostrarAlertaSeNaoAutenticado(p);
    });
  }

  private mostrarAlertaSeNaoAutenticado(p: ParamMap): void {
    const authError = p.get('authError');
    if (authError) {
      setTimeout(() => {
        this.alert.warn('Acesso negado', 'Faça login para continuar.');
      }, 200);
    }
  }

  logar(): void {
    if (!this.email.trim() || !this.senha.trim()) {
      this.alert.warn('Campos obrigatórios', 'Preencha e-mail e senha.');
      return;
    }

    const sucesso = this.auth.login(this.email.trim(), this.senha.trim());

    if (sucesso) {
      this.alert.success('Bem-vindo!', 'Login realizado com sucesso.');
      const destino = this.redirectUrl || '/home';
      this.router.navigateByUrl(destino);
    } else {
      this.alert.error('Erro', 'E-mail ou senha inválidos.');
    }
  }
}
