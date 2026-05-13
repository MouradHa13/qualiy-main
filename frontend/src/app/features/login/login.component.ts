import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { AuthService } from '../../core/services/auth.service';
import { Utilisateur, RoleNom } from '../../models/utilisateur.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private router = inject(Router);
  private toastr = inject(ToastrService);
  private spinner = inject(NgxSpinnerService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    rememberMe: [false]
  });

  isPasswordVisible = false;

  togglePasswordVisibility() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }

  onSubmit() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.spinner.show();
    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (user: Utilisateur) => {
        this.spinner.hide();
        this.toastr.success(`Bienvenue!`, 'Connexion réussie');
        
        const role = this.authService.getCurrentUserRole();
        console.log('Login successful, role:', role);

        if (role === RoleNom.ADMIN) {
          this.router.navigate(['/admin/dashboard']);
        } else if (role === RoleNom.CHEF_PROJET) {
          this.router.navigate(['/chef/dashboard']);
        } else if (role === RoleNom.PILOTE_QUALITE) {
          this.router.navigate(['/pilote/dashboard']);
        } else {
          this.router.navigate(['/admin/dashboard']); // Fallback
        }
      },
      error: (err: any) => {
        this.spinner.hide();
        this.toastr.error('Email ou mot de passe incorrect', 'Erreur de connexion');
      }
    });
  }
}
