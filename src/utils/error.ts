/** 에러 상태코드 */
const ErrorState = {
  NotSupport: 'NotSupport',
  MissingContainer: 'MissingContainer',
  InvalidContainerType: 'InvalidContainerType',
  LoadFail: 'LoadFail',
};
type ErrorStateKey = typeof ErrorState[keyof typeof ErrorState];

export {
  ErrorState
}

export type {
  ErrorStateKey
}