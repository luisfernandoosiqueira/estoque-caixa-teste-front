import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router, ParamMap } from '@angular/router';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';

import { AuthService } from '../../core/auth/auth.service';
import { AlertService } from '../../core/alert/alert.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, CardModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  loading = false;

  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private alert = inject(AlertService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  private redirectUrl: string | null = null;

  ngOnInit(): void {
    this.criarForm();
    this.mostrarAlertaSeNaoAutenticado(this.route.snapshot.queryParamMap);

    this.route.queryParamMap.subscribe((p) => {
      this.redirectUrl = p.get('redirect');
      this.mostrarAlertaSeNaoAutenticado(p);
    });
  }

  private criarForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      senha: ['', [Validators.required, Validators.minLength(3)]],
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
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      this.alert.warn('Campos obrigatórios', 'Preencha e-mail e senha corretamente.');
      return;
    }

    const { email, senha } = this.loginForm.value;

    this.loading = true;

    this.auth.login(email, senha).subscribe({
      next: (usuario) => {
        this.loading = false;
        this.alert.success('Bem-vindo!', `Login realizado com sucesso, ${usuario.nomeCompleto}.`);
        const destino = this.redirectUrl || '/home';
        this.router.navigateByUrl(destino);
      },
      error: (err) => {
        this.loading = false;
        const mensagem = err?.error?.mensagem || 'E-mail ou senha inválidos.';
        this.alert.error('Erro', mensagem);
      },
    });
  }
}
