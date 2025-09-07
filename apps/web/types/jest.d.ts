/* eslint-disable @typescript-eslint/no-unused-vars */
/// <reference types="jest" />

declare namespace jest {
  interface Mock<T = any, Y extends any[] = any> extends Function, MockInstance<T, Y> {}
}

declare global {
  namespace NodeJS {
    interface Global {
      jest: typeof jest;
    }
  }
}

export {};
