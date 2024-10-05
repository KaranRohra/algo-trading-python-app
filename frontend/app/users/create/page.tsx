import authenticate from "@/app/auth";
import UserForm from "@/app/components/UserForm";
import { usersCollection } from "@/lib/mongodb";
import { User } from "../types";

const page = () => {
  const handleFormSubmit = async (user: User) => {
    "use server";
    await usersCollection.insertOne(user);
  };
  return <UserForm handleFormSubmit={handleFormSubmit} />;
};

export default authenticate(page);
