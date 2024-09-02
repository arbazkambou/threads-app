import Image from "next/image";
import Link from "next/link";

interface ThreadCardProps {
  id: string;
  currentUserId: string;
  parentId: string;
  content: string;
  author: {
    username: string;
    image: string;
    id: string;
    name: string;
  };
  community: {
    name: string;
    image: string;
    id: string;
  } | null;

  createdAt: string;
  comments: {
    author: {
      image: string;
    };
  }[];

  isComments?: boolean;
}

function ThreadCard({
  id,
  currentUserId,
  parentId,
  content,
  author,
  community,
  createdAt,
  comments,
  isComments,
}: ThreadCardProps) {
  return (
    <article
      className={`flex w-full flex-col rounded-xl ${
        isComments ? "px-0 xs:px-7" : " bg-dark-2 p-7"
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex flex-row w-full gap-4 flex-1">
          <div className="flex flex-col items-center">
            <Link href={`/profile/${author.id}`} className="relative h-11 w-11">
              <Image
                src={author.image}
                fill
                alt="profile photo"
                className="cursor-pointer rounded-full"
              />
            </Link>
            <div className="thread-card_bar" />
          </div>
          <div className="w-full flex flex-col">
            <Link href={`/profile/${author.id}`} className="w-fit">
              <h4 className="text-base-semibold cursor-pointer text-light-1">
                {author.name}
              </h4>
            </Link>
            <p className="mt-2 text-small-regular text-light-2">{content}</p>
            <div className="mt-5 flex flex-col gap-3">
              <div className=" flex gap-3.5">
                <Image
                  src="/assets/heart-gray.svg"
                  alt="heart"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
                <Link href={`/thread/${id}`}>
                  <Image
                    src="/assets/reply.svg"
                    alt="heart"
                    width={24}
                    height={24}
                    className="cursor-pointer object-contain"
                  />
                </Link>
                <Image
                  src="/assets/repost.svg"
                  alt="repost"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
                <Image
                  src="/assets/share.svg"
                  alt="share"
                  width={24}
                  height={24}
                  className="cursor-pointer object-contain"
                />
              </div>
              {isComments && comments.length > 0 && (
                <Link href={`/thread/${id}`}>
                  <p className="mt-1 text-subtle-medium text-gra--1">
                    {comments.length} replies
                  </p>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ThreadCard;
