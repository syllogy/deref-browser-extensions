import React from 'react';
import TimeAgo from 'react-timeago';
import { RouteComponentProps } from '~/components/routes';
import {
  useWindowMessageListener,
  PriceMessage,
  DerefMessagePayloadOf,
} from '~/page-handlers/messages';
import classNames from 'classnames';
import { numberWithCommas } from '~/lib/util/number';
import InstanceIcon from './svg/InstanceIcon';
import PriceIcon from './svg/PriceIcon';
import ClockIcon from './svg/ClockIcon';

interface Props extends RouteComponentProps {
  price?: DerefMessagePayloadOf<PriceMessage>;
  vertical?: boolean;
}

export default function PriceBar(props: Props) {
  const price = props.price ?? useWindowMessageListener('price');

  if (!price) {
    return null;
  }

  const cellClass = classNames('py-2 px-3 flex items-center', {
    'border-b': props.vertical,
    'border-r': !props.vertical,
  });

  return (
    <div
      className={classNames(
        'rounded border border-gray-300 shadow flex m-1 overflow-hidden',
        {
          'flex-col': props.vertical,
        },
      )}
    >
      {!props.vertical && (
        <div className={cellClass}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            height={18}
            width={18}
            className="bg-gray-800 p-1 rounded-sm inline-block mb-px"
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
        </div>
      )}
      <div className={cellClass}>
        <InstanceIcon width={16} height={16} className="mr-2 mb-px" />
        <span className="mr-1 font-semibold">{price.type}</span>
        <span className="mr-1">Instance</span>
      </div>
      <div className={cellClass}>
        <PriceIcon width={16} height={16} className="mr-2 mb-px" />
        <span className="mr-1 font-semibold">
          {numberWithCommas(price.hourlyCost * 730)}
        </span>
        <span className="mr-1 text-gray-400">/ month</span>
      </div>
      {price.lastUpdated ? (
        <div className={cellClass}>
          <ClockIcon width={16} height={16} className="mr-2 mb-px" />
          <span className="mr-2">{price.lastUpdated.by} </span>
          <TimeAgo className="text-gray-400" date={price.lastUpdated.at} />
        </div>
      ) : null}
    </div>
  );
}
