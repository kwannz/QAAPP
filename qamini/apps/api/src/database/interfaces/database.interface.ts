// Prisma事件接口
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

// 数据库查询过滤器
export interface DatabaseWhereClause {
  [key: string]: string | number | boolean | Date | null | undefined | DatabaseWhereClause | DatabaseWhereClause[];
}

// 数据库更新数据
export interface DatabaseUpdateData {
  [key: string]: string | number | boolean | Date | null | undefined | DatabaseUpdateData | DatabaseUpdateData[];
}

// 应用程序接口
export interface AppWithShutdownHook {
  close(): Promise<void>;
}