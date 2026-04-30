export interface UserConnectedPayload {
  id: number;
  pseudo: string;
  nom: string;
  prenom: string;
  avatar: string;
}

export interface UserDisconnectedPayload {
  id: number;
  pseudo: string;
}

export interface PostNotificationPayload {
  postId: string;
  by: { id: number; pseudo: string };
}
