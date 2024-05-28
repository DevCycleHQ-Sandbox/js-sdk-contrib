import { Provider } from '@openfeature/web-sdk';

export type ProviderEntryInput = {
  provider: Provider;
  name?: string;
};

export type RegisteredProvider = Required<ProviderEntryInput>;
