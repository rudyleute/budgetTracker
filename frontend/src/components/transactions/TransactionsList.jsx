import Accordion from '../simple/Accordion.jsx';
import TransactionsItem from './TransactionsItem.jsx';
import { useTransactions } from '../../context/TransactionsProvider.jsx';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWineGlassEmpty, faCircleDown } from '@fortawesome/free-solid-svg-icons';
import IconButton from '../simple/IconButton.jsx';

const TransactionsList = () => {
  const { transactions, getMoreTransactions } = useTransactions();

  const transactionsMap = transactions.keys.map(key => {
    let total = 0;
    const items = transactions.data[key].map(item => {
      total += Number(item.price);
      return <TransactionsItem data={item} key={item.id} month={key}/>;
    });

    return <Accordion hClassName={"comp-b-color text-white"} bClassName={"t-b-color p-[5px]"} label={
      <span className={"w-full flex justify-between"}>
        <span className={"text-clipped grow"}>{key} </span>
        <span>{total} €</span>
      </span>
    }
                      key={key}>
      {items}
    </Accordion>
  });


  return (
    <div className={"w-full flex flex-col gap-[5px] items-center"}>
      {transactionsMap.length > 0 ? transactionsMap : <div
        className={"flex rounded-[15px] comp-b-color flex-col gap-[10px] font-bold items-center text-white p-[25px_10px]"}>
        <FontAwesomeIcon size={"2xl"} icon={faWineGlassEmpty}/>
        No transactions found
      </div>}
      {!transactions.isLastPage && <IconButton onClick={getMoreTransactions} title={"Show more"} icon={faCircleDown}/>}
    </div>
  )
}

export default React.memo(TransactionsList);