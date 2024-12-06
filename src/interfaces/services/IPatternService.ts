import { Pattern } from "@/schemas/problemSchemas";

export interface IPatternService {
    getAllPatterns(): Promise<Pattern[]>;
    getPatternById(id: string): Promise<Pattern | null>;
    addPattern(patternData: Pattern): Promise<string>;
    updatePattern(id: string, patternData: Partial<Pattern>): Promise<void>;
    deletePattern(id: string): Promise<void>;
}
