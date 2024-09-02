"use server";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { CreadThreadParams } from "../types/types";
import dbConnect from "./mongoose";

export async function createThread({
  text,
  author,
  communityId,
  path,
}: CreadThreadParams) {
  await dbConnect();

  const createdThread = await Thread.create({
    text,
    author,
    community: null,
  });

  await User.findByIdAndUpdate(author, {
    $push: { threads: createdThread._id },
  });

  revalidatePath(path);
}

export async function fetchThreads(pageNumber = 1, pageSize = 20) {
  await dbConnect();
  const skipAmount = (pageNumber - 1) * pageSize;
  const threadsQuery = Thread.find({ parentId: { $in: [null, undefined] } })
    .sort({ createdAt: "desc" })
    .skip(skipAmount)
    .limit(pageSize)
    .populate({ path: "author", model: User })
    .populate({
      path: "children",
      populate: {
        path: "author",
        model: User,
        select: "_id name parentId Image",
      },
    });

  const threads = await threadsQuery.exec();
  const totalThreadsCount = await Thread.countDocuments({
    parentId: { $in: [null, undefined] },
  });
  const isNext = totalThreadsCount > skipAmount + threads.length;

  return { isNext, threads };
}

export async function fetchThreadById(id: string) {
  await dbConnect();

  const threadQuery = Thread.findById(id)
    .populate({
      path: "author",
      model: User,
      select: "id _id name image",
    })
    .populate({
      path: "children",
      populate: [
        {
          path: "author",
          model: User,
          select: "_id id name parentId image",
        },
        {
          path: "children",
          model: Thread,
          populate: {
            path: "author",
            model: User,
            select: "_id id name parentId image",
          },
        },
      ],
    });

  const thread = await threadQuery.exec();
  return thread;
}

export async function addCommentToThread(
  threadId: string,
  commentText: string,
  userId: string,
  path: string
) {
  //Get original thread
  const originalThread = await Thread.findById(threadId);

  if (!originalThread) {
    throw new Error("No thread found!");
  }

  const commentThread = new Thread({
    text: commentText,
    author: userId,
    parentId: threadId,
  });

  const savedCommentThread = await commentThread.save();

  originalThread.children.push(savedCommentThread._id);

  await originalThread.save();

  revalidatePath(path);
}
