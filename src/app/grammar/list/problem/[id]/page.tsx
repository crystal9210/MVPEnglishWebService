// app/grammar/list/problem/[id]/page.tsx
import fs from 'fs';
import path from 'path';
import { notFound } from 'next/navigation';
import ProblemDetail from './_components/ProblemDetail';

type Problem = {
  id: string;
  problem: string;
  answer: string;
  options: string[];
  details: string;
};

export default async function ProblemDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams: { unit: string };
}) {
  const { id } = await params;
  const p = await searchParams;
  const unitName = p.unit;

  if (!unitName) {
    return <p>単元が指定されていません。</p>;
  }

  const filePath = path.join(
    process.cwd(),
    'src',
    'sample_datasets',
    `${unitName.toLowerCase().replace(/ /g, '_')}.json`
  );

  if (!fs.existsSync(filePath)) {
    return <p>指定された単元が見つかりません。</p>;
  }

  const fileContents = fs.readFileSync(filePath, 'utf-8');
  const problems: Problem[] = JSON.parse(fileContents);

  const problemData = problems.find((problem) => problem.id === id);

  if (!problemData) {
    return notFound();
  }

  // 背景色を統一
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100">
      <ProblemDetail problemData={problemData} unitName={unitName} />
    </div>
  );
}
