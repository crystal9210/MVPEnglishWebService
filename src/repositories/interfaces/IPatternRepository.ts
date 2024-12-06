import { Pattern } from "@/schemas/problemSchemas";

export interface IPatternRepository {
    findAll(): Promise<Pattern[]>;
    findById(id: string): Promise<Pattern | null>;
    create(patternData: Pattern): Promise<string>;
    update(id: string, patternData: Partial<Pattern>): Promise<void>;
    delete(id: string): Promise<void>;
}
