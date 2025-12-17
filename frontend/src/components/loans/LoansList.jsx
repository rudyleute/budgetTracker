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
    <div className={"loans-list-wrapper"}>
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