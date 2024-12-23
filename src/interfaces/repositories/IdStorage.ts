/* eslint-disable no-unused-vars */
export interface IdSotrage {
    addId(id: string): Promise<void>;
    hasId(id: string): Promise<boolean>;
    removeId(id: string): Promise<void>;
    reset(): Promise<void>;
}
