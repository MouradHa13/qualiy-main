import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Projet } from '../../../models/projet.model';

@Component({
  selector: 'app-fiche-suivi-form-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatIconModule],
  templateUrl: './fiche-suivi-form-dialog.component.html',
  styleUrls: ['./fiche-suivi-form-dialog.component.css']
})
export class FicheSuiviFormDialogComponent {
  private fb = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<FicheSuiviFormDialogComponent>);

  activeSection: 'signalement' | 'mad' | 'travaux' | 'cloture' = 'signalement';

  ficheForm = this.fb.group({
    // Compatibility fields
    sujet: [''],
    avancement: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    problemes: [''],
    decisions: [''],
    indicateurs: [''],
    observations: [''],
    statut: ['EN_COURS'],

    // Signalement
    refContractuelle: [''],
    demandeur: [''],
    natureDemande: ['ANOMALIE'], // ANOMALIE, AMELIORATION, NOUVEAU_BESOIN
    procedureConcernee: [''],
    descriptionProbleme: [''],
    piecesJointes: [''],
    visaRA: [''],

    // Diagnostic
    faisabilite: [true],
    typeVersion: ['VERSION'], // VERSION, PATCH
    versionCible: ['', Validators.required],
    commentaireDiagnostic: [''],
    estimationCharge: [''],
    estimationDelai: [''],
    decisionRMAP: [true],
    observationRMAP: [''],
    dateDecisionRMAP: [new Date().toISOString().substring(0, 10)],
    visaRMAP: [''],

    // Mise à Disposition (MAD) & Dev
    madSource: [false],
    madExecutable: [false],
    madDocumentation: [false],
    dateDemandeMAD: [''],
    dateReceptionMAD: [''],
    visaRAMAD: [''],
    dateDemandeEnvDev: [''],
    dateReelleEnvDev: [''],
    visaRAEnvDev: [''],

    // Compte Rendu (CR) Travaux & Tests
    objetCompteRendu: [''],
    comporteSource: [false],
    comporteExecutable: [false],
    comporteDocumentation: [false],
    dateDemandeEnvTest: [''],
    dateReelleEnvTest: [''],
    dateFinTravaux: [''],
    visaRACompteRendu: [''],
    visaRMAPCompteRendu: [''],

    // Clôture
    dateEnvoiPackage: [''],
    observationCloture: [''],
    visaRMAPCloture: [''],

    // Liaison
    ficheTestId: ['']
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { project: Projet, ficheToEdit?: any }) {
    if (data.ficheToEdit) {
      const mappedFiche = { ...data.ficheToEdit };
      const dateFields = [
        'dateDecisionRMAP', 'dateDemandeMAD', 'dateReceptionMAD',
        'dateDemandeEnvDev', 'dateReelleEnvDev', 'dateDemandeEnvTest',
        'dateReelleEnvTest', 'dateFinTravaux', 'dateEnvoiPackage'
      ];
      dateFields.forEach(f => {
        if (mappedFiche[f]) {
          try {
            mappedFiche[f] = new Date(mappedFiche[f]).toISOString().substring(0, 10);
          } catch (e) {
            mappedFiche[f] = '';
          }
        }
      });
      this.ficheForm.patchValue(mappedFiche);
    }
  }

  setSection(section: 'signalement' | 'mad' | 'travaux' | 'cloture') {
    this.activeSection = section;
  }

  onSave() {
    if (this.ficheForm.valid) {
      const val = this.ficheForm.value;
      // Sync compatibility fields for timeline/dashboard before closing
      val.sujet = val.objetCompteRendu || val.sujet || `Version ${val.versionCible}`;
      val.problemes = val.descriptionProbleme || val.problemes || 'Aucun problème signalé.';
      val.decisions = val.commentaireDiagnostic || val.decisions || '';
      val.observations = val.observationCloture || val.observationRMAP || val.observations || '';
      
      this.dialogRef.close(val);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
