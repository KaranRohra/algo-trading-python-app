import authenticate from "../auth";
import Environments from "./Environments";

const page = () => {
  return <Environments />;
};

export default authenticate(page);
