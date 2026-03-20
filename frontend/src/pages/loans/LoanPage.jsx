import { useParams } from "react-router-dom";
import useLoader from '../../hooks/useLoader.jsx';
import { ScaleLoader } from 'react-spinners';
import api from '../../services/axios.js';
import { formToast } from '../../helpers/toast.jsx';
import { toast } from 'react-toastify';
import LoansCard from '../../components/loans/LoansCard.jsx';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const LoanPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loan, setLoan] = useState(null);

  const onSendEdited = useCallback(async (newLoan) => {
    if (newLoan) setLoan(newLoan);
  }, []);

  const onAfterDeleteSuccess = useCallback(() => navigate("/loans"), [navigate]);

  const {
    showLoader: showLoanLoader,
    hideLoader: hideGetLoader,
    LoaderElem: GetLoader
  } = useLoader({ isLoading: true, color: "var(--color-sec)", global: false, LoaderComp: ScaleLoader });

  useEffect(() => {
    (async () => {
      showLoanLoader();

      const { data, message } = await api.get(`/loans/${id}`);

      if (!data) {
        toast.error(formToast(message));
        navigate('/loans');
        hideGetLoader();
        return;
      }

      setLoan(data);
      hideGetLoader();
    })();
  }, [hideGetLoader, id, navigate, showLoanLoader]);

  return (
    <GetLoader>
      <div className={"loans-list-wrapper"}>
        {loan && <LoansCard loan={loan} onAfterEdit={onSendEdited} onAfterDeleteSuccess={onAfterDeleteSuccess} />}
      </div>
    </GetLoader>
  )
}

export default LoanPage;