"use client";
import { usePathname, useRouter } from "next/navigation";
import { sidebarLinks } from "../constants";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "@clerk/nextjs";

function Bottombar() {
  const pathName = usePathname();
  const router = useRouter();
  const { userId } = useAuth();
  return (
    <section className="bottombar">
      <div className="bottombar_container">
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
              className={`bottombar_link ${isActive && "bg-primary-500"}`}
            >
              <Image src={link.imgURL} height={24} width={24} alt="link" />
              <p className="max-sm:hidden text-light-1 text-subtle-medium ">
                {link.label.split(" ")[0]}
              </p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

export default Bottombar;
