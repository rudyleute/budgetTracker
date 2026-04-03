import TransactionsList from '../components/transactions/TransactionsList';
import TransactionsFilters from '../components/transactions/TransactionsFilters';

const TransactionsPage = () => {
    return (
        <>
            <TransactionsFilters/>
            <TransactionsList/>
        </>
    )
}

export default TransactionsPage;