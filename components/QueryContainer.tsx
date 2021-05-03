import React, {
  FC,
  createElement,
  forwardRef,
  ForwardedRef,
  useRef,
  ReactElement,
  ReactNode,
} from 'react';
import { QueryResult } from '@apollo/client';
import { EmptyInterface } from '~/lib/types';
import ErrorDisplay from '~/components/ErrorDisplay';
import LoadingDisplay from '~/components/LoadingDisplay';

type Query<TProps, TData, TVariables> = (
  props: TProps,
) => QueryResult<TData, TVariables>;

export type QueryContainerProps<
  TProps,
  TData,
  TVariables,
  TData2,
  TVariables2
> = TProps & {
  result: QueryResult<TData, TVariables> & {
    data: TData;
  };
  result2: QueryResult<TData2, TVariables2> & {
    data: TData2;
  };
};

interface QueryConfig<TProps, TData, TVariables, TData2, TVariables2> {
  useQuery: Query<TProps, TData, TVariables>;
  useQuery2?: Query<TProps, TData2, TVariables2>;
  renderLoading?: () => ReactNode;
  renderError?: () => ReactNode;
  component: FC<
    QueryContainerProps<TProps, TData, TVariables, TData2, TVariables2>
  >;
}

export const createQueryContainer = <
  TProps,
  TData,
  TVariables,
  TData2 = EmptyInterface,
  TVariables2 = EmptyInterface
>(
  config: QueryConfig<TProps, TData, TVariables, TData2, TVariables2>,
) => {
  function QueryContainer(
    props: TProps & { forwardedRef: ForwardedRef<typeof config.component> },
  ) {
    const renderedComponentRef = useRef<ReactElement | undefined>(undefined);

    const result = config.useQuery(props);
    const result2 = config.useQuery2?.(props);

    if (result.error || result2?.error) {
      renderedComponentRef.current = undefined;
      return config.renderError ? (
        <>{config.renderError()}</>
      ) : (
        <ErrorDisplay />
      );
    }
    if (result.loading || result2?.loading) {
      if (renderedComponentRef.current) {
        return renderedComponentRef.current;
      }
      return config.renderLoading ? (
        <>{config.renderLoading()}</>
      ) : (
        <LoadingDisplay />
      );
    }

    renderedComponentRef.current = createElement(config.component, {
      ...props,
      result: result as any,
      result2: result2 as any,
      ref: props.forwardedRef,
    });

    return renderedComponentRef.current;
  }

  // eslint-disable-next-line react/display-name -- Avoiding name in forwardRef.
  return forwardRef(
    (props: TProps, ref: ForwardedRef<typeof config.component>) => {
      return <QueryContainer {...props} forwardedRef={ref} />;
    },
  );
};
