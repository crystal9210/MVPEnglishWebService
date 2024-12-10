## ディレクトリ構造を調査し、リファクタリング・実装調整の際に情報をファイル形式で取得

```bash copy
tree -I 'node_modules|.git' -L 3 > directory_structure.txt
```

## cspell の Unknown word エラーを排除

### premise: make 'cspell.json' file in the root of the project like below.

```json
{
  "version": "0.2",
  "language": "en",
  "words": [],
  "ignorePaths": ["node_modules/**", "dist/**", ".next/**"]
}
```

1.

```bash copy
npm install --save-dev cspell
```

2.

```bash copy
npx cspell "**/*.{ts,tsx,js,jsx,json,md}"
```

3.

```bash copy
npx cspell "**/*.{ts,tsx,js,jsx,json,md}" --no-progress --no-summary > cspell-report.txt
```

4.

```bash copy
npx cspell "**/*.{ts,tsx,js,jsx,json,md}" --no-progress --no-summary > cspell-report.txt
```

5.

```bash copy
grep "Unknown word" cspell-report.txt | awk -F'[()]' '{print $2}' | sort -u > unknown-words.txt
```

6.

```bash copy
while read word; do
  jq --arg w "$word" '.words += [$w]' cspell.json > tmp.json && mv tmp.json cspell.json
done < unknown-words.txt
```

7.  reload the window. (VSCode environment)
