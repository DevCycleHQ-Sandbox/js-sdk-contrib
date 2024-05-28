import {
  BaseEvaluationStrategy,
  FinalResult,
  ProviderResolutionResult,
  StrategyPerProviderContext,
} from './BaseEvaluationStrategy';
import {
  ErrorCode,
  EvaluationContext,
  FlagValue,
  ResolutionDetails,
  StandardResolutionReasons,
} from '@openfeature/server-sdk';
import { FirstMatchStrategy } from './FirstMatchStrategy';

/**
 * Extends FirstMatchStrategy to handle the DevCycle Provider, which returns DEFAULT for the "flag not found" case.
 * Return the first result that did not return a default value or indicate "flag not found".
 *
 * Note: To use this strategy with DevCycle features, ensure all targeting rules include an "All Users" rule to avoid returning DEFAULT for known keys.
 */
export class DevCycleMigrationStrategy extends FirstMatchStrategy {
  override shouldEvaluateNextProvider<T extends FlagValue>(
    strategyContext: StrategyPerProviderContext,
    context: EvaluationContext,
    details?: ResolutionDetails<T>,
    thrownError?: unknown,
  ): boolean {
    if (details?.errorCode === ErrorCode.FLAG_NOT_FOUND || details?.reason === StandardResolutionReasons.DEFAULT) {
      return true;
    }
    return false;
  }
}
