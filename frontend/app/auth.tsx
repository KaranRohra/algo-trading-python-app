import { getServerSession } from "next-auth";
import { authOptions } from "./api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import { ComponentType } from "react";

export default function authenticate(Component: ComponentType<any>) {
  return async function AuthenticatedComponent(props: any) {
    const session = await getServerSession(authOptions);

    if (!session) {
      redirect("/login"); // Redirect to login if not authenticated
      return null; // Return null to avoid rendering the component
    }

    return <Component {...props} />;
  };
}