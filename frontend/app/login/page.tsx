import Login from "@/components/login/Login";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
};

const page = () => <Login />;

export default page;
