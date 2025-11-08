import Accordion from '../simple/Accordion.jsx';
import TransactionsItem from './TransactionsItem.jsx';
import { v4 as uuidv4 } from 'uuid';
import { useTransactions } from '../../context/TransactionsProvider.jsx';


const TransactionsList = () => {
  const { transactions } = useTransactions();

  return (
    <div className={"w-full flex flex-col gap-[5px]"}>
      {
        transactions.keys.map(key => {
          return <Accordion hClassName={"comp-b-color text-white"} bClassName={"t-b-color p-[5px]"} label={key}
                            key={uuidv4()}>
            {transactions.data[key].map((item) => <TransactionsItem data={item} key={item.id} month={key} />)}
          </Accordion>
        })
      }
    </div>
  )
}

export default TransactionsList;