import { DateTime, Duration, Interval, Settings } from "luxon";

export class DateTimeProvider {
    private readonly _defaultTimezone: string;

    constructor(timezone: string = "Asia/Tokyo") {
        Settings.defaultZone = timezone;
        this._defaultTimezone = timezone;
    }

    /**
     * 現在日時取得
     * @returns 現在日時のDateTimeオブジェクト
     * @example
     * const now = provider.now();
     * console.log(now.toISO()); // "2024-06-19T15:30:00.000+09:00"
     */
    now(): DateTime {
        return DateTime.now();
    }

    /**
     * ユーザーのタイムゾーンに基づいた現在日時をISO形式で取得
     * @param timezone - タイムゾーン (例: "America/New_York")
     * @returns ISO形式の日時文字列
     * @example
     * provider.nowISO(); // "2024-06-19T15:30:00.000+09:00"
     * provider.nowISO("America/New_York"); // "2024-06-19T02:30:00.000-04:00"
     */
    nowISO(timezone?: string): string {
        const zone = this.getZone(timezone);
        const dateTime = DateTime.now().setZone(zone);
        if (!dateTime.isValid) {
            throw new Error("Invalid DateTime object created.");
        }
        return dateTime.toISO()!; // Luxonの仕様上、isValidチェック後はnullになり得ない
    }

    /**
     * 指定された日時を DateTime オブジェクトに変換
     * @param dateString - ISO 8601 形式の日時文字列 (例: "2024-06-19T15:30:00.000+09:00")
     * @param timezone - タイムゾーン (任意)
     * @returns DateTime オブジェクト
     * @example
     * const date = provider.fromISO("2024-06-19T15:30:00.000+09:00");
     * console.log(date.toString()); // "2024-06-19T15:30:00.000+09:00"
     */
    fromISO(dateString: string, timezone?: string): DateTime {
        const zone = this.getZone(timezone);
        return DateTime.fromISO(dateString).setZone(zone);
    }

    /**
     * DateTime オブジェクトをISO形式の文字列に変換
     * @param dateTime - DateTime オブジェクト
     * @returns ISO形式の日時文字列
     * @example
     * const date = DateTime.now();
     * const iso = provider.toISO(date);
     * console.log(iso); // "2024-06-19T15:30:00.000+09:00"
     */
    toISO(dateTime: DateTime): string {
        if (!dateTime.isValid) {
            throw new Error("Invalid DateTime object provided.");
        }
        return dateTime.toISO()!;
    }

    /**
     * 日時の加算
     * @param dateTime - DateTime オブジェクト
     * @param duration - 加算する期間 (例: { days: 1, hours: 2 })
     * @returns 加算後の DateTime オブジェクト
     * @example
     * const date = provider.now();
     * const newDate = provider.add(date, { days: 1 });
     * console.log(newDate.toISO()); // "2024-06-20T15:30:00.000+09:00"
     */
    add(dateTime: DateTime, duration: Duration | object): DateTime {
        return dateTime.plus(duration);
    }

    /**
     * 日時の減算
     * @param dateTime - DateTime オブジェクト
     * @param duration - 減算する期間 (例: { days: 1, hours: 2 })
     * @returns 減算後の DateTime オブジェクト
     * @example
     * const date = provider.now();
     * const newDate = provider.subtract(date, { days: 1 });
     * console.log(newDate.toISO()); // "2024-06-18T15:30:00.000+09:00"
     */
    subtract(dateTime: DateTime, duration: Duration | object): DateTime {
        return dateTime.minus(duration);
    }

    /**
     * 2つの日時の差分を取得
     * @param startDateTime - 開始日時
     * @param endDateTime - 終了日時
     * @returns 差分の Duration オブジェクト
     * @example
     * const start = provider.now();
     * const end = provider.add(start, { hours: 2 });
     * const diff = provider.diff(start, end);
     * console.log(diff.toObject()); // { hours: 2 }
     */
    diff(startDateTime: DateTime, endDateTime: DateTime): Duration {
        return Interval.fromDateTimes(startDateTime, endDateTime).toDuration();
    }

    /**
     * 日時のフォーマット
     * @param dateTime - DateTime オブジェクト
     * @param format - フォーマット文字列 (例: "yyyy-MM-dd HH:mm:ss")
     * @returns フォーマットされた日時文字列
     * @example
     * const date = provider.now();
     * const formatted = provider.format(date, "yyyy-MM-dd HH:mm:ss");
     * console.log(formatted); // "2024-06-19 15:30:00"
     */
    format(dateTime: DateTime, format: string): string {
        return dateTime.toFormat(format);
    }

    /**
     * タイムゾーンに基づいたフォーマットされた日時を取得
     * @param format - フォーマット文字列
     * @param timezone - タイムゾーン (任意)
     * @returns フォーマットされた日時文字列
     * @example
     * const formatted = provider.getFormattedNow("yyyy-MM-dd HH:mm:ss", "America/New_York");
     * console.log(formatted); // "2024-06-19 02:30:00"
     */
    getFormattedNow(format: string, timezone?: string): string {
        const zone = this.getZone(timezone);
        return DateTime.now().setZone(zone).toFormat(format);
    }

    /**
     * ユーザーのタイムゾーンを取得
     * @param userId - ユーザーID
     * @returns タイムゾーン文字列
     * @example
     * const timezone = provider.getUserTimezone("user1");
     * console.log(timezone); // "America/New_York"
     */
    getUserTimezone(userId: string): string {
        const userTimezones: { [key: string]: string } = {
            "user1": "America/New_York",
            "user2": "Europe/London",
            "user3": "Asia/Tokyo",
        };
        return userTimezones[userId] || this._defaultTimezone;
    }

    /**
     * 内部ヘルパー: タイムゾーンを取得
     * @param timezone - 任意のタイムゾーン
     * @returns タイムゾーン文字列
     */
    private getZone(timezone?: string): string {
        return timezone || this._defaultTimezone;
    }

    /**
     * デフォルトのタイムゾーンを取得
     * @returns デフォルトのタイムゾーン文字列
     */
    get timezone(): string {
        return this._defaultTimezone;
    }
}
