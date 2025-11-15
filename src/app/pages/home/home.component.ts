// src/app/pages/home/home.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from '../../shared/components/header/header.component';
import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit {
  private auth = inject(AuthService);

  usuarioNome = '';
  ultimoAcesso = new Date();

  ngOnInit(): void {
    const usuario = this.auth.getUsuario();
    this.usuarioNome = usuario?.nome ?? '';
    // se quiser, poderia buscar ultimo acesso de algum lugar depois
  }
}