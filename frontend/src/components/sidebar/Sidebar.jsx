import { useEffect, useState } from 'react';
import axios from '../../services/axios.js';
import { toast } from 'react-toastify';
import { formToast } from '../../helpers/toast.jsx';
import { daysUntilDateOnly } from '../../helpers/time.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAt, faFlag, faPhone, faVault, faWallet } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import SidebarComponent from './SidebarComponent.jsx';
import { formatTimestamp } from '../../helpers/time.js';

const priorityColorMap = {
  "low": "blue",
  "medium": "yellow",
  "high": "red"
};

const defaultValue = { loans: [], balance: [] }
const Sidebar = () => {
  const [data, setData] = useState(defaultValue);

  useEffect(() => {
    (async () => {
      const { data: newLoans, message: loansMsg } = await axios.get("/loans", { due: true });

      if (!newLoans) {
        toast.error(formToast(loansMsg))
        setData(defaultValue);
        return;
      }

      const { data: newBalance, message: balanceMsg } = await axios.get("/counterparties", { balance: true });

      if (!newBalance) {
        toast.error(formToast(balanceMsg))
        setData(prev => ({
          ...prev,
          balance: defaultValue.balance
        }));
        return;
      }

      setData({
        loans: newLoans.data,
        balance: newBalance.data
      });
    })();
  }, []);

  const getLoansLink = (item) => `/loans?id=${item.id}`;
  const getCounterLink = (item) => `/counterparties/${item.id}`;

  const renderLoanItem = (loan) => {
    return (
      <>
        {
          loan.priority ?
            <span title={`${loan.priority} priority`}>
            <FontAwesomeIcon size={"xs"} icon={faFlag} style={{ color: priorityColorMap[loan.priority] }}/>
          </span> : <span/>
        }
        <span title={loan.type}>
          <FontAwesomeIcon size={"xs"} icon={loan.type === "borrowed" ? faVault : faWallet} />
        </span>
        {
          loan.deadline ? (() => {
            const days = daysUntilDateOnly(loan.deadline);
            const color = days < 0 ? 'red' : 'green';

            return (
              <span className={"font-b text-clipped"}
                    title={formatTimestamp(loan.deadline, {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })} style={{ color }}>
                {Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''}
            </span>
            );
          })() : <span/>
        }
        <span title={loan.counterparty.name} className={"text-clipped"}>{loan.name}</span>
        <span className={"price-wrapper"}>{loan.price} €</span>
      </>
    )
  }
  const renderCounterItem = (item) => {
    return (
      <>
        <span className={"flex justify-center w-full shrink-0 whitespace-nowrap"}>
          {item.phone && <Link title={`+${item.phone}`} to={`tel:+${item.phone}`}>
            <FontAwesomeIcon color={"var(--color-third)"} icon={faPhone}/>
          </Link>}
          {item.email && <Link title={item.email} to={`mailto:${item.email}`}>
            <FontAwesomeIcon color={"var(--color-third)"} icon={faAt}/>
          </Link>}
        </span>
        <span className={"text-clipped text-[var(--color-text)]"}>{item.name}</span>
        <span className={"price-wrapper"}
              style={{ color: parseFloat(item.balance) > 0 ? "red" : "green" }}>{item.balance} €</span>
      </>
    )

  }

  return (<div
    className={"flex flex-col gap-[15px] s-scroll s-scroll-alt-color w-full min-h-fit bg-[var(--color-sec)] max-lrg:overflow-visible lrg:overflow-y-auto lrg:h-screen p-[15px_15px]"}>
    <SidebarComponent items={data.loans} title={"Upcoming Deadlines"} emptyText={"No urgent loans found"}
                      getItemLink={getLoansLink} renderItem={renderLoanItem} gridCols={"grid-cols-[1fr_1fr_3fr_4fr_4fr]"}
                      iwClass={"items-center text-[var(--color-text)] !pt-[5px] !pb-[5px]"}/>
    <SidebarComponent items={data.balance} title={"Balance"} emptyText={"No counterparties found"}
                      getItemLink={getCounterLink} renderItem={renderCounterItem} gridCols={"grid-cols-[2fr_5fr_5fr]"}/>
  </div>)
}

export default Sidebar;