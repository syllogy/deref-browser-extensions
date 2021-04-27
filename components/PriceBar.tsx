import React from 'react';
import { RouteComponentBaseProps } from '~/components/routes';
import { DerefMessagePayloadOf, PriceMessage } from '~/page-handlers/messages';

interface Props extends RouteComponentBaseProps {
  price?: DerefMessagePayloadOf<PriceMessage>;
}

export default function PriceBar(props: Props) {
  if (!props.price) {
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
          <span className="instance-type">{props.price.type}</span>
          <span className="lighter">instance</span>
        </p>
        <p>
          <span className="currency">US$</span>
          <span className="deref-monthly-cost">
            {(props.price.hourlyCost * 730).toFixed(2)}
          </span>
          <span className="lighter">monthly</span>
        </p>
      </div>
    </div>
  );
}
