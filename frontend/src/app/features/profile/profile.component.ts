import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { UserService } from '../../services/user.service';
import { ToastrService } from 'ngx-toastr';
import { MatIconModule } from '@angular/material/icon';
import { Utilisateur } from '../../models/utilisateur.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatIconModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  private fb = inject(FormBuilder);
  private authService = inject(AuthService);
  private userService = inject(UserService);
  private toastr = inject(ToastrService);

  profileForm: FormGroup = this.fb.group({
    nom: ['', Validators.required],
    prenom: [''],
    email: [{ value: '', disabled: true }],
    structure: ['']
  });

  currentUser: Utilisateur | null = null;
  isEditing = false;
  isLoading = false;

  ngOnInit() {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          nom: user.nom || '',
          prenom: user.prenom || '',
          email: user.email || '',
          structure: (user as any).structure?.nomStructure || 'N/A'
        });
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
    if (!this.isEditing) {
      this.ngOnInit(); // Reset form
    }
  }

  saveProfile() {
    if (this.profileForm.invalid || !this.currentUser?.id) return;
    
    this.isLoading = true;
    const updateData = {
      nom: this.profileForm.value.nom,
      prenom: this.profileForm.value.prenom
    };

    this.userService.updateUser(this.currentUser.id, updateData).subscribe({
      next: (updated) => {
        this.toastr.success('Profil mis à jour avec succès');
        this.isEditing = false;
        this.isLoading = false;
        // Optionally update the local behavior subject if needed
      },
      error: () => {
        this.toastr.error('Erreur lors de la mise à jour du profil');
        this.isLoading = false;
      }
    });
  }
}
