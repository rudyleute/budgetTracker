import Accordion from '../simple/Accordion.jsx';
import TransactionsItem from './TransactionsItem.jsx';
import { useTransactions } from '../../context/TransactionsProvider.jsx';
import React, { useMemo } from 'react';
import { faCircleDown } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../simple/IconButton.jsx';
import { groupBy } from '../../helpers/utils.js';
import { getDate } from '../../helpers/time.js';
import Empty from '../simple/Empty.jsx';

const TransactionsList = () => {
  const { transactions, getMoreTransactions } = useTransactions();

  const grouped = useMemo(() => {
    if (!transactions.data.length) return { keys: [], groups: {} };

    const { keys, groups } = groupBy(
      transactions.data,
      'timestamp',
      (date) =>
        getDate(date, {
          year: 'numeric',
          month: 'long'
        })
    );

    return { keys, groups };
  }, [transactions.data]);

  const transactionsMap = useMemo(() => grouped.keys.map(key => {
    let total = 0;
    const items = grouped.groups[key].map(item => {
      total += Number(item.price);
      return <TransactionsItem data={item} key={item.id} month={key}/>;
    });

    return <Accordion className={"animate-fade-in"} hClassName={"max-sml:h-[50px] bg-[var(--color-sec)] text-[var(--color-text)]"}
                      bClassName={"bg-[var(--color-main)] p-[5px]"} label={
      <span className={"w-full flex justify-between"}>
        <span className={"text-clipped grow"}>{key} </span>
        <span>{total} €</span>
      </span>
    }
                      key={key}>
      {items}
    </Accordion>
  }), [grouped]);


  return (
    <div className={"w-full flex flex-col gap-[5px] max-esml:gap-[20px] items-center"}>
      {transactionsMap.length > 0 ? transactionsMap : <Empty text={"No transactions found"} size={"2xl"} />}
      {!transactions.isLastPage && <IconButton onClick={getMoreTransactions} title={"Show more"} icon={faCircleDown}/>}
    </div>
  )
}

export default React.memo(TransactionsList);