import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { Utilisateur, RoleNom } from '../../../models/utilisateur.model';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="p-6">
      <div class="flex items-center justify-between mb-8 animate-fade-in">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Gestion des Utilisateurs</h1>
        <button routerLink="/admin/users/create" class="flex items-center px-4 py-2 bg-gradient-to-r from-primary to-accent text-white rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300">
          <span class="material-icons mr-2">person_add</span>
          Ajouter un utilisateur
        </button>
      </div>

      <!-- Filters & Search -->
      <div class="glass-card p-6 mb-8 animate-slide-up">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="relative">
            <span class="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
              <span class="material-icons text-sm">search</span>
            </span>
            <input type="text" [(ngModel)]="searchTerm" (ngModelChange)="onFilterChange()" 
                   placeholder="Rechercher par nom ou email..." class="input-field pl-10" />
          </div>
          
          <div class="relative">
            <select [(ngModel)]="roleFilter" (ngModelChange)="onFilterChange()" class="input-field appearance-none">
              <option value="">Tous les rôles</option>
              <option [value]="RoleNom.ADMIN">ADMIN</option>
              <option [value]="RoleNom.CHEF_PROJET">CHEF_PROJET</option>
              <option [value]="RoleNom.PILOTE_QUALITE">PILOTE_QUALITE</option>
            </select>
          </div>
        </div>
      </div>

      <!-- Users Table -->
      <div class="glass-card overflow-hidden animate-slide-up animation-delay-500">
        <div class="overflow-x-auto">
          <table class="w-full text-left">
            <thead class="bg-gray-50/50 dark:bg-gray-800/50">
              <tr>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Utilisateur</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Rôle</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-100 dark:divide-gray-700">
              <tr *ngFor="let user of users" class="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center">
                    <div class="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                      {{ user.nom[0] || user.email[0] | uppercase }}
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-gray-900 dark:text-gray-100">{{ user.nom }} {{ user.prenom }}</div>
                      <div class="text-sm text-gray-500">{{ user.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4">
                  <span class="px-2 py-1 text-xs rounded-full font-medium"
                        [ngClass]="{
                          'bg-purple-100 text-purple-700': getUserRole(user) === RoleNom.ADMIN,
                          'bg-blue-100 text-blue-700': getUserRole(user) === RoleNom.CHEF_PROJET,
                          'bg-green-100 text-green-700': getUserRole(user) === RoleNom.PILOTE_QUALITE
                        }">
                    {{ getUserRole(user) }}
                  </span>
                </td>
                <td class="px-6 py-4">
                  <span class="flex items-center">
                    <span class="h-2 w-2 rounded-full mr-2" [class.bg-green-500]="user.actif" [class.bg-red-500]="!user.actif"></span>
                    <span class="text-sm text-gray-700 dark:text-gray-300">{{ user.actif ? 'Actif' : 'Inactif' }}</span>
                  </span>
                </td>
                <td class="px-6 py-4">
                  <div class="flex space-x-2">
                    <button (click)="toggleUserStatus(user)" class="p-2 text-gray-400 hover:text-primary transition-colors">
                      <span class="material-icons text-xl">{{ user.actif ? 'block' : 'check_circle' }}</span>
                    </button>
                    <button (click)="deleteUser(user)" class="p-2 text-gray-400 hover:text-red-500 transition-colors">
                      <span class="material-icons text-xl">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `
})
export class UserListComponent implements OnInit {
  userService = inject(UserService);
  toastr = inject(ToastrService);
  RoleNom = RoleNom;

  users: Utilisateur[] = [];
  searchTerm = '';
  roleFilter = '';

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.userService.getAllUsers(0, 100, this.searchTerm, this.roleFilter).subscribe({
      next: (res) => this.users = res || []
    });
  }

  onFilterChange() {
    this.loadUsers();
  }

  toggleUserStatus(user: Utilisateur) {
    if (!user.id) return;
    this.userService.toggleStatus(user.id).subscribe({
      next: (updated) => {
        user.actif = updated.actif;
        this.toastr.success(`Statut mis à jour pour ${user.email}`);
      }
    });
  }

  deleteUser(user: Utilisateur) {
    if (!user.id || !confirm('Supprimer cet utilisateur ?')) return;
    this.userService.deleteUser(user.id).subscribe({
      next: () => {
        this.users = this.users.filter(u => u.id !== user.id);
        this.toastr.success('Utilisateur supprimé');
      }
    });
  }

  getUserRole(user: Utilisateur): string {
    if (user.role?.nomRole) return user.role.nomRole;
    if (user.roles && user.roles.length > 0) return user.roles[0].nomRole;
    return 'N/A';
  }
}
