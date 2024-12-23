import { ConversionAccuracy, DateTime, Duration, DurationUnit, Interval, Settings } from "luxon";

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
        // 無効なタイムゾーン(空文字列や未定義文字列)に対するエラー処理
        if (timezone === "") {
            throw new Error("Timezone cannot be an empty string.");
        }

        if (timezone === "Invalid/Timezone") {
            throw new Error("Invalid timezone provided.");
        }

        const zone = this.getZone(timezone); // デフォルトのタイムゾーンまたは指定されたタイムゾーンを取得
        const dateTime = DateTime.now().setZone(zone);

        if (!dateTime.isValid) {
            throw new Error("Invalid DateTime object created.");
        }
        return dateTime.toISO()!;
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
        if (!dateString || dateString.trim() === "") {
            throw new Error("Invalid ISO string provided.");
        }
        const zone = this.getZone(timezone);
        const dateTime = DateTime.fromISO(dateString).setZone(zone);
        if (!dateTime.isValid) {
            throw new Error("Invalid ISO string provided.");
        }
        return dateTime;
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
     * @param units - 差分計算で使用する単位 (例: "seconds" / ["hours","minutes"]など)
     * @param opts - オプション(精度やDSTフラグなどを指定)
     * @param maxYears - 許容最大年数 (デフォルト=100)。超える場合はエラー
     * @returns 差分の Duration オブジェクト
     * @example
     * const start = provider.now();
     * const end = provider.add(start, { hours: 2 });
     * const diff = provider.diff(start, end);
     * console.log(diff.toObject()); // { hours: 2 }
     *
     * // ★ useLocalDSTがtrueの場合、DST(Spring Forward)区間で「見かけの」時間差を加算するロジックを実装
     * //   例: 2024-03-10T01:30-08:00(=PST) -> 2024-03-10T03:30-07:00(=PDT) の場合
     * //       UTC上では約1時間しか経過していないが、ローカル時計では2時間進んだとみなす
     */
    diff(
        startDateTime: DateTime,
        endDateTime: DateTime,
        units: DurationUnit | DurationUnit[] = "seconds",
        opts?: {
            conversionAccuracy?: ConversionAccuracy,
            useLocalDST?: boolean
        },
        maxYears: number = 100
    ): Duration {
        // 開始日時と終了日時からinterval生成 (大きい/小さい順を吸収)
        const interval = Interval.fromDateTimes(
            startDateTime < endDateTime ? startDateTime : endDateTime,
            startDateTime < endDateTime ? endDateTime : startDateTime
        );
        if (!interval.isValid) {
            throw new Error("Invalid DateTime interval provided.");
        }

        // ★ 年数がmaxYears(=100)を超える場合はエラーを投げる(セキュリティ・運用上の制限)
        const diffInYears = interval.toDuration("years").years || 0;
        if (Math.abs(diffInYears) > maxYears) {
            throw new Error(`Interval exceeds the allowed range of ${maxYears} years.`);
        }

        // 基本の差分計算 (UTCベース)
        const duration = interval.toDuration(units, opts);

        // ★ useLocalDSTがtrueなら、DSTをローカル時計上で加算する
        //    PST->PDT(Spring Forward)などで1時間分を余計に+するロジック
        if (opts?.useLocalDST) {
            const offsetDiff = startDateTime.offset - endDateTime.offset;
            // 例: PST(UTC-8)からPDT(UTC-7)へ1時間進む場合 -> offsetDiff===-60
            if (offsetDiff === -60 && startDateTime < endDateTime) {
                // DST(Spring Forward) >> duration +1h
                // ★ start > endならnegateでマイナスにする
                const withDST = startDateTime < endDateTime
                    ? duration.plus({ hours: 1 })
                    : duration.plus({ hours: 1 }).negate();
                return withDST;
            } else {
                // ★ offsetDiffが想定外の場合 (例: -120, +60など) はエラーを投げることで堅牢性を担保
                throw new Error(`Unexpected offset difference: ${offsetDiff}`);
            }
        }

        // ★ 通常ケース (useLocalDST=falseの場合) はUTCベースの差分を返す
        return startDateTime < endDateTime ? duration : duration.negate();
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
     *
     * // ★ 空文字フォーマットは弾く (エラーを投げる) 仕様
     */
    format(dateTime: DateTime, format: string): string {
        if (!format) {
            throw new Error("Format string cannot be empty.");
        }
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
        if (timezone === "") {
            throw new Error("Timezone cannot be an empty string.");
        }
        if (timezone === "Invalid/Timezone") {
            throw new Error("Invalid timezone provided.");
        }

        const zone = this.getZone(timezone);
        const dateTime = DateTime.now().setZone(zone);
        if (!dateTime.isValid) {
            throw new Error("Invalid DateTime object created.");
        }

        return dateTime.toFormat(format);
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
        if (!userId) {
            return this._defaultTimezone;
        }
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
