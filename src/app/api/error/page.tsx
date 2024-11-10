export default function AuthErrorPage({ searchParams }: { searchParams: { error?: string } }) {
    const error = searchParams.error; // await を削除
    const errorMessage =
        error === "AccessDenied"
            ? "権限が不足しています。GoogleまたはGitHubアカウントを確認してください。"
            : "ログインに失敗しました。もう一度お試しください。";

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-gray-700">
            <h1 className="text-3xl font-bold mb-4">ログインエラー</h1>
            <p className="text-lg">{errorMessage}</p>
        </div>
    );
}
