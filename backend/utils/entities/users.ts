import {UserGet, usersGetSchema, UserPost, usersPostSchema} from "../../types/users";

export const convertToUserGet = (row: unknown): UserGet => {
  return usersGetSchema.parse(row);
};

export const convertToUserPost = (values: unknown): UserPost => {
  return usersPostSchema.parse(values);
};