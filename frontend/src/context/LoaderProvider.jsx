import { createContext, useContext, useState } from 'react';
import { createPortal } from 'react-dom';
import { GridLoader } from 'react-spinners';

const defaultState = {
  loading: false,
  message: ""
};

const LoaderContext = createContext({});
const LoaderProvider = ({ children }) => {
  const [loader, setLoader] = useState(defaultState)

  const showLoader = (message="") => {
    setLoader({
      loading: true,
      message
    })
  }

  const hideLoader = () => setLoader(defaultState)

  return <LoaderContext.Provider value={{showLoader, hideLoader}}>
    {children}
    {
      loader.loading && createPortal(<div className={"fixed gap-[15px] overlay z-[4000] flex flex-col justify-center items-center"}>
        <GridLoader size={30} color={"#D91656"}/>
        {loader.message && <span className={"text-[var(--color-third)] font-bold"}>{loader.message}</span>}
      </div>, document.body)
    }
  </LoaderContext.Provider>;
}

const useLoader = () => useContext(LoaderContext);
export { LoaderProvider, useLoader };