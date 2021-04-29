import React from 'react';
import { RouteComponentProps } from '~/components/routes';
import {
  useWindowMessageListener,
  PriceMessage,
  DerefMessagePayloadOf,
} from '~/page-handlers/messages';
import classNames from 'classnames';

interface Props extends RouteComponentProps {
  price?: DerefMessagePayloadOf<PriceMessage>;
  vertical?: boolean;
}

function numberWithCommas(x) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

export default function PriceBar(props: Props) {
  const price = props.price ?? useWindowMessageListener('price');

  if (!price) {
    return null;
  }

  const cellClass = classNames('py-2 px-3', {
    'border-b': props.vertical,
    'border-r': !props.vertical,
  });

  return (
    <div
      className={classNames('rounded border border-gray-300 shadow-md flex', {
        'flex-col': props.vertical,
      })}
    >
      <div className={cellClass}>Deref</div>
      <div className={cellClass}>
        <p>
          <span className="mr-1 font-semibold">{price.type}</span>
          <span className="mr-1">instance</span>
        </p>
      </div>
      <div className={cellClass}>
        <p>
          <span className="mr-1">US$</span>
          <span className="mr-1 font-semibold">
            {numberWithCommas((price.hourlyCost * 730).toFixed(2))}
          </span>
          <span className="mr-1">monthly</span>
        </p>
      </div>
    </div>
  );
}
