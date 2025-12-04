import { useCallback, useState } from 'react';
import { createPortal } from 'react-dom';
import { GridLoader } from 'react-spinners';
import { twMerge } from 'tailwind-merge';

const defaultState = {
  loading: false,
  message: ""
};

const useLoader = ({
                     color = "var(--color-third)",
                     overlayColor = "",
                     size = 30,
                     LoaderComp = GridLoader,
                     global = true,
                     isLoading = false
                   } = {}) => {
  const [loader, setLoader] = useState({loading: isLoading, message: defaultState.message});

  const showLoader = useCallback((message = "") => {
    setLoader({
      loading: true,
      message
    })
  }, []);

  const hideLoader = useCallback(() => setLoader(defaultState), []);

  const LoaderElement = useCallback(({children}) => {
    if (!loader.loading) return <>{children}</>;

    return global ? createPortal(<div
        className={twMerge("fixed gap-[15px] overlay z-[4000] flex flex-col justify-center items-center", `${overlayColor && '!'}${overlayColor}`)}>
        <LoaderComp size={size} color={color}/>
        {loader.message && (
          <span className="text-[var(--color-main)] font-bold">
            {loader.message}
          </span>
        )}
      </div>, document.body) :
      <LoaderComp size={size} color={color}/>;
  }, [color, global, loader, size]);

  return {
    showLoader,
    hideLoader,
    LoaderElement
  };
}


export default useLoader;