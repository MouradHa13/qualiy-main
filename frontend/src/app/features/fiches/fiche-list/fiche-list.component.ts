import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FicheService } from '../../../services/fiche.service';
import { AuthService } from '../../../core/services/auth.service';
import { FicheSuivi, RoleNom } from '../../../models/utilisateur.model';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { ToastrService } from 'ngx-toastr';
import { FicheSuiviFormDialogComponent } from '../../projects/fiche-suivi-form-dialog/fiche-suivi-form-dialog.component';
import { ProjetService } from '../../../services/projet.service';

@Component({
  selector: 'app-fiche-list',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTableModule, MatDialogModule, MatButtonModule],
  templateUrl: './fiche-list.component.html'
})
export class FicheListComponent implements OnInit {
  private ficheService = inject(FicheService);
  private authService = inject(AuthService);
  private projetService = inject(ProjetService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private toastr = inject(ToastrService);

  fiches: any[] = [];
  displayedColumns: string[] = ['dateSaisie', 'projet', 'avancement', 'statut', 'actions'];
  isLoading = true;
  currentUserRole!: any;

  ngOnInit() {
    this.currentUserRole = this.authService.getCurrentUserRole();
    this.loadFiches();
  }

  loadFiches() {
    this.isLoading = true;
    const role = this.authService.getCurrentUserRole();

    if (role === RoleNom.PILOTE_QUALITE || role === RoleNom.ADMIN) {
      this.ficheService.getAllFichesSuivi().subscribe({
        next: (data) => {
          this.fiches = data;
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    } else {
      // For Chef de Projet, we could filter by their projects
      this.ficheService.getAllFichesSuivi().subscribe({
        next: (data) => {
          // In a real scenario, the backend would handle filtering or we'd filter here
          this.fiches = data; 
          this.isLoading = false;
        },
        error: () => {
          this.isLoading = false;
        }
      });
    }
  }

  getStatusColor(avancement: number): string {
    if (avancement >= 90) return 'text-green-600 bg-green-100';
    if (avancement >= 50) return 'text-blue-600 bg-blue-100';
    return 'text-orange-600 bg-orange-100';
  }

  viewDetails(fiche: any) {
    if (!fiche.projetId) return;
    const role = this.authService.getCurrentUserRole();
    if (role === RoleNom.CHEF_PROJET) {
      this.router.navigate(['/chef/projets', fiche.projetId]);
    } else {
      console.log('View details not fully implemented for role:', role);
    }
  }

  editFiche(fiche: any) {
    this.projetService.getById(fiche.projetId).subscribe(project => {
      const dialogRef = this.dialog.open(FicheSuiviFormDialogComponent, {
        width: '850px',
        maxWidth: '95vw',
        panelClass: 'modern-dialog',
        data: { project, ficheToEdit: fiche }
      });

      dialogRef.afterClosed().subscribe(result => {
        if (result && fiche.id) {
          this.ficheService.updateFicheSuivi(fiche.id, result).subscribe({
            next: () => {
              this.toastr.success('Fiche de suivi mise à jour');
              this.loadFiches();
            },
            error: () => this.toastr.error('Erreur lors de la mise à jour')
          });
        }
      });
    });
  }

  deleteFiche(ficheId: string) {
    if (confirm('Voulez-vous supprimer ce suivi ?')) {
      this.ficheService.deleteFicheSuivi(ficheId).subscribe({
        next: () => {
          this.toastr.success('Suivi supprimé');
          this.loadFiches();
        },
        error: () => this.toastr.error('Erreur lors de la suppression')
      });
    }
  }
}
