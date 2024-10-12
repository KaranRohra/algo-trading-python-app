import authenticate from "@/app/auth";
import UserForm from "@/components/user/UserForm";
import { usersCollection } from "@/lib/mongodb";
import { User } from "@/components/user/types";
import { redirect } from "next/navigation";


const page = () => {
  const handleFormSubmit = async (user: User) => {
    "use server";
    await usersCollection.insertOne(user);
    redirect("/users");
  };
  return <UserForm handleFormSubmit={handleFormSubmit} />;
};

export default authenticate(page);
