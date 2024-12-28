"use client";

import type { IMemoRepository } from "@/interfaces/clientSide/repositories/IMemoRepository";
import { IMemoService } from "@/interfaces/services/clientSide/IMemoService";
import { Memo } from "@/schemas/app/_contexts/memoSchemas";

export class MemoService implements IMemoService {
  private repository: IMemoRepository;

  constructor(repository: IMemoRepository) {
    this.repository = repository;
  }

  async getAllMemos(): Promise<Memo[]> {
    return this.repository.getAllMemos();
  }

  async createMemo(content: string): Promise<Memo> {
    const newMemo: Memo = {
      id: Date.now().toString(),
      content,
      createdAt: new Date(),
      lastUpdatedAt: new Date(),
      tags: [],
      deleted: false,
      deletedAt: new Date(),
    };

    await this.repository.addMemo(newMemo);
    return newMemo;
  }

  async updateMemo(id: string, updates: Partial<Memo>): Promise<void> {
    const existingMemo = await this.repository.getMemo(id);
    if (!existingMemo) {
      throw new Error(`Memo with ID ${id} does not exist.`);
    }

    const updatedMemo = { ...existingMemo, ...updates, lastUpdatedAt: new Date() };
    await this.repository.updateMemo(id, updatedMemo);
  }

  async deleteMemo(id: string): Promise<void> {
    const existingMemo = await this.repository.getMemo(id);
    if (!existingMemo) {
      throw new Error(`Memo with ID ${id} does not exist.`);
    }

    const updatedMemo = { ...existingMemo, deleted: true, deletedAt: new Date() };
    await this.repository.updateMemo(id, updatedMemo);
  }
}
