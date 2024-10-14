import { usersCollection } from "@/lib/mongodb";
import authenticate from "../auth";
import UserList from "@/components/user/UserList";
import { User } from "@/components/user/types";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Users",
};

const page = async () => {
  const users = (await usersCollection.find().toArray()) as User[];
  return <UserList users={users} />;
};

export default authenticate(page);
