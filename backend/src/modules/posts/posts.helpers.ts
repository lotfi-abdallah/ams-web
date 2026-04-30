import { pool } from "../../config/postgres";
import { Compte } from "../../types/Compte";
import { Post } from "./posts.model";

type UserPreview = Pick<Compte, "id" | "pseudo" | "nom" | "prenom" | "avatar">;

const getUsersMapByIds = async (
  userIds: number[],
): Promise<Map<number, UserPreview>> => {
  const uniqueUserIds = [
    ...new Set(userIds.filter((id) => Number.isInteger(id))),
  ];

  if (uniqueUserIds.length === 0) {
    return new Map<number, UserPreview>();
  }

  const result = await pool.query<UserPreview>(
    `
      SELECT id, pseudo, nom, prenom, avatar
      FROM fredouil.compte
      WHERE id = ANY($1::int[])
    `,
    [uniqueUserIds],
  );

  return new Map(result.rows.map((user) => [user.id, user]));
};

const collectUserIds = (posts: any[]): number[] =>
  posts.flatMap((post) => {
    const commentUserIds = Array.isArray(post?.comments)
      ? post.comments
          .map((comment: any) => comment?.commentedBy)
          .filter((id: unknown): id is number => typeof id === "number")
      : [];

    const postAuthorId =
      typeof post?.createdBy === "number" ? [post.createdBy] : [];

    return [...postAuthorId, ...commentUserIds];
  });

const attachUsers = (post: any, usersMap: Map<number, UserPreview>): any => ({
  ...post,
  createdByUser:
    typeof post?.createdBy === "number"
      ? (usersMap.get(post.createdBy) ?? null)
      : null,
  comments: Array.isArray(post?.comments)
    ? post.comments.map((comment: any) => ({
        ...comment,
        commentedByUser:
          typeof comment?.commentedBy === "number"
            ? (usersMap.get(comment.commentedBy) ?? null)
            : null,
      }))
    : [],
});

export const enrichPostsWithUsers = async (posts: any[]): Promise<any[]> => {
  const sharedIds = posts
    .map((post) => post?.shared)
    .filter((id: unknown) => id != null)
    .map((id: any) => id.toString());

  const sharedPostsMap = new Map<string, any>();
  if (sharedIds.length > 0) {
    const sharedDocs = await Post.find({ _id: { $in: sharedIds } }).lean();
    const sharedUsersMap = await getUsersMapByIds(collectUserIds(sharedDocs));
    for (const doc of sharedDocs) {
      sharedPostsMap.set(
        (doc._id as any).toString(),
        attachUsers(doc, sharedUsersMap),
      );
    }
  }

  const usersMap = await getUsersMapByIds(collectUserIds(posts));

  return posts.map((post) => {
    const enriched = attachUsers(post, usersMap);
    if (post?.shared != null) {
      enriched.sharedPost =
        sharedPostsMap.get(post.shared.toString()) ?? null;
    }
    return enriched;
  });
};

export const enrichPostWithUsers = async (post: any): Promise<any> => {
  const [enrichedPost] = await enrichPostsWithUsers([post]);
  return enrichedPost;
};
