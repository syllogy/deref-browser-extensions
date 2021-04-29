import React from 'react';
import { RouteComponentProps } from '~/components/routes';
import {
  useWindowMessageListener,
  PriceMessage,
  DerefMessagePayloadOf,
} from '~/page-handlers/messages';

interface Props extends RouteComponentProps {
  price?: DerefMessagePayloadOf<PriceMessage>;
}

export default function PriceBar(props: Props) {
  const price = props.price ?? useWindowMessageListener('price');

  if (!price) {
    return null;
  }

  return (
    <div className="price-bar">
      <div className="logo">
        <img src="./deref-logo-nav-full.svg" />
      </div>
      <div className="main">
        <img src="./Compute.svg" />
        <p>
          <span className="instance-type">{price.type}</span>
          <span className="lighter">instance</span>
        </p>
        <p>
          <span className="currency">US$</span>
          <span className="deref-monthly-cost">
            {(price.hourlyCost * 730).toFixed(2)}
          </span>
          <span className="lighter">monthly</span>
        </p>
        {props.price?.lastUpdatedAt && (
          <p>{props.price.lastUpdatedAt.toISOString()}</p>
        )}
      </div>
    </div>
  );
}
