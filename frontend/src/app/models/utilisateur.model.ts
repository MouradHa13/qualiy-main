export enum RoleNom {
  ADMIN = 'ADMIN',
  CHEF_PROJET = 'CHEF_PROJET',
  PILOTE_QUALITE = 'PILOTE_QUALITE'
}

export interface Role {
  id?: string;
  nomRole: RoleNom;
  permissions?: string[];
}

export interface Utilisateur {
  id?: string;
  nom: string;
  prenom: string;
  email: string;
  motDePasse?: string;
   role?: Role;
   roles?: Role[];
  actif: boolean;
  dateCreation?: Date;
}

export interface AuthResponse {
  token: string;
  type: string;
  id: string;
  email: string;
  roles: string[]; // Backend returns a string array of roles
}

export interface Nomenclature {
  id?: string;
  nomStructure: string;
  typeStructure: string; // ROLE, STATUT, ETAPE, etc.
  description: string;
  parent?: string;
  actif: boolean;
}

export interface FicheSuivi {
  id?: string;
  projetNom?: string;
  dateSaisie: string;
  avancement: number;
  problemes: string;
  decisions: string;
  indicateurs: string;
}
