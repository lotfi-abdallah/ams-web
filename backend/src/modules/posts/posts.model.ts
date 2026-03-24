import { Schema, Document, model } from "mongoose";

interface Comment {
  auteur: string;
  texte: string;
  date: Date;
  _id?: Schema.Types.ObjectId;
}

interface IPost extends Document {
  auteur: string;
  texte: string;
  likes: string[];
  image: string;
  date: Date;
  commentaires: Comment[];
}

const commentSchema = new Schema<Comment>({
  auteur: { type: String, required: true },
  texte: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const postSchema = new Schema<IPost>(
  {
    auteur: { type: String, required: true },
    texte: { type: String, required: true },
    likes: [String],
    image: String,
    date: { type: Date, default: Date.now },
    commentaires: [commentSchema],
  },
  { timestamps: false },
);

export const Post = model<IPost>("Post", postSchema);
