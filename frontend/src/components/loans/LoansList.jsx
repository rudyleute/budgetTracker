import { useLoans } from '../../context/LoansProvider.jsx';
import React, { useMemo } from 'react';
import LoansCard from './LoansCard.jsx';
import Empty from '../simple/Empty.jsx';
import IconButton from '../simple/IconButton.jsx';
import { faCircleRight } from '@fortawesome/free-solid-svg-icons';

const LoansList = () => {
  const {
    loans,
    getNextLoansPage,
    LoansGetLoader,
    LoansChangeLoader
  } = useLoans();

  const loansMap = useMemo(
    () => loans.data.map(elem => <LoansCard loan={elem} key={elem.id}/>),
    [loans]
  )

  const isEmpty = loansMap.length === 0;
  return (
    <div className={"grid loans-lrg:grid-cols-4 loans-mid:max-loans-lrg:grid-cols-3 loans-sml:max-loans-mid:grid-cols-2 max-loans-sml:grid-cols-1 gap-[10px] items-center justify-center"}>
      {!isEmpty && loansMap}
      <LoansGetLoader>
        {isEmpty && <Empty className={"col-span-full"} text={"No loans found"} size={"2xl"}/>}
        {!loans.isLastPage && <IconButton className={"self-center max-loans-sml:w-full"} onClick={getNextLoansPage} title={"Show more"} icon={faCircleRight}/>}
      </LoansGetLoader>
      <LoansChangeLoader />
    </div>
  )
}

export default React.memo(LoansList);