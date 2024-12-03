export const sanitizeInput = (input: string): string =>
    input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot")
        .replace(/'/g, "&#039;");

// ex: &を&amp;に変換 - htmlエンティティとして解釈されなくなる
