import { Request, Response } from "express";
import { Post } from "./posts.model";

/**
 * @route GET /api/posts
 * Trouver tous les posts avec pagination
 * - page: numéro de la page (par défaut 1)
 * - limit: nombre de posts par page (par défaut 10, max 100)
 *
 * Réponse: Liste des posts avec les informations de pagination
 */
export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const [posts, totalPosts] = await Promise.all([
      Post.find().sort({ date: -1 }).skip(skip).limit(limit),
      Post.countDocuments(),
    ]);

    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      data: posts,
      pagination: {
        page,
        limit,
        totalPosts,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching posts", error });
  }
};

/**
 * @route GET /api/posts/:id
 * Trouver un post par son ID
 * - id: ID du post à trouver
 *
 * Réponse: Détails du post trouvé ou message d'erreur si le post n'existe pas
 */
export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    res.status(200).json(post);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error });
  }
};

/**
 * @route POST /api/posts
 * Créer un nouveau post
 * - texte: contenu du post (obligatoire)
 * - image: image du post (optionnel)
 * - tags: liste de tags (optionnel)
 *
 * Réponse: Détails du post créé ou message d'erreur en cas de problème lors de la création
 */
export const createPost = async (req: Request, res: Response) => {
  try {
    const { texte, image, tags } = req.body;
    const userName = req.session.user?.username;

    if (!userName) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!texte || typeof texte !== "string" || !texte.trim()) {
      return res.status(400).json({ message: "texte is required" });
    }

    const normalizedTags = Array.isArray(tags)
      ? tags
          .filter((tag): tag is string => typeof tag === "string")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    const newPost = new Post({
      auteur: userName,
      texte: texte.trim(),
      image: typeof image === "string" ? image.trim() : "",
      tags: [...new Set(normalizedTags)],
      likes: [],
      commentaires: [],
      date: new Date(),
    });
    const savedPost = await newPost.save();

    res.status(201).json(savedPost);
  } catch (error) {
    res.status(500).json({ message: "Error creating post", error });
  }
};

/**
 * @route POST /api/posts/:id/like
 * Aimer un post
 * - id: ID du post à aimer
 *
 * Réponse: Message de succès ou d'erreur en cas de problème lors de l'ajout du like
 */
export const likePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.session.user?.id;
    const userName = req.session.user?.username;

    if (!userId || !userName) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (post.likes.includes(userName)) {
      return res
        .status(400)
        .json({ message: "Post already liked by this user" });
    }

    post.likes.push(userName);
    await post.save();

    res.status(200).json({ message: "Post liked successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Error liking post", error });
  }
};

/**
 * @route POST /api/posts/:id/unlike
 * Retirer un like d'un post
 * - id: ID du post à retirer le like
 *
 * Réponse: Message de succès ou d'erreur en cas de problème lors du retrait du like
 */
export const unlikePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.session.user?.id;
    const userName = req.session.user?.username;

    if (!userId || !userName) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!post.likes.includes(userName)) {
      return res.status(400).json({ message: "Post not liked by this user" });
    }

    post.likes = post.likes.filter((like) => like !== userName);
    await post.save();

    res.status(200).json({ message: "Post unliked successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Error unliking post", error });
  }
};

/**
 * @route POST /api/posts/:id/comment
 * Ajouter un commentaire à un post
 * - id: ID du post à commenter
 * - text: texte du commentaire (obligatoire)
 *
 * Réponse: Détails du post mis à jour avec le nouveau commentaire ou message d'erreur en cas de problème lors de l'ajout du commentaire
 */
export const addComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const rawText =
      typeof req.body?.texte === "string"
        ? req.body.texte
        : typeof req.body?.text === "string"
          ? req.body.text
          : "";
    const text = rawText.trim();

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.session.user?.id;
    const userName = req.session.user?.username;

    if (!userId || !userName) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const newComment = {
      auteur: userName,
      texte: text,
      date: new Date(),
    };

    post.commentaires.push(newComment);
    await post.save();

    res.status(200).json({ message: "Comment added successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Error adding comment", error });
  }
};

/**
 * @route DELETE /api/posts/:id/comment/:commentId
 * Supprimer un commentaire d'un post
 * - id: ID du post contenant le commentaire
 * - commentId: ID du commentaire à supprimer
 *
 * Réponse: Détails du post mis à jour sans le commentaire supprimé ou message d'erreur en cas de problème lors de la suppression
 */
export const deleteComment = async (req: Request, res: Response) => {
  try {
    const userId = req.session.user?.id;
    const userName = req.session.user?.username;

    if (!userId || !userName) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { id: postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.commentaires.find(
      (c) => c._id?.toString() === commentId,
    );

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.auteur !== userName) {
      return res
        .status(403)
        .json({ message: "User not authorized to delete this comment" });
    }

    post.commentaires = post.commentaires.filter(
      (c) => c._id?.toString() !== commentId,
    );
    await post.save();

    res.status(200).json({ message: "Comment deleted successfully", post });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error });
  }
};
