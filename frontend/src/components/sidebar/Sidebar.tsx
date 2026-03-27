import {useEffect, useState} from 'react';
import {toast} from 'react-toastify';
import {formToast} from '../../helpers/toast';
import {daysUntilDateOnly} from '../../helpers/time';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faAt, faFlag, faPhone, faVault, faWallet} from '@fortawesome/free-solid-svg-icons';
import {useNavigate} from 'react-router-dom';
import SidebarComponent from './SidebarComponent';
import {formatTimestamp} from '../../helpers/time';
import api from '../../services/axios';
import {priorityColorMap} from '../../helpers/variables';
import {twMerge} from 'tailwind-merge';
import IconButton from '../simple/IconButton';
import {AllowedResClient, CounterpartyGetClient, LoanGetClient, PagEntityGet} from "../../types/components/mappings";

interface SidebarState {
    loans: PagEntityGet<'loan'>[],
    balance: PagEntityGet<'counterparty'>[],
}

const defaultValue: SidebarState = {loans: [] as SidebarState['loans'], balance: [] as SidebarState['balance']}
const Sidebar = () => {
    const [data, setData] = useState<SidebarState>(defaultValue);
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const {
                data: newLoans,
                message: loansMsg
            } = await api.getPaginated<PagEntityGet<'loan'>>("/loans", {due: true});

            if (!newLoans) {
                toast.error(formToast(loansMsg))
                setData(defaultValue);
                return;
            }

            const {
                data: newBalance,
                message: balanceMsg
            } = await api.getPaginated<PagEntityGet<'counterparty'>>("/counterparties");

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

    const getLoansLink = <T extends AllowedResClient>(item: T) => `/loans/${item.id}`;
    const getCounterLink = <T extends AllowedResClient>(item: T) => `/counterparties/${item.id}`;

    const renderLoanItem = (loan: LoanGetClient) => {
        return (
            <>
                {
                    loan.priority ?
                        <span title={`${loan.priority} priority`}>
            <FontAwesomeIcon size={"xs"} icon={faFlag} style={{color: priorityColorMap[loan.priority]}}/>
          </span> : <span/>
                }
                <span title={loan.type}>
          <FontAwesomeIcon size={"xs"} icon={loan.type === "borrowed" ? faVault : faWallet}/>
        </span>
                {
                    loan.deadline ? (() => {
                        const days = daysUntilDateOnly(loan.deadline.toString());

                        return (
                            <span
                                className={twMerge("font-b text-clipped text-(--color-pos)!", days <= 0 && "text-(--color-third)!")}
                                title={formatTimestamp(loan.deadline, {
                                    day: '2-digit',
                                    month: 'short',
                                    year: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}>
                {Math.abs(days)} day{Math.abs(days) !== 1 ? 's' : ''}
            </span>
                        );
                    })() : <span/>
                }
                <span title={loan.counterparty.name} className={"text-clipped"}>{loan.name}</span>
                <span className={"price-wrapper"}>{loan.sum} €</span>
            </>
        )
    }

    const renderCounterItem = (item: CounterpartyGetClient) => {
        //IconLink can't be used here as there will be nested <a>'s
        return (
            <>
        <span className={"flex justify-center w-full shrink-0 whitespace-nowrap text-(--color-text)"}>
          {item.phone &&
            <IconButton title={`Call +${item.phone}`} onClick={() => navigate(`tel:+${item.phone}`)} icon={faPhone}
                        iconClassName={"text-(--color-third)"}/>}
            {item.email &&
              <IconButton title={`Mail ${item.email}`} onClick={() => navigate(`mailto:${item.email}`)} icon={faAt}
                          iconClassName={"text-(--color-third)"}/>}
        </span>
                <span className={"text-clipped"}>{item.name}</span>
                <span className={twMerge(
                    "price-wrapper bg-(--color-pos)/80!",
                    item.balance > 0 && "bg-(--color-third)/80!"
                )}>{Math.abs(item.balance)} €</span>
            </>
        )
    }

    return (<div
        className={"flex flex-col gap-[15px] sml:max-lrg:grid sml:max-lrg:grid-cols-2 s-scroll s-scroll-alt-color w-full max-lrg:min-h-fit bg-(--color-sec) max-lrg:overflow-visible lrg:overflow-y-auto lrg:h-full sml:p-[15px_15px] max-sml:p-[15px_2px]"}>
        <SidebarComponent items={data.loans} title={"Upcoming Deadlines"} emptyText={"No urgent loans found"}
                          getItemLink={getLoansLink} renderItem={renderLoanItem}
                          gridCols={"grid-cols-[1fr_1fr_3fr_4fr_4fr]"}
                          lClassName={"items-center text-(--color-text) !pt-[5px] !pb-[5px]"}/>
        <SidebarComponent items={data.balance} title={"Balance"} emptyText={"No counterparties found"}
                          getItemLink={getCounterLink} renderItem={renderCounterItem}
                          gridCols={"grid-cols-[2fr_5fr_5fr]"}/>
    </div>)
}

export default Sidebar;