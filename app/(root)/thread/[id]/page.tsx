import ThreadCard from "@/components/cards/ThreadCard";
import { fetchThreadById } from "@/lib/actions/thread.actions";
import { fetchUser } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import CommentForm from "@/components/forms/CommentForm";

async function Page({ params }: { params: { id: string } }) {
  if (!params.id) return null;

  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarded");

  const thread = await fetchThreadById(params.id);

  return (
    <section className="relative">
      <ThreadCard
        key={thread._id}
        id={thread._d}
        currentUserId={user?.id || ""}
        parentId={thread.parentId}
        content={thread.text}
        author={thread.author}
        community={thread.community}
        createdAt={thread.createdAt}
        comments={thread.children}
      />
      <div className="mt-7">
        <CommentForm
          threadId={thread._id.toString()}
          currentUserImage={userInfo.image}
          currentUserId={userInfo._id.toString()}
        />
      </div>
      <div className="mb-8">
        {thread.children.map((childrenItem: any) => (
          <div key={childrenItem._id} className="mt-4">
            <ThreadCard
              key={childrenItem._id}
              id={childrenItem._d}
              currentUserId={user?.id || ""}
              parentId={childrenItem.parentId}
              content={childrenItem.text}
              author={childrenItem.author}
              community={childrenItem.community}
              createdAt={childrenItem.createdAt}
              comments={childrenItem.children}
              isComments={true}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

export default Page;
