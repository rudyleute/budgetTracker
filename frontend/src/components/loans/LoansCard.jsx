import React, { useCallback, useMemo } from 'react';
import { twMerge } from 'tailwind-merge';
import { daysUntilDateOnly, formatTimestamp } from '../../helpers/time.js';
import Button from '../simple/Button.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faFlag, faVault, faWallet } from '@fortawesome/free-solid-svg-icons';
import { priorityColorMap } from '../../helpers/variables.js';

const LoansCard = ({ loan }) => {
  const getTimestamp = useCallback(
    (timestamp) => formatTimestamp(timestamp, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }),
    []);

  const timestamp = useMemo(() => formatTimestamp(loan.timestamp), [loan.timestamp])

  const deadline = loan.deadline ? (() => {
    const days = daysUntilDateOnly(loan.deadline);
    const color = days < 0 ? 'red' : 'green';

    return (
      <span className={"font-b text-clipped"}
            title={getTimestamp(loan.deadline)} style={{ color }}>
                {Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''}
            </span>
    );
  })() : <span/>;

  return (
    <Button className={"w-full h-fit sml:lift-scale"} title={"Edit loan"}>
      <div
        className={twMerge('w-full h-full font-bold grid grid-cols-[1fr_10fr_1fr] animate-fade-in text-[var(--color-text)] bg-[var(--color-main)] rounded-[30px] p-[20px_10px]', `${loan.isDue && 'due'}`)}>
        <>
          <span className={"text-clipped text-xs col-span-full inline-flex justify-center items-center gap-[5px] mb-[5px]"}>
            <FontAwesomeIcon size={"xs"} icon={faClock} />
            {timestamp.slice(0, timestamp.length - 3)}
          </span>
          <span title={loan.type}>
            <FontAwesomeIcon size={"xs"} icon={loan.type === "borrowed" ? faVault : faWallet}/>
          </span>
          {deadline}
          {
            loan.priority ? <span title={`${loan.priority} priority`}>
              <FontAwesomeIcon size={"xs"} icon={faFlag} style={{ color: priorityColorMap[loan.priority] }}/>
            </span> : <span/>
          }
          <span className={"col-span-full price-wrapper !text-center"}>{loan.counterparty.name}</span>
          <span className={"text-clipped col-span-full"}>{loan.name}</span>
          <span className={"price-wrapper col-span-full p-[0_10px] !bg-[var(--color-third)]/80"}>{loan.price} €</span>
        </>
      </div>
    </Button>
  )
}

export default React.memo(LoansCard);