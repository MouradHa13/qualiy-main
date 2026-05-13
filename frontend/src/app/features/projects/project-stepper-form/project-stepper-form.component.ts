import { Component, EventEmitter, Output, Input, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonModule } from '@angular/material/button';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTableModule } from '@angular/material/table';
import { Projet } from '../../../models/projet.model';

@Component({
  selector: 'app-project-stepper-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatStepperModule,
    MatButtonModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    MatCheckboxModule,
    MatTableModule
  ],
  templateUrl: './project-stepper-form.component.html',
  styleUrls: ['./project-stepper-form.component.css']
})
export class ProjectStepperFormComponent implements OnInit {
  private fb = inject(FormBuilder);

  @Input() projectToEdit?: Projet;
  @Output() submitted = new EventEmitter<Projet>();
  @Output() cancelled = new EventEmitter<void>();

  // Main Form Group
  projectForm = this.fb.group({
    id: [''],
    // Step 1: General & Identification
    nomProjet: ['', Validators.required],
    objectifs: [''],
    designationClient: [''],
    cadreContractuel: ['Convention en cours'],
    caractereProjet: ['National'],
    typeProjet: ['Nouveau'],
    dateDebut: [new Date().toISOString().substring(0, 10), Validators.required],
    dateFinPrevue: [new Date().toISOString().substring(0, 10), Validators.required],
    
    // Step 2: Content
    presentation: [''],
    historique: [''],
    perimetre: [''],
    
    // Step 3: Organisation
    maitreOuvrage: [''],
    maitreOeuvre: [''],
    equipeProjet: this.fb.array([this.fb.control('')]),
    
    // Step 4: Estimations
    estimationCharges: this.fb.array([]),
    estimationBudgets: this.fb.array([]),
    
    // Step 5: Planning & Risks
    delaisPrevisionnels: [''],
    risquesPotentiels: [''],
    preRequis: [''],
    planningActions: this.fb.array([])
  });

  ngOnInit() {
    if (this.projectToEdit) {
      this.projectForm.patchValue({
        id: this.projectToEdit.id || '',
        nomProjet: this.projectToEdit.nomProjet,
        objectifs: this.projectToEdit.objectifs,
        designationClient: this.projectToEdit.details?.designationClient,
        cadreContractuel: this.projectToEdit.details?.cadreContractuel,
        caractereProjet: this.projectToEdit.details?.caractereProjet,
        typeProjet: this.projectToEdit.details?.typeProjet,
        dateDebut: this.formatDate(this.projectToEdit.dateDebut),
        dateFinPrevue: this.formatDate(this.projectToEdit.dateFinPrevue),
        presentation: this.projectToEdit.details?.presentation,
        historique: this.projectToEdit.details?.historique,
        perimetre: this.projectToEdit.details?.perimetre,
        maitreOuvrage: this.projectToEdit.details?.maitreOuvrage,
        maitreOeuvre: this.projectToEdit.details?.maitreOeuvre,
        delaisPrevisionnels: this.projectToEdit.details?.delaisPrevisionnels,
        risquesPotentiels: this.projectToEdit.details?.risquesPotentiels,
        preRequis: this.projectToEdit.details?.preRequis
      });

      // Patch FormArrays
      if (this.projectToEdit.details?.equipeProjet) {
        this.equipeProjet.clear();
        this.projectToEdit.details.equipeProjet.forEach(m => this.equipeProjet.push(this.fb.control(m)));
      }
      if (this.projectToEdit.details?.estimationCharges) {
        this.estimationCharges.clear();
        this.projectToEdit.details.estimationCharges.forEach(c => this.estimationCharges.push(this.fb.group(c)));
      }
      if (this.projectToEdit.details?.estimationBudgets) {
        this.estimationBudgets.clear();
        this.projectToEdit.details.estimationBudgets.forEach(b => this.estimationBudgets.push(this.fb.group(b)));
      }
      if (this.projectToEdit.details?.planningActions) {
        this.planningActions.clear();
        this.projectToEdit.details.planningActions.forEach(a => this.planningActions.push(this.fb.group(a)));
      }
    }
  }

  private formatDate(date: any): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toISOString().substring(0, 10);
  }

  // Getters for FormArrays
  get equipeProjet() { return this.projectForm.get('equipeProjet') as FormArray; }
  get estimationCharges() { return this.projectForm.get('estimationCharges') as FormArray; }
  get estimationBudgets() { return this.projectForm.get('estimationBudgets') as FormArray; }
  get planningActions() { return this.projectForm.get('planningActions') as FormArray; }

  // Array Management
  addEquipeMember() { this.equipeProjet.push(this.fb.control('')); }
  removeEquipeMember(index: number) { this.equipeProjet.removeAt(index); }

  addEstimationCharge() {
    this.estimationCharges.push(this.fb.group({
      prestation: [''],
      profil: [''],
      periode: [''],
      chargeHM: [''],
      livrables: ['']
    }));
  }
  removeEstimationCharge(index: number) { this.estimationCharges.removeAt(index); }

  addEstimationBudget() {
    this.estimationBudgets.push(this.fb.group({
      profil: [''],
      chargeProfil: [''],
      budget: ['']
    }));
  }
  removeEstimationBudget(index: number) { this.estimationBudgets.removeAt(index); }

  addPlanningAction() {
    this.planningActions.push(this.fb.group({
      action: [''],
      profil: [''],
      chargeHM: [''],
      mois: []
    }));
  }
  removePlanningAction(index: number) { this.planningActions.removeAt(index); }
  
  isMonthSelected(index: number, month: number): boolean {
    const mois = this.planningActions.at(index).get('mois')?.value;
    return Array.isArray(mois) && mois.includes(month);
  }

  toggleMonth(index: number, month: number) {
    const moisControl = this.planningActions.at(index).get('mois');
    let currentMois = [...(moisControl?.value || [])];
    if (currentMois.includes(month)) {
      currentMois = currentMois.filter(m => m !== month);
    } else {
      currentMois.push(month);
    }
    moisControl?.setValue(currentMois);
  }

  onSubmit() {
    if (this.projectForm.valid) {
      const val = this.projectForm.value;
      const projet: Projet = {
        id: val.id || undefined,
        nomProjet: val.nomProjet!,
        description: val.presentation || '',
        objectifs: val.objectifs || '',
        dateDebut: new Date(val.dateDebut!),
        dateFinPrevue: new Date(val.dateFinPrevue!),
        statut: this.projectToEdit?.statut || 'NOUVEAU',
        details: {
          designationClient: val.designationClient || '',
          cadreContractuel: val.cadreContractuel || '',
          caractereProjet: val.caractereProjet || '',
          typeProjet: val.typeProjet || '',
          presentation: val.presentation || '',
          historique: val.historique || '',
          perimetre: val.perimetre || '',
          maitreOuvrage: val.maitreOuvrage || '',
          maitreOeuvre: val.maitreOeuvre || '',
          equipeProjet: (val.equipeProjet as string[]).filter(v => !!v) || [],
          estimationCharges: (val.estimationCharges as any[]) || [],
          estimationBudgets: (val.estimationBudgets as any[]) || [],
          delaisPrevisionnels: val.delaisPrevisionnels || '',
          risquesPotentiels: val.risquesPotentiels || '',
          preRequis: val.preRequis || '',
          planningActions: (val.planningActions as any[]).map(a => ({...a, mois: a.mois || []})) || []
        }
      };
      this.submitted.emit(projet);
    }
  }

  onCancel() {
    this.cancelled.emit();
  }
}
