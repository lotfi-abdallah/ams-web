import { Schema, Document, model } from "mongoose";

interface Comment {
  text: string;
  commentedBy: number;
  date: string;
  hour: string;
  _id?: Schema.Types.ObjectId;
}

interface PostImage {
  url: string;
  title: string;
}

interface IPost extends Document {
  date: string;
  hour: string;
  body: string;
  createdBy: number;
  images?: PostImage;
  likes: number;
  likedBy: number[];
  hashtags: string[];
  comments: Comment[];
  shared?: Schema.Types.ObjectId | null;
}

const getCurrentDate = () => new Date().toISOString().slice(0, 10);

const getCurrentHour = () => {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
};

const commentSchema = new Schema<Comment>({
  text: { type: String, required: true },
  commentedBy: { type: Number, required: true },
  date: { type: String, default: getCurrentDate },
  hour: { type: String, default: getCurrentHour },
});

const imageSchema = new Schema<PostImage>(
  {
    url: { type: String, required: true },
    title: { type: String, required: true },
  },
  { _id: false },
);

const postSchema = new Schema<IPost>(
  {
    date: { type: String, default: getCurrentDate },
    hour: { type: String, default: getCurrentHour },
    body: { type: String, required: true },
    createdBy: { type: Number, required: true },
    images: { type: imageSchema, required: false },
    likes: { type: Number, default: 0 },
    likedBy: { type: [Number], default: [] },
    hashtags: { type: [String], default: [] },
    comments: { type: [commentSchema], default: [] },
    shared: { type: Schema.Types.ObjectId, ref: "Post", default: null },
  },
  { timestamps: false },
);

export const Post = model<IPost>("Post", postSchema, "CERISoNet");
