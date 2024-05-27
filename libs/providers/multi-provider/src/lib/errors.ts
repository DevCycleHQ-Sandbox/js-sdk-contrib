import { ErrorCode, GeneralError, OpenFeatureError } from '@openfeature/server-sdk';
import { PromiseAllSettledResult } from '@opentelemetry/sdk-metrics/build/esnext/utils';
import { RegisteredProvider } from './types';

export class ErrorWithCode extends OpenFeatureError {
  constructor(
    public code: ErrorCode,
    message: string,
  ) {
    super(message);
  }
}

export class AggregateError extends GeneralError {
  constructor(
    message: string,
    public originalErrors: { source: string; error: unknown }[],
  ) {
    super(message);
  }
}

export const constructAggregateError = (providerErrors: { error: unknown; providerName: string }[]) => {
  const errorsWithSource = providerErrors
    .map(({ providerName, error }) => {
      return { source: providerName, error };
    })
    .flat();

  // log first error in the message for convenience, but include all errors in the error object for completeness
  return new AggregateError(
    `Provider errors occurred: ${errorsWithSource[0].source}: ${errorsWithSource[0].error}`,
    errorsWithSource,
  );
};

export const throwAggregateErrorFromPromiseResults = (
  result: PromiseAllSettledResult<unknown>[],
  providerEntries: RegisteredProvider[],
) => {
  const errors = result
    .map((r, i) => {
      if (r.status === 'rejected') {
        return { error: r.reason, providerName: providerEntries[i].name };
      }
      return null;
    })
    .filter((val): val is { error: unknown; providerName: string } => Boolean(val));

  if (errors.length) {
    throw constructAggregateError(errors);
  }
};
