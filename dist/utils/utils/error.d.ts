declare const ErrorState: {
    NotSupport: string;
    MissingContainer: string;
    InvalidContainerType: string;
    LoadFail: string;
};
declare type ErrorStateKey = typeof ErrorState[keyof typeof ErrorState];
export { ErrorState };
export type { ErrorStateKey };
