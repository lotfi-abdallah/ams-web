import { pool } from "../../config/postgres";
import { Compte } from "../../types/Compte";

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

export const enrichPostsWithUsers = async (posts: any[]): Promise<any[]> => {
  const allUserIds = posts.flatMap((post) => {
    const commentUserIds = Array.isArray(post?.comments)
      ? post.comments
          .map((comment: any) => comment?.commentedBy)
          .filter((id: unknown): id is number => typeof id === "number")
      : [];

    const postAuthorId =
      typeof post?.createdBy === "number" ? [post.createdBy] : [];

    return [...postAuthorId, ...commentUserIds];
  });

  const usersMap = await getUsersMapByIds(allUserIds);

  return posts.map((post) => ({
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
  }));
};

export const enrichPostWithUsers = async (post: any): Promise<any> => {
  const [enrichedPost] = await enrichPostsWithUsers([post]);
  return enrichedPost;
};
