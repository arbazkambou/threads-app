import UserCard from "@/components/cards/UserCard";
import { profileTabs } from "@/components/constants";
import ProfileHeader from "@/components/shared/ProfileHeader";
import ThreadsTab from "@/components/shared/ThreadsTab";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { fetchUser, fetchUsers } from "@/lib/actions/user.actions";
import { currentUser } from "@clerk/nextjs/server";
import { TabsContent } from "@radix-ui/react-tabs";
import Image from "next/image";

import { redirect } from "next/navigation";

async function Page() {
  const user = await currentUser();
  if (!user) return null;

  const userInfo = await fetchUser(user.id);
  if (!userInfo?.onboarded) redirect("/onboarded");

  const result = await fetchUsers({
    userId: user.id,
    pageNumber: 1,
    pageSize: 10,
    searchString: "",
  });

  return (
    <section>
      <h1 className="mb-10 head-text">Search</h1>
      <div className="mt-14 flex flex-col gap-9">
        {result.users.length === 0 ? (
          <p className="no-result">No users</p>
        ) : (
          <>
            {result.users.map((person) => (
              <UserCard
                key={person.id}
                id={person.id}
                name={person.name}
                username={person.username}
                image={person.image}
                personType="User"
              />
            ))}
          </>
        )}
      </div>
    </section>
  );
}

export default Page;
