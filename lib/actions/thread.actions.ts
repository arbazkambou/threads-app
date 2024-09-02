"use server";
import { revalidatePath } from "next/cache";
import Thread from "../models/thread.model";
import User from "../models/user.model";
import { CreadThreadParams } from "../types/types";
import dbConnect from "./mongoose";
import Community from "../models/community.model";

export async function createThread({
  text,
  author,
  communityId,
  path,
}: CreadThreadParams) {
  await dbConnect();

  const communityIdObject = await Community.findOne(
    { id: communityId },
    { _id: 1 }
  );

  const createdThread = await Thread.create({
    text,
    author,
    community: communityIdObject,
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
      path: "community",
      model: Community,
    })
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
      path: "community",
      model: Community,
      select: "_id id name image",
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
  await dbConnect();
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

async function fetchAllChildThreads(threadId: string): Promise<any[]> {
  const childThreads = await Thread.find({ parentId: threadId });

  const descendantThreads = [];
  for (const childThread of childThreads) {
    const descendants = await fetchAllChildThreads(childThread._id);
    descendantThreads.push(childThread, ...descendants);
  }

  return descendantThreads;
}

export async function deleteThread(id: string, path: string): Promise<void> {
  try {
    await dbConnect();

    // Find the thread to be deleted (the main thread)
    const mainThread = await Thread.findById(id).populate("author community");

    if (!mainThread) {
      throw new Error("Thread not found");
    }

    // Fetch all child threads and their descendants recursively
    const descendantThreads = await fetchAllChildThreads(id);

    // Get all descendant thread IDs including the main thread ID and child thread IDs
    const descendantThreadIds = [
      id,
      ...descendantThreads.map((thread) => thread._id),
    ];

    // Extract the authorIds and communityIds to update User and Community models respectively
    const uniqueAuthorIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.author?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.author?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    const uniqueCommunityIds = new Set(
      [
        ...descendantThreads.map((thread) => thread.community?._id?.toString()), // Use optional chaining to handle possible undefined values
        mainThread.community?._id?.toString(),
      ].filter((id) => id !== undefined)
    );

    // Recursively delete child threads and their descendants
    await Thread.deleteMany({ _id: { $in: descendantThreadIds } });

    // Update User model
    await User.updateMany(
      { _id: { $in: Array.from(uniqueAuthorIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    // Update Community model
    await Community.updateMany(
      { _id: { $in: Array.from(uniqueCommunityIds) } },
      { $pull: { threads: { $in: descendantThreadIds } } }
    );

    revalidatePath(path);
  } catch (error: any) {
    throw new Error(`Failed to delete thread: ${error.message}`);
  }
}
