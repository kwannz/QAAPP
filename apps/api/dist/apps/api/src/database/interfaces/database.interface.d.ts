export interface PrismaQueryEvent {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
}
export interface PrismaErrorEvent {
    timestamp: Date;
    message: string;
    target: string;
}
export interface PrismaInfoEvent {
    timestamp: Date;
    message: string;
    target: string;
}
export interface PrismaWarnEvent {
    timestamp: Date;
    message: string;
    target: string;
}
export interface DatabaseWhereClause {
    [key: string]: string | number | boolean | Date | null | undefined | DatabaseWhereClause | DatabaseWhereClause[];
}
export interface DatabaseUpdateData {
    [key: string]: string | number | boolean | Date | null | undefined | DatabaseUpdateData | DatabaseUpdateData[];
}
export interface AppWithShutdownHook {
    close(): Promise<void>;
}
