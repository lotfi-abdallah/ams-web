import { Request, Response } from "express";
import { Post } from "../posts.model";
import { enrichPostWithUsers } from "../posts.helpers";
import { getSocket } from "../../../config/socket";

export const addComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rawText = typeof req.body?.text === "string" ? req.body.text : "";
    const text = rawText.trim();

    const userId = req.session.user!.id;

    if (!text) {
      return res
        .status(400)
        .json({ message: "Le texte du commentaire est obligatoire." });
    }

    const now = new Date();
    const commentDate = now.toISOString().slice(0, 10);
    const commentHour = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;

    const newComment = {
      text,
      commentedBy: userId,
      date: commentDate,
      hour: commentHour,
    };

    const updatedPost = await Post.findByIdAndUpdate(
      id,
      { $push: { comments: newComment } },
      { new: true, runValidators: false },
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post introuvable." });
    }

    if (updatedPost.createdBy !== userId) {
      getSocket()
        .to(`user:${updatedPost.createdBy}`)
        .emit("post:commented", {
          postId: updatedPost._id.toString(),
          by: { id: userId, pseudo: req.session.user!.username },
        });
    }

    const enrichedPost = await enrichPostWithUsers(updatedPost.toObject() as any);
    res
      .status(200)
      .json({ message: "Commentaire ajouté avec succès.", post: enrichedPost });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de l'ajout du commentaire.", error });
  }
};

export const updateComment = async (req: Request, res: Response) => {
  try {
    const userId = req.session.user!.id;
    const { id: postId, commentIndex: commentIndexParam } = req.params;
    const rawText = typeof req.body?.text === "string" ? req.body.text : "";
    const text = rawText.trim();

    if (!text) {
      return res.status(400).json({ message: "Le texte du commentaire est obligatoire." });
    }

    const index = Number(commentIndexParam);
    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({ message: "Index de commentaire invalide." });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post introuvable." });
    }

    const comment = post.comments[index];

    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable." });
    }

    if (comment.commentedBy !== userId) {
      return res.status(403).json({ message: "Non autorisé à modifier ce commentaire." });
    }

    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: { [`comments.${index}.text`]: text } },
      { new: true, runValidators: false },
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post introuvable." });
    }

    const enrichedPost = await enrichPostWithUsers(updatedPost.toObject() as any);
    res.status(200).json({ message: "Commentaire modifié avec succès.", post: enrichedPost });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la modification du commentaire.", error });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = req.session.user!.id;
    const { id: postId, commentIndex: commentIndexParam } = req.params;

    const index = Number(commentIndexParam);
    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({ message: "Index de commentaire invalide." });
    }

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post introuvable." });
    }

    const comment = post.comments[index];

    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable." });
    }

    if (comment.commentedBy !== userId && post.createdBy !== userId) {
      return res
        .status(403)
        .json({ message: "Non autorisé à supprimer ce commentaire." });
    }

    post.comments.splice(index, 1);
    const updatedPost = await Post.findByIdAndUpdate(
      postId,
      { $set: { comments: post.comments } },
      { new: true, runValidators: false },
    );

    if (!updatedPost) {
      return res.status(404).json({ message: "Post introuvable." });
    }

    const enrichedPost = await enrichPostWithUsers(updatedPost.toObject() as any);
    res.status(200).json({
      message: "Commentaire supprimé avec succès.",
      post: enrichedPost,
    });
  } catch (error) {
    res.status(500).json({
      message: "Erreur lors de la suppression du commentaire.",
      error,
    });
  }
};
