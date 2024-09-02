"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { UserProps } from "../types/types";
import dbConnect from "./mongoose";
import Thread from "../models/thread.model";
import { FilterQuery, Query, SortOrder } from "mongoose";
import { Regex } from "lucide-react";

export async function updateUser({
  name,
  username,
  bio,
  id,
  image,
  path,
}: UserProps): Promise<void> {
  await dbConnect();

  try {
    await User.findOneAndUpdate(
      { id },
      {
        name,
        username: username.toLowerCase(),
        bio,
        image,
        onboarded: true,
      },
      {
        upsert: true,
      }
    );

    if (path === "/profile/edit") {
      revalidatePath(path);
    }
  } catch (error) {
    console.log(error);
  }
}

export async function fetchUser(userId: string) {
  try {
    await dbConnect();
    const user = await User.findOne({ id: userId });
    return user;
  } catch (error) {
    console.log(error);
  }
}

export async function fetchUserThreads(userId: string) {
  const threads = await User.findOne({ id: userId }).populate({
    path: "threads",
    model: Thread,
    populate: {
      path: "children",
      model: Thread,
      populate: {
        path: "author",
        model: User,
        select: "name image _id",
      },
    },
  });

  return threads;
}

export async function fetchUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  await dbConnect();
  const skipAmount = (pageNumber - 1) * pageSize;
  const regex = new RegExp(searchString, "i");
  const query: FilterQuery<typeof User> = { id: { $ne: userId } };

  if (searchString.trim() !== "") {
    query.$or = [{ username: { $regex: regex } }, { name: { $regex: regex } }];
  }

  const sortOptions = { creaatedAt: sortBy };

  const userQuery = User.find(query)
    .sort(sortOptions)
    .skip(skipAmount)
    .limit(pageSize);

  const totalUserCount = await User.countDocuments(query);

  const users = await userQuery.exec();

  const isNext = totalUserCount > skipAmount + users.length;

  return { users, isNext };
}

export async function getActivity(userId: string) {
  await dbConnect();

  const userThreads = await Thread.find({ author: userId });

  const childThreads = userThreads.reduce((acc, userThread) => {
    return acc.concat(userThread.children);
  }, []);

  const replis = await Thread.find({
    _id: { $in: childThreads },
    author: { $ne: userId },
  }).populate({ path: "author", model: User, select: "image name _id" });

  return replis;
}
