// type compte, as it exists in the database
export interface Compte {
  id: number;
  mail: string;
  pseudo: string;
  motpasse: string;
  nom: string;
  prenom: string;
  avatar: string;
  statut_connexion: number;
}
