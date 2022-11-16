import { useQuery, useMutation } from '@vue/apollo-composable';
import gql from 'graphql-tag';

const kGetBooksQuery = gql`
  query Query {
    books {
      author
      title
      normalizedTitle
    }
  }
`;

const { result: books, refetch } = useQuery(kGetBooksQuery);

const { mutate: addBook } = useMutation(
  gql`
    mutation AddBook($title: String!, $author: String!) {
      addBook(title: $title, author: $author, branch: "NYPL") {
        code
        success
        message
        book {
          title
          author
          normalizedTitle
        }
      }
    }
  `,
  {
    update(cache, { data }) {
      if (!data.addBook.success) {
        return;
      }

      const cachedData = cache.readQuery({ query: kGetBooksQuery });
      cache.writeQuery({
        query: kGetBooksQuery,
        data: {
          books: [...cachedData.books, data.addBook.book],
        },
      });
    },
  }
);

export { books, refetch, addBook };