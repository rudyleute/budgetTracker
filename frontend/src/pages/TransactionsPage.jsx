import TransactionsList from '../components/transactions/TransactionsList.jsx';
import TransactionsFilters from '../components/transactions/TransactionsFilters.jsx';

const TransactionsPage = () => {
  return (
    <>
      <TransactionsFilters/>
      <TransactionsList/>
    </>
  )
}

export default TransactionsPage;