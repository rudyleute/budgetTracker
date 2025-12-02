import { useNavigate, Link } from 'react-router-dom';
import Empty from '../simple/Empty.jsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAt, faPhone } from '@fortawesome/free-solid-svg-icons';

const CounterpartiesBalance = ({ balance }) => {
  const navigate = useNavigate();

  const content = balance.map(item => {
    return <div onClick={() => navigate(`/counterparties/${item.id}`)} className={"hover:cursor-pointer grid grid-cols-[2fr_5fr_5fr] gap-[5px] items-border text-xl lift-scale"}>
      <span className={"flex justify-center w-full shrink-0 whitespace-nowrap"}>
        {item.phone && <Link title={`+${item.phone}`} to={`tel:+${item.phone}`}>
          <FontAwesomeIcon color={"var(--color-third)"} icon={faPhone} />
        </Link>}
        {item.email && <Link title={item.email} to={`mailto:${item.email}`}>
          <FontAwesomeIcon color={"var(--color-third)"} icon={faAt} />
        </Link>}
      </span>
      <span className={"text-clipped text-[var(--color-text)]"}>{item.name}</span>
      <span className={"text-right block shrink-0 whitespace-nowrap bg-[var(--color-sec)]/90 w-full rounded-[5px]"} style={{color: parseFloat(item.balance) > 0 ? "red" : "green"}}>{item.balance} €</span>
    </div>
  });

  return (
    <div>
      {
        content.length > 0 ? <div className={"flex flex-col justify-center bg-[var(--color-main)] p-[10px] animate-fade-in rounded-[15px]"}>
          <span className={"text-[var(--color-text)] uppercase text-xl font-bold mb-[5px] align-middle self-center"}>Counterparties</span>
          <div>{content}</div>
        </div> : <Empty bgColor={"var(--color-main)"} text={"No counterparties found"} />
      }
    </div>
  )
}

export default CounterpartiesBalance;