// TODO
// 仮配置 >> 共通化する必要が後々出てきそう
import { z } from "zod";

/**
 * セッションタイプの列挙型
 */
export const SessionTypeEnum = z.enum(["goal", "service"]);
export type SessionType = z.infer<typeof SessionTypeEnum>;

/**
 * サービスIDの列挙型
 */
export const ServiceIdEnum = z.enum(["basis", "writing", "multiple-choice"]);
export type ServiceId = z.infer<typeof ServiceIdEnum>;
