import {
  ApolloClient,
  ApolloLink,
  concat,
  HttpLink,
  InMemoryCache,
} from "@apollo/client";
import { loadDevMessages, loadErrorMessages } from "@apollo/client/dev";
import { currentChainId, currentNetWork, SUBGRAPH_URLS } from "@/utils/network";

/***
 * For Query we have pagination, So we need to return incoming items
 */
const cache = new InMemoryCache({
  typePolicies: {
    Query: {
      fields: {
        strategyHistoricalAprs: {
          keyArgs: ["strategy"],
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
        strategyReports: {
          keyArgs: ["strategy"],
          merge(existing = [], incoming) {
            return [...existing, ...incoming];
          },
        },
        accountVaultPositions: {
          keyArgs: ["account"],
          merge(_, incoming) {
            return incoming;
          },
        },
      },
    },
  },
});

if (process.env.NEXT_PUBLIC_ENV === "dev") {
  // Adds messages only in a dev environment
  loadDevMessages();
  loadErrorMessages();
}

const httpLink = new HttpLink({ uri: SUBGRAPH_URLS["Devnet"] });

const authMiddleware = new ApolloLink((operation, forward) => {
  // add the authorization to the headers

  let uri: string = "";

  uri =
    currentChainId && (SUBGRAPH_URLS as any)[currentChainId]
      ? (SUBGRAPH_URLS as any)[currentChainId]
      : SUBGRAPH_URLS[currentNetWork];

  if (operation.getContext().clientName === "vaults") {
    uri += "/subgraphs/name/splyce-vault-subgraph";
  }

  operation.setContext(() => ({
    uri,
  }));

  return forward(operation);
});

export const client = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache,
});
