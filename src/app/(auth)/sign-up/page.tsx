import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { SignUpView } from "@/modules/auth/ui/views/sign-up-view";

const Page = async () => {
  const h = await headers();
  const session = await auth.api.getSession({
    headers:h, // ✅ NO await
  });

  if (session?.user) {
    redirect("/");
  }

  return <SignUpView />;
};

export default Page;
