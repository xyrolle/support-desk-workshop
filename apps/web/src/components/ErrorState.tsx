import { TriangleAlert } from "lucide-react";
import { type StateContent, StateMessage } from "./StateMessage.tsx";

export function ErrorState(content: StateContent) {
  return <StateMessage icon={TriangleAlert} tone="danger" role="alert" {...content} />;
}
