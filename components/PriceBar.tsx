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
      <div className={cellClass}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          height={20}
          width={20}
          className="bg-gray-800 p-1 rounded-sm inline-block mr-2"
        >
          <path
            d="M18.343,17a2,2,0,0,0-2-2h-14a2,2,0,0,0,0,4h14A2,2,0,0,0,18.343,17Z"
            style={{ fill: '#fff' }}
          />
          <path
            d="M31.071,15.586l-1.414-1.414-9.9-9.9A2,2,0,0,0,16.929,7.1l9.9,9.9-9.9,9.9a2,2,0,0,0,2.828,2.829l9.9-9.9,1.414-1.414A2,2,0,0,0,31.071,15.586Z"
            style={{ fill: '#fff' }}
          />
          <rect width="32" height="32" style={{ fill: 'none' }} />
        </svg>
        <span className="font-semibold">Deref</span>
      </div>
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
