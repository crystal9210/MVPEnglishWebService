import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';
import type { Config, DOMPurify as DOMPurifyType } from 'dompurify';

/**
 * 環境を検出
 * サーバーサイドでは `window` が存在しないため、`jsdom` を使用
 */
const isServer: boolean = typeof window === 'undefined';

/**
 * DOMPurifyのインスタンスを保持
 */
let domPurify: DOMPurifyType | null = null;

// Define configurations for DOMPurify
const domPurifyConfig: Config = {
    // 許可するHTMLタグのリスト
    ALLOWED_TAGS: [
        'b', 'i', 'em', 'strong', 'a', 'p', 'ul', 'ol', 'li', 'br',
        'span', 'div', 'img', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'blockquote', 'pre', 'code', 'hr', 'table', 'thead', 'tbody',
        'tr', 'th', 'td', 'thead', 'tfoot', 'caption'
    ],

    // 許可する属性のリスト
    ALLOWED_ATTR: [
        'href', 'title', 'target', 'alt', 'src', 'width', 'height', 'style',
        'class', 'id', 'name', 'role', 'aria-label'
    ],

    // データ属性の許可設定
    ALLOW_DATA_ATTR: false, // 必要なら設定

    // ARIA属性の許可設定
    ALLOW_ARIA_ATTR: false, // 必要なら設定

    // 許可するURIの正規表現
    ALLOWED_URI_REGEXP: /^(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):/i, // セキュアなプロトコルのみ許可

    // カスタム要素の取り扱い設定
    CUSTOM_ELEMENT_HANDLING: {
        tagNameCheck: /^my-/i, // カスタム要素の許可例
        allowCustomizedBuiltInElements: false,
    },

    // 禁止する属性のリスト
    FORBID_ATTR: ['style', 'onerror', 'onclick', 'onload', 'onmouseover'],

    // 禁止するタグのリスト
    FORBID_TAGS: ['style', 'script', 'iframe', 'object', 'embed', 'link'],

    // DOM Clobbering防止設定
    SANITIZE_DOM: true,
    SANITIZE_NAMED_PROPS: true,

    // Trusted Typesのポリシー設定
    TRUSTED_TYPES_POLICY: undefined, // 必要に応じて設定

    // その他の設定
    KEEP_CONTENT: false, // 要素が削除された場合、内容も削除
    SAFE_FOR_TEMPLATES: false, // テンプレートシステム用のサニタイズ
    WHOLE_DOCUMENT: false, // ドキュメント全体のサニタイズ
    RETURN_TRUSTED_TYPE: false, // Trusted Typesオブジェクトの返却
    RETURN_DOM: false, // DOMノードの返却
    RETURN_DOM_FRAGMENT: false, // DocumentFragmentの返却
};

/**
 * DOMPurifyのインスタンスを初期化または取得
 */
const getDOMPurify = (): DOMPurifyType => {
    if (domPurify) {
        return domPurify;
    }

    if (isServer) {
        // サーバーサイドの場合
        const { window } = new JSDOM('');
        domPurify = DOMPurify(window);
    } else {
        // クライアントサイドの場合
        domPurify = DOMPurify(window);
    }

    // 設定を適用
    domPurify.setConfig(domPurifyConfig);

    return domPurify;
};

/**
 * 入力文字列をサニタイズ(サーバ/クライアントサイド対応)
 * @param input サニタイズ対象の文字列
 * @returns サニタイズされた文字列
 */
export const sanitizeInput = (input: string): string => {
    try {
        return getDOMPurify().sanitize(input);
    } catch (error) {
        console.error('Sanitization error:', error);
        // 必要に応じてデフォルト値を返す、または例外を投げる
        return '';
    }
};



// --- use case ---
// export default async function handler(req: NextApiRequest, res: NextApiResponse<Data>) {
//     if (req.method !== 'POST') {
//         return res.status(405).json({ message: 'Method Not Allowed' });
//     }

//     try {
//         // ユーザー入力を取得
//         const { userId, provider, providerAccountId, access_token, refresh_token, id_token, token_type, scope, expires_at, type } = req.body;

//         // 入力データをサニタイズ
//         const sanitizedData = {
//         userId: sanitizeInput(userId),
//         provider: sanitizeInput(provider),
//         providerAccountId: sanitizeInput(providerAccountId),
//         access_token: sanitizeInput(access_token),
//         refresh_token: refresh_token ? sanitizeInput(refresh_token) : null,
//         id_token: id_token ? sanitizeInput(id_token) : null,
//         token_type: sanitizeInput(token_type),
//         scope: sanitizeInput(scope),
//         expires_at: expires_at, // numberなのでサニタイズ不要
//         type: sanitizeInput(type),
//         };

//         // データバリデーション
//         const validationError = validateWithSchema(accountDataSchema, sanitizedData);
//         if (validationError) {
//         return res.status(400).json({ message: validationError });
//         }

//         // Firestoreにアカウント情報を保存
//         await authService.createAccountEntry(sanitizedData.userId, sanitizedData);

//         return res.status(200).json({ message: 'Account information saved successfully.' });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({ message: 'Internal Server Error' });
//     }
// }




// 手動でサニタイズ処理を実装する例 - ただし対応範囲が限定的かつ手動だと限度があるためサポートされ、外部から提供されているパッケージを信頼した方が効率的かつ堅牢な可能性が高い - 技術選定としてパッケージの選定も注意して行うこと
// export const sanitizeInput = (input: string): string =>
//     input
//         .replace(/&/g, "&amp;")
//         .replace(/</g, "&lt;")
//         .replace(/>/g, "&gt;")
//         .replace(/"/g, "&quot")
//         .replace(/'/g, "&#039;");

// ex: &を&amp;に変換 - htmlエンティティとして解釈されなくなる
