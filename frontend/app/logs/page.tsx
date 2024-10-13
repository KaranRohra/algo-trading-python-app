import Logs from "@/components/logs/Logs";
import { logsCollection } from "@/lib/mongodb";
import authenticate from "../auth";

const page = async () => {
  const logs = JSON.parse(JSON.stringify(await logsCollection.find().toArray()));
  return <Logs logs={logs} />;
};

export default authenticate(page);
