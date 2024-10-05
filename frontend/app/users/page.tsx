import { usersCollection } from "@/lib/mongodb";
import authenticate from "../auth";
import UserList from "@/components/UserList";
import { User } from "./types";

const page = async () => {
  const users = (await usersCollection.find().toArray()) as User[];
  return <UserList users={users} />;
};

export default authenticate(page);
