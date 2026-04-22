import { Request, Response } from "express";
import { Post } from "./posts.model";
import { enrichPostWithUsers, enrichPostsWithUsers } from "./posts.helpers";

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

    const sortParam = String(req.query.sort || "newest");
    const hashtagParam = req.query.hashtag ? String(req.query.hashtag).trim() : null;
    const authorParam = req.query.author ? Number(req.query.author) : null;

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest:    { _id: -1 },
      oldest:    { _id: 1  },
      mostLiked: { likes: -1 },
    };
    const sortOrder = sortMap[sortParam] ?? sortMap["newest"];

    const filter: Record<string, unknown> = {};
    if (hashtagParam) {
      filter.hashtags = { $regex: new RegExp(`^${hashtagParam}$`, "i") };
    }
    if (authorParam && Number.isInteger(authorParam)) {
      filter.createdBy = authorParam;
    }

    const [posts, totalPosts] = await Promise.all([
      Post.find(filter).sort(sortOrder).skip(skip).limit(limit).lean(),
      Post.countDocuments(filter),
    ]);
    const enrichedPosts = await enrichPostsWithUsers(posts as any[]);

    const totalPages = Math.ceil(totalPosts / limit);

    res.status(200).json({
      data: enrichedPosts,
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
    const post = await Post.findById(id).lean();

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const enrichedPost = await enrichPostWithUsers(post);

    res.status(200).json(enrichedPost);
  } catch (error) {
    res.status(500).json({ message: "Error fetching post", error });
  }
};

/**
 * @route POST /api/posts
 * Créer un nouveau post
 * - body: contenu du post (obligatoire)
 * - imageUrl: URL de l'image (optionnel)
 * - imageTitle: titre de l'image (optionnel)
 * - hashtags: liste de hashtags (optionnel)
 *
 * Réponse: Détails du post créé ou message d'erreur en cas de problème lors de la création
 */
export const createPost = async (req: Request, res: Response) => {
  try {
    const { body, imageUrl, imageTitle, hashtags } = req.body;
    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!body || typeof body !== "string" || !body.trim()) {
      return res.status(400).json({ message: "body is required" });
    }

    const normalizedHashtags = Array.isArray(hashtags)
      ? hashtags
          .filter((tag): tag is string => typeof tag === "string")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : [];

    const normalizedImageUrl =
      typeof imageUrl === "string" ? imageUrl.trim() : "";
    const normalizedImageTitle =
      typeof imageTitle === "string" ? imageTitle.trim() : "";

    const now = new Date();
    const date = now.toISOString().slice(0, 10);
    const hour = `${String(now.getHours()).padStart(2, "0")}:${String(
      now.getMinutes(),
    ).padStart(2, "0")}`;

    const newPost = new Post({
      body: body.trim(),
      createdBy: userId,
      images:
        normalizedImageUrl && normalizedImageTitle
          ? { url: normalizedImageUrl, title: normalizedImageTitle }
          : undefined,
      hashtags: [...new Set(normalizedHashtags)],
      likes: 0,
      likedBy: [],
      comments: [],
      date,
      hour,
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

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (post.likedBy.includes(userId)) {
      return res
        .status(400)
        .json({ message: "Post already liked by this user" });
    }

    post.likedBy.push(userId);
    post.likes = post.likedBy.length;
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

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!post.likedBy.includes(userId)) {
      return res.status(400).json({ message: "Post not liked by this user" });
    }

    post.likedBy = post.likedBy.filter((like) => like !== userId);
    post.likes = post.likedBy.length;
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
    const rawText = typeof req.body?.text === "string" ? req.body.text : "";
    const text = rawText.trim();

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const userId = req.session.user?.id;

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
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

    post.comments.push(newComment);
    await post.save();

    const enrichedPost = await enrichPostWithUsers(post.toObject() as any);
    res.status(200).json({ message: "Comment added successfully", post: enrichedPost });
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

    if (!userId) {
      return res.status(401).json({ message: "User not authenticated" });
    }

    const { id: postId, commentId } = req.params;

    const post = await Post.findById(postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const comment = post.comments.find((c) => c._id?.toString() === commentId);

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.commentedBy !== userId && post.createdBy !== userId) {
      return res
        .status(403)
        .json({ message: "User not authorized to delete this comment" });
    }

    post.comments = post.comments.filter(
      (c) => c._id?.toString() !== commentId,
    );
    await post.save();

    const enrichedPost = await enrichPostWithUsers(post.toObject() as any);
    res.status(200).json({ message: "Comment deleted successfully", post: enrichedPost });
  } catch (error) {
    res.status(500).json({ message: "Error deleting comment", error });
  }
};
