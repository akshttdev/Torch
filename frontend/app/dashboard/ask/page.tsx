import { AskBody } from "@/components/AskBody";

export const metadata = {
  title: "Torch",
  description: "Ask any PyTorch question. Grounded retrieval over docs, code, and issues.",
};

export default function AskPage() {
  return <AskBody />;
}
