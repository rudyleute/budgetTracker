import Accordion from '../simple/Accordion';
import TransactionsItem from './TransactionsItem';
import {useTransactions} from '../../context/TransactionsProvider';
import React, {useMemo} from 'react';
import {faCircleDown} from '@fortawesome/free-solid-svg-icons';
import IconButton from '../simple/IconButton';
import {groupBy} from '../../helpers/utils';
import {getDate} from '../../helpers/time';
import Empty from '../simple/Empty';
import {PagEntityGet} from "../../types/components/mappings";

const TransactionsList = () => {
    const {
        transactions,
        getNextTransactionsPage,
        TransGetLoader,
        TransChangeLoader
    } = useTransactions();

    const grouped = useMemo(() => {
        if (!transactions.data.length) return {keys: [], groups: {}};

        const {keys, groups} = groupBy<PagEntityGet<'transaction'>, 'timestamp'>({
            data: transactions.data,
            columnName: 'timestamp',
            getKey: (date) =>
                getDate(date, {
                    year: 'numeric',
                    month: 'long'
                })
        });

        return {keys, groups};
    }, [transactions.data]);

    const transactionsMap = useMemo(() => grouped.keys.map(key => {
        let total = 0;
        const items = grouped.groups[key].map(item => {
            total += Number(item.price);
            return <TransactionsItem data={item} key={item.id}/>;
        });

        return <Accordion className={"animate-fade-in"}
                          hClassName={"max-sml:h-[50px] bg-(--color-sec) text-(--color-text)"}
                          bClassName={"bg-(--color-main) p-[5px]"} label={
            <span className={"w-full flex justify-between"}>
                <span className={"text-clipped grow"}>{key} </span>
                <span>{total} €</span>
            </span>
        } key={key}>
            {items}
        </Accordion>
    }), [grouped]);

    const isEmpty = transactionsMap.length === 0;
    return (
        <div className={"w-full flex flex-col gap-[5px] max-esml:gap-5 items-center"}>
            {!isEmpty && transactionsMap}
            <TransGetLoader>
                {isEmpty && <Empty text={"No transactions found"} size={"2xl"}/>}
                {!transactions.isLastPage &&
                  <IconButton onClick={getNextTransactionsPage} title={"Show more"} icon={faCircleDown}/>}
            </TransGetLoader>
            <TransChangeLoader/>
        </div>
    )
}

export default React.memo(TransactionsList);