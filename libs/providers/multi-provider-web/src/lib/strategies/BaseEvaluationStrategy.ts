import {
  EvaluationContext,
  FlagValue,
  FlagValueType,
  Provider,
  ProviderStatus,
  ResolutionDetails,
} from '@openfeature/web-sdk';
import { ErrorWithCode } from '../errors';

export type StrategyEvaluationContext = {
  flagKey: string;
  flagType: FlagValueType;
};
export type StrategyPerProviderContext = StrategyEvaluationContext & {
  provider: Provider;
  providerName: string;
  providerStatus: ProviderStatus;
};

type ProviderResolutionResultBase = {
  provider: Provider;
  providerName: string;
};

export type ProviderResolutionSuccessResult<T extends FlagValue> = ProviderResolutionResultBase & {
  details: ResolutionDetails<T>;
};

export type ProviderResolutionErrorResult = ProviderResolutionResultBase & {
  thrownError: unknown;
};

export type ProviderResolutionResult<T extends FlagValue> =
  | ProviderResolutionSuccessResult<T>
  | ProviderResolutionErrorResult;

export type FinalResult<T extends FlagValue> = {
  details?: ResolutionDetails<T>;
  provider?: Provider;
  providerName?: string;
  errors?: {
    providerName: string;
    error: unknown;
  }[];
};

/**
 * Base strategy to inherit from. Not directly usable, as strategies must implement the "determineResult" method
 * Contains default implementations for `shouldEvaluateThisProvider` and `shouldEvaluateNextProvider`
 */
export abstract class BaseEvaluationStrategy {
  public runMode: 'parallel' | 'sequential' = 'sequential';

  shouldEvaluateThisProvider(strategyContext: StrategyPerProviderContext, evalContext: EvaluationContext): boolean {
    if (
      strategyContext.providerStatus === ProviderStatus.NOT_READY ||
      strategyContext.providerStatus === ProviderStatus.FATAL
    ) {
      return false;
    }
    return true;
  }

  shouldEvaluateNextProvider<T extends FlagValue>(
    strategyContext: StrategyPerProviderContext,
    context: EvaluationContext,
    details?: ResolutionDetails<T>,
    thrownError?: unknown,
  ): boolean {
    return true;
  }

  abstract determineFinalResult<T extends FlagValue>(
    strategyContext: StrategyEvaluationContext,
    context: EvaluationContext,
    resolutions: ProviderResolutionResult<T>[],
  ): FinalResult<T>;

  protected hasError(resolution: ProviderResolutionResult<FlagValue>): boolean {
    return 'thrownError' in resolution || !!resolution.details.errorCode;
  }

  protected collectProviderErrors<T extends FlagValue>(resolutions: ProviderResolutionResult<T>[]): FinalResult<T> {
    const errors: FinalResult<FlagValue>['errors'] = [];
    for (const resolution of resolutions) {
      if ('thrownError' in resolution) {
        errors.push({ providerName: resolution.providerName, error: resolution.thrownError });
      } else if (resolution.details.errorCode) {
        errors.push({
          providerName: resolution.providerName,
          error: new ErrorWithCode(resolution.details.errorCode, resolution.details.errorMessage ?? 'unknown error'),
        });
      }
    }
    return { errors };
  }

  protected resolutionToFinalResult<T extends FlagValue>(resolution: ProviderResolutionSuccessResult<T>) {
    return { details: resolution.details, provider: resolution.provider, providerName: resolution.providerName };
  }
}
