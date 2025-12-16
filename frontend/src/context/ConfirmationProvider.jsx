import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import ConfirmationDialog from '../components/simple/ConfirmationDialog.jsx';

const defaultState = {
  isShown: false,
  onAccept: null,
  onReject: null,
  text: null
};

const ConfirmationContext = createContext({});
const ConfirmationProvider = ({ children }) => {
  const [data, setData] = useState(defaultState);

  const onAcceptAct = async () => {
    if (data.onAccept) await data.onAccept();
    setData(defaultState);
  }

  const onRejectAct = () => {
    if (data.onReject) data.onReject();
    setData(defaultState);
  }

  const showConfirmation = useCallback((onAccept, text, onReject = null) => {
    setData({
      isShown: true,
      onAccept,
      onReject,
      text
    });
  }, []);

  const value = useMemo(() => ({ showConfirmation }), [showConfirmation])

  return (
    <ConfirmationContext.Provider value={value}>
      {children}
      {data.isShown &&
        <>
          <ConfirmationDialog onReject={onRejectAct} onAccept={onAcceptAct} text={data.text}/>
          <div className={"overlay z-[2999]"}/>
        </>}
    </ConfirmationContext.Provider>
  )
}

const useConfirmation = () => useContext(ConfirmationContext);
export { ConfirmationProvider, useConfirmation };