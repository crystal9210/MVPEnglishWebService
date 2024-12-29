// TODO
// ProblemSetGeneratorService で問題を生成
// PDFDocumentGenerator で PDF 化
// Repositoriesを一括管理する例
import { Request, Response } from "express"; // or Next.js API
import { ProblemSetGeneratorService } from "@/services/ProblemSetGeneratorService";
import { PDFDocumentGenerator } from "@/services/pdfDocumentGenerator";
import { ProblemRepository } from "@/repositories/ProblemRepository";
import { StatisticsRepository } from "@/repositories/StatisticsRepository";

export class ProblemSetController {
  private problemRepo: ProblemRepository;
  private statsRepo: StatisticsRepository;
  private genService: ProblemSetGeneratorService;
  private pdfGenerator: PDFDocumentGenerator;

  constructor() {
    // DI/Factory: ここでは例として直書き
    this.problemRepo = new ProblemRepository();
    this.statsRepo = new StatisticsRepository();
    this.genService = new ProblemSetGeneratorService(this.problemRepo, this.statsRepo);
    this.pdfGenerator = new PDFDocumentGenerator();
  }

  /**
   * GET /api/problemSet?userId=xxx&serviceId=yyy
   * - 自動問題セットを生成してJSONで返す例
   */
  async getProblemSet(req: Request, res: Response) {
    try {
      const userId = req.query.userId as string;
      const serviceId = req.query.serviceId as string;
      const difficulty = (req.query.difficulty as string) ?? "EASY";
      const limit = Number(req.query.limit ?? 10);

      const problemSet = await this.genService.generateProblemSet(userId, serviceId, difficulty, limit);

      res.json({ success: true, data: problemSet });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: String(error) });
    }
  }

  /**
   * POST /api/problemSet/pdf
   * - リクエストbodyに { userId, serviceId, difficulty, limit, pdfSettings } を渡し、PDFを生成→返す例
   */
  async downloadPDF(req: Request, res: Response) {
    try {
      const { userId, serviceId, difficulty, limit, pdfSettings } = req.body;

      const problemSet = await this.genService.generateProblemSet(userId, serviceId, difficulty, limit);

      const pdfBuffer = await this.pdfGenerator.generateProblemPDF({
        title: "Custom Problem Set",
        content: problemSet,
        ...pdfSettings // e.g. margins, defaultFont, etc
      });

      res.setHeader("Content-Type", "application/pdf");
      res.setHeader("Content-Disposition", 'attachment; filename="problems.pdf"');
      res.send(pdfBuffer);

    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: String(error) });
    }
  }
}
