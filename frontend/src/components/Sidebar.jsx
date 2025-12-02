import LoansUrgent from './loans/LoansUrgent.jsx';
import { useEffect, useState } from 'react';
import axios from '../services/axios.js';
import { toast } from 'react-toastify';
import { formToast } from '../helpers/transformers.jsx';

const defaultValue = { loans: [], balance: [] }
const Sidebar = () => {
  const [data, setData] = useState(defaultValue);

  useEffect(() => {
    (async () => {
      const { data: newLoans, message: loansMsg } = await axios.get("/loans/due");

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
        balance: newBalance.data,
      });
    })();
  }, []);

  return (<div
    className={"flex flex-col gap-[10px] w-full h-fit bg-[var(--color-sec)] lrg:overflow-y-auto lrg:h-screen p-[10px_5px]"}>
    <LoansUrgent loans={data.loans} />
  </div>)
}

export default Sidebar;