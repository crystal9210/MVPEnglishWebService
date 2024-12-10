import Link from "next/link";
export default function SuccessPage() {
    return (
      <div>
        <h1>登録が完了しました！</h1>
        <p>登録ありがとうございました。以下のリンク、ログインページからログインしてください。</p>
        <Link href={"http://localhost:3000/signIn"}>ログインページ</Link>
      </div>
    );
  }
