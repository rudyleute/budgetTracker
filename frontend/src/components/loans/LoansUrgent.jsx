import { useNavigate } from 'react-router-dom';
import { daysUntilDateOnly, formatTimestamp } from '../../helpers/transformers.jsx';
import Empty from '../simple/Empty.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFlag } from '@fortawesome/free-solid-svg-icons';

const priorityColorMap = {
  "low": "blue",
  "medium": "yellow",
  "high": "red"
};
const LoansUrgent = ({loans}) => {
  const navigate = useNavigate();

  const content = loans.map((loan) => {
    return <div onClick={() => navigate(`/loans?id=${loan.id}`)}
                className={"hover:cursor-pointer grid grid-cols-[1fr_3fr_4fr_4fr] text-xl gap-[5px] items-center items-border text-[var(--color-text)] !pt-[5px] !pb-[5px] lift-scale"}
                key={loan.id}>
      {
        loan.priority ?
          <span title={`${loan.priority} priority`}>
            <FontAwesomeIcon size={"xs"} icon={faFlag} style={{ color: priorityColorMap[loan.priority] }}/>
          </span> : <span/>
      }
      {
        loan.deadline ? (() => {
          const days = daysUntilDateOnly(loan.deadline);
          const color = days < 0 ? 'red' : 'green';

          return (
            <span className={"font-b text-clipped"}
                  title={formatTimestamp(loan.deadline, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })} style={{ color }}>
                {Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''}
            </span>
          );
        })() : <span/>
      }
      <span title={loan.counterparty.name} className={"text-clipped"}>
        {loan.name}
      </span>
      <span className={"text-right block shrink-0 whitespace-nowrap bg-[var(--color-sec)]/90 w-full rounded-[5px]"}>
        {loan.price} €
      </span>
    </div>
  });

  return (
    <div
      className={"flex flex-col justify-center bg-[var(--color-main)] p-[10px] animate-fade-in rounded-[15px]"}>
      {
        content.length > 0 ?
          <>
            <span className={"text-[var(--color-text)] text-xl uppercase font-bold mb-[5px] align-middle self-center"}>Upcoming Deadlines</span>
            <div>{content}</div>
          </> :
          <Empty bgColor={"var(--color-main)"} text={"No urgent loans"}/>
      }
    </div>
  )
}

export default LoansUrgent;