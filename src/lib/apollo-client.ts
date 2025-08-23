import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';

const httpLink = createHttpLink({
  uri: 'https://graphql-engine-latest-cmwq.onrender.com/v1/graphql',
});

const authLink = setContext((_, { headers }) => {
  // Admin secret'ı header'a ekle (production'da JWT kullanılacak)
  return {
    headers: {
      ...headers,
      'x-hasura-admin-secret': 'myadminsecretkey',
    }
  }
});

export const apolloClient = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          users: {
            merge: false, // Replace existing data instead of merging
          },
          customers: {
            merge: false,
          },
          projects: {
            merge: false,
          },
          time_entries: {
            merge: false,
          },
          task_types: {
            merge: false,
          },
          divisions: {
            merge: false,
          },
          special_days: {
            merge: false,
          },
          dynamic_parameters: {
            merge: false,
          },
        },
      },
    },
  }),
  defaultOptions: {
    watchQuery: {
      errorPolicy: 'all',
    },
    query: {
      errorPolicy: 'all',
    },
  },
});
