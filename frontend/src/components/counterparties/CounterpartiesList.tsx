import React, { useMemo } from 'react';
import { useCounterparties } from '../../context/CounterpartiesProvider';
import CounterpartiesCard from '../counterparties/CounterpartiesCard';
import Empty from '../simple/Empty';
import IconButton from '../simple/IconButton';
import { faCircleRight } from '@fortawesome/free-solid-svg-icons';

const CounterpartiesList = () => {
    const {
        counterparties,
        getNextCounterpartiesPage,
        CounterpartiesGetLoader,
        CounterpartiesChangeLoader
    } = useCounterparties();

    const counterpartiesMap = useMemo(
        () => counterparties.data.map(elem => <CounterpartiesCard counterparty={elem} key={elem.id}/>),
        [counterparties]
    )

    const isEmpty = counterpartiesMap.length === 0;
    return (
        <div className={"counterparties-list-wrapper"}>
            {!isEmpty && counterpartiesMap}
            <CounterpartiesGetLoader>
                {isEmpty && <Empty className={"col-span-full"} text={"No counterparties found"} size={"2xl"}/>}
                {!counterparties.isLastPage && <IconButton className={"self-center"} onClick={getNextCounterpartiesPage} title={"Show more"} icon={faCircleRight}/>}
            </CounterpartiesGetLoader>
            <CounterpartiesChangeLoader />
        </div>
    )
}

export default React.memo(CounterpartiesList);