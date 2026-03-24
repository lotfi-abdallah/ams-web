export interface User {
  id: number;
  mail: string;
  pseudo: string;
  nom: string;
  prenom: string;
  avatar: string;
  statut_connexion: number;
}

export interface Comment {
  _id?: string;
  auteur: string;
  texte: string;
  date: Date;
}

export interface Post {
  _id?: string;
  auteur: string;
  texte: string;
  likes: string[];
  image: string;
  date: Date;
  commentaires: Comment[];
  tags?: string[];
}
