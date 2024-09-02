import Image from "next/image";

interface Props {
  accountId: string;
  authUserId: string;
  username: string;
  image: string;
  bio: string;
}
function ProfileHeader({ accountId, authUserId, username, image, bio }: Props) {
  return (
    <div className="w-full flex flex-col justify-start">
      <div className="flex justify-between items-center">
        <div className=" flex items-center gap-3">
          <div className="relative h-20 w-20 object-cover">
            <Image
              src={image}
              alt="profile photo"
              fill
              className="object-cover shadow-2xl rounded-full"
            />
          </div>

          <div className="flex-1">
            <h2 className="text-left text-heading3-bold text-light-1">
              {username}
            </h2>
            <p className="text-base-medium text-gray-1">@{username}</p>
          </div>
        </div>
      </div>
      <div>
        {/* Todo community */}
        <p className="mt-6 max-w-lg text-base-regular text-light-2">{bio}</p>
        <div className="mt-12 h-0.5 w-full bg-dark-3" />
      </div>
    </div>
  );
}

export default ProfileHeader;
