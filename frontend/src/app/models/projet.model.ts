import { Utilisateur } from './utilisateur.model';

export interface Projet {
  id?: string;
  nomProjet: string;
  description: string;
  objectifs: string;
  dateDebut: string | Date;
  dateFinPrevue: string | Date;
  statut: string; // nomenclature label or code
  avancement?: number;
  kpiGlobal?: number;
  chefDeProjet?: { id: string; nom?: string; email?: string };
  details?: ProjectDetails;
}

export interface ProjectDetails {
  designationClient?: string;
  cadreContractuel?: string;
  caractereProjet?: string;
  typeProjet?: string;
  presentation?: string;
  historique?: string;
  perimetre?: string;
  maitreOuvrage?: string;
  maitreOeuvre?: string;
  equipeProjet?: string[];
  estimationCharges?: EstimationCharge[];
  estimationBudgets?: EstimationBudget[];
  delaisPrevisionnels?: string;
  risquesPotentiels?: string;
  preRequis?: string;
  planningActions?: PlanningAction[];
}

export interface EstimationCharge {
  prestation: string;
  profil: string;
  periode: string;
  chargeHM: string;
  livrables: string;
}

export interface EstimationBudget {
  profil: string;
  chargeProfil: string;
  budget: string;
}

export interface PlanningAction {
  action: string;
  profil: string;
  chargeHM: string;
  mois: number[];
}

export interface FicheProjet {
  id?: string;
  dateCreation: string | Date;
  responsableId?: string;
  documents?: string[];
  nomProjet: string;
  description: string;
  objectifs: string;
  responsable: string;
  echeances: string;
  statut: string;
}

export interface FicheSuivi {
  id?: string;
  dateSaisie: string | Date | null;
  avancement: number | null;
  problemes: string | null;
  decisions: string | null;
  indicateurs: string | null;
  sujet?: string | null;
  observations?: string | null;
  statut?: string | null;
  ficheProjet?: FicheProjet; // Added for frontend convenience if joined
}
