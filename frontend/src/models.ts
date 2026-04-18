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
  text: string;
  commentedBy: number;
  commentedByUser?: Pick<User, 'id' | 'pseudo' | 'nom' | 'prenom' | 'avatar'> | null;
  date: string;
  hour: string;
}

export interface PostImage {
  url: string;
  title: string;
}

export interface Post {
  _id?: string;
  date: string;
  hour: string;
  body: string;
  createdBy: number;
  createdByUser?: Pick<User, 'id' | 'pseudo' | 'nom' | 'prenom' | 'avatar'> | null;
  images?: PostImage;
  likes: number;
  likedBy: number[];
  hashtags?: string[];
  comments: Comment[];
}
