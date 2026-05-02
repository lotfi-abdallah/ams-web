import { Request, Response } from "express";
import { Post } from "../posts.model";
import { enrichPostWithUsers, enrichPostsWithUsers } from "../posts.helpers";

export const getPosts = async (req: Request, res: Response) => {
  try {
    const page = Math.max(Number(req.query.page) || 1, 1);
    const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 100);
    const skip = (page - 1) * limit;

    const sortParam = String(req.query.sort || "newest");
    const rawHashtag = req.query.hashtag
      ? String(req.query.hashtag).trim()
      : null;
    const hashtagParam =
      rawHashtag && rawHashtag.length <= 50
        ? rawHashtag.replace(/^#/, "")
        : null;
    const authorParam = req.query.author ? Number(req.query.author) : null;
    const excludeAuthorParam = req.query.excludeAuthor
      ? Number(req.query.excludeAuthor)
      : null;
    const hideSharedParam = req.query.hideShared
      ? String(req.query.hideShared).toLowerCase()
      : "";

    const sortMap: Record<string, Record<string, 1 | -1>> = {
      newest: { _id: -1 },
      oldest: { _id: 1 },
      mostLiked: { likes: -1 },
      author: { createdBy: 1, _id: -1 },
    };
    const sortOrder = sortMap[sortParam] ?? sortMap["newest"];

    const filter: Record<string, unknown> = {};
    if (hashtagParam) {
      filter.hashtags = hashtagParam;
    }
    if (authorParam && Number.isInteger(authorParam)) {
      filter.createdBy = authorParam;
    } else if (excludeAuthorParam && Number.isInteger(excludeAuthorParam)) {
      filter.createdBy = { $ne: excludeAuthorParam };
    }
    if (
      hideSharedParam === "true" ||
      hideSharedParam === "1" ||
      hideSharedParam === "yes"
    ) {
      filter.shared = null;
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
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération des posts.", error });
  }
};

export const getPostById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id).lean();

    if (!post) {
      return res.status(404).json({ message: "Post introuvable." });
    }

    const enrichedPost = await enrichPostWithUsers(post);
    res.status(200).json(enrichedPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la récupération du post.", error });
  }
};

export const createPost = async (req: Request, res: Response) => {
  try {
    const { body, imageUrl, imageTitle, hashtags } = req.body;
    const userId = req.session.user!.id;

    if (!body || typeof body !== "string" || !body.trim()) {
      return res
        .status(400)
        .json({ message: "Le contenu du post est obligatoire." });
    }

    if (body.length > 300) {
      return res.status(400).json({
        message: "Le contenu du post ne peut pas dépasser 300 caractères.",
      });
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
    res
      .status(500)
      .json({ message: "Erreur lors de la création du post.", error });
  }
};

export const updatePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { body, imageUrl, imageTitle, hashtags } = req.body;
    const userId = req.session.user!.id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post introuvable." });
    }

    if (post.createdBy !== userId) {
      return res
        .status(403)
        .json({ message: "Non autorise a modifier ce post." });
    }

    if (!body || typeof body !== "string" || !body.trim()) {
      return res
        .status(400)
        .json({ message: "Le contenu du post est obligatoire." });
    }

    if (body.length > 300) {
      return res.status(400).json({
        message: "Le contenu du post ne peut pas dépasser 300 caractères.",
      });
    }

    const normalizedImageUrl =
      typeof imageUrl === "string" ? imageUrl.trim() : "";
    const normalizedImageTitle =
      typeof imageTitle === "string" ? imageTitle.trim() : "";

    if (
      (normalizedImageUrl && !normalizedImageTitle) ||
      (!normalizedImageUrl && normalizedImageTitle)
    ) {
      return res.status(400).json({
        message: "Renseignez l'URL et le titre de l'image ensemble.",
      });
    }

    const normalizedHashtags = Array.isArray(hashtags)
      ? hashtags
          .filter((tag): tag is string => typeof tag === "string")
          .map((tag) => tag.trim())
          .filter((tag) => tag.length > 0)
      : undefined;

    const updateFields: Record<string, any> = { body: body.trim() };
    if (normalizedHashtags) {
      updateFields.hashtags = [...new Set(normalizedHashtags)];
    }

    const updateOp: Record<string, any> = { $set: updateFields };
    if (normalizedImageUrl && normalizedImageTitle) {
      updateOp.$set.images = { url: normalizedImageUrl, title: normalizedImageTitle };
    } else {
      updateOp.$unset = { images: "" };
    }

    const updatedPostDoc = await Post.findByIdAndUpdate(id, updateOp, { new: true });
    if (!updatedPostDoc) {
      return res.status(404).json({ message: "Post introuvable." });
    }

    const enrichedPost = await enrichPostWithUsers(updatedPostDoc.toObject() as any);
    res.status(200).json(enrichedPost);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la mise a jour du post.", error });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.session.user!.id;

    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).json({ message: "Post introuvable." });
    }

    if (post.createdBy !== userId) {
      return res
        .status(403)
        .json({ message: "Non autorise a supprimer ce post." });
    }

    await post.deleteOne();

    res.status(200).json({
      message: "Post supprime avec succes.",
      postId: post._id.toString(),
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Erreur lors de la suppression du post.", error });
  }
};
