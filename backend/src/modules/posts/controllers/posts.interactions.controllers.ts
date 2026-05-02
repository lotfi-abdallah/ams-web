import { Request, Response } from "express";
import { Post } from "../posts.model";
import { enrichPostWithUsers } from "../posts.helpers";
import { getSocket } from "../../../config/socket";

export const likePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session.user!.id;
    const updatedPost = await Post.findOneAndUpdate(
      { _id: id, likedBy: { $ne: userId } },
      { $addToSet: { likedBy: userId }, $inc: { likes: 1 } },
      { new: true },
    );

    if (!updatedPost) {
      const exists = await Post.exists({ _id: id });
      if (!exists) {
        return res.status(404).json({ message: "Post introuvable." });
      }
      return res
        .status(400)
        .json({ message: "Post déjà aimé par cet utilisateur." });
    }

    if (updatedPost.createdBy !== userId) {
      getSocket()
        .to(`user:${updatedPost.createdBy}`)
        .emit("post:liked", {
          postId: updatedPost._id.toString(),
          by: { id: userId, pseudo: req.session.user!.username },
        });
    }

    res
      .status(200)
      .json({ message: "Post aimé avec succès.", post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout du like.", error });
  }
};

export const unlikePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session.user!.id;

    const updatedPost = await Post.findOneAndUpdate(
      { _id: id, likedBy: userId },
      { $pull: { likedBy: userId }, $inc: { likes: -1 } },
      { new: true },
    );

    if (!updatedPost) {
      const exists = await Post.exists({ _id: id });
      if (!exists) {
        return res.status(404).json({ message: "Post introuvable." });
      }
      return res
        .status(400)
        .json({ message: "Post non aimé par cet utilisateur." });
    }

    res
      .status(200)
      .json({ message: "Like retiré avec succès.", post: updatedPost });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du retrait du like.", error });
  }
};

export const sharePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session.user!.id;

    const rawBody = typeof req.body?.body === "string" ? req.body.body : "";
    const body = rawBody.trim();

    if (body.length < 3) {
      return res.status(400).json({
        message: "Le contenu du partage doit contenir au moins 3 caractères.",
      });
    }

    if (body.length > 300) {
      return res.status(400).json({
        message: "Le contenu du partage ne peut pas dépasser 300 caractères.",
      });
    }

    const originalPost = await Post.findById(id);

    if (!originalPost) {
      return res.status(404).json({ message: "Post original introuvable." });
    }

    if (originalPost.shared) {
      return res
        .status(400)
        .json({ message: "Impossible de partager un post déjà partagé." });
    }

    const sharedPost = new Post({
      body,
      createdBy: userId,
      shared: originalPost._id,
      likes: 0,
      likedBy: [],
      comments: [],
      hashtags: [],
    });
    const savedSharedPost = await sharedPost.save();
    const enrichedSharedPost = await enrichPostWithUsers(
      savedSharedPost.toObject() as any,
    );

    if (originalPost.createdBy !== userId) {
      getSocket()
        .to(`user:${originalPost.createdBy}`)
        .emit("post:shared", {
          postId: savedSharedPost._id.toString(),
          by: { id: userId, pseudo: req.session.user!.username },
        });
    }

    res.status(201).json(enrichedSharedPost);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors du partage du post.", error });
  }
};
