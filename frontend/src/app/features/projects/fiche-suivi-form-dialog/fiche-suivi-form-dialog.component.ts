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

  ficheForm = this.fb.group({
    sujet: ['', Validators.required],
    avancement: [0, [Validators.required, Validators.min(0), Validators.max(100)]],
    problemes: [''],
    decisions: [''],
    indicateurs: [''],
    observations: ['']
  });

  constructor(@Inject(MAT_DIALOG_DATA) public data: { project: Projet, ficheToEdit?: any }) {
    if (data.ficheToEdit) {
      this.ficheForm.patchValue(data.ficheToEdit);
    }
  }

  onSave() {
    if (this.ficheForm.valid) {
      this.dialogRef.close(this.ficheForm.value);
    }
  }

  onCancel() {
    this.dialogRef.close();
  }
}
