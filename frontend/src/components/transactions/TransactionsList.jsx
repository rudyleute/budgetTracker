import Accordion from '../simple/Accordion.jsx';
import TransactionsItem from './TransactionsItem.jsx';
import { v4 as uuidv4 } from 'uuid';
import { useTransactions } from '../../context/TransactionsProvider.jsx';
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faWineGlassEmpty } from '@fortawesome/free-solid-svg-icons';

const TransactionsList = () => {
  const { transactions } = useTransactions();

  const transactionsMap = transactions.keys.map(key => {
    return <Accordion hClassName={"comp-b-color text-white"} bClassName={"t-b-color p-[5px]"} label={key}
                      key={uuidv4()}>
      {transactions.data[key].map((item) => <TransactionsItem data={item} key={item.id} month={key}/>)}
    </Accordion>
  });


  return (
    <div className={"w-full flex flex-col gap-[5px]"}>
      {transactionsMap.length > 0 ? transactionsMap : <div
        className={"flex rounded-[15px] comp-b-color flex-col gap-[10px] font-bold items-center text-white p-[25px_10px]"}>
        <FontAwesomeIcon size={"2xl"} icon={faWineGlassEmpty}/>
        No transactions found
      </div>}
    </div>
  )
}

export default React.memo(TransactionsList);