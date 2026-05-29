import { AnswerStub } from "@/components/AnswerStub";

export const metadata = {
  title: "Torch",
};

export default async function QPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <AnswerStub id={id} />;
}
