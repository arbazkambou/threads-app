"use client";
import { sidebarLinks } from "@/components/constants/index.js";
import { SignedIn, SignOutButton, useAuth } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

function LeftSidebar() {
  const pathName = usePathname();
  const router = useRouter();
  const { userId } = useAuth();
  return (
    <section className="custom-scrollbar leftsidebar">
      <div className="flex w-full flex-1 flex-col gap-6 px-6">
        {sidebarLinks.map((link, index) => {
          const isActive =
            (pathName.includes(link.route) && link.route.length > 1) ||
            pathName === link.route;
          if (link.route === "/profile") {
            link.route = `${link.route}/${userId}`;
          }

          return (
            <Link
              href={link.route}
              key={link.label}
              className={`leftsidebar_link ${isActive && "bg-primary-500"}`}
            >
              <Image src={link.imgURL} height={24} width={24} alt="link" />
              <p className="max-lg:hidden text-light-1">{link.label}</p>
            </Link>
          );
        })}
        <div className="mt-8">
          <SignedIn>
            <SignOutButton
              signOutOptions={{
                redirectUrl: "/sign-in",
              }}
            >
              <div className="flex cursor-pointer gap-4 p-4">
                <Image
                  src={"/assets/logout.svg"}
                  width={24}
                  height={24}
                  alt="logout"
                />
                <p className="text-light-1 max-lg:hidden">Logout</p>
              </div>
            </SignOutButton>
          </SignedIn>
        </div>
      </div>
    </section>
  );
}

export default LeftSidebar;
