import { createContext, useContext, useState } from 'react';
import Modal from '../simple/Modal.jsx';

const ModalContext = createContext({});
const ModalProvider = ({ children }) => {
  const [stack, setStack] = useState([]);

  const showModal = (title, content, saveFunc = null, closeFunc = null, hideOnSave = false) => {
    setStack(prev => [...prev, {
      content,
      title,
      saveFunc,
      closeFunc,
      hideOnSave
    }]);
  }

  const hideModal = () => setStack(prev => prev.slice(0, -1));

  return (
    <ModalContext.Provider value={{ showModal }}>
      {children}
      {
        stack.map(({ content, title, saveFunc, closeFunc, hideOnSave }, i) => {
          return (<Modal key={i} title={title} zIndex={2000 + i} onClose={() => {
            closeFunc && closeFunc();
            hideModal();
          }} onSubmit={() => {
            saveFunc && saveFunc();
            hideOnSave && hideModal();
          }}>
            {content}
          </Modal>)
        })
      }
      {stack.length > 0 && <div className={"fixed top-0 left-0 w-full h-full z-[1999] bg-black/70"} {...(stack.length === 1 ? {onClick: hideModal} : {})} />}
    </ModalContext.Provider>
  )
}

const useModal = () => useContext(ModalContext);
export { ModalProvider, useModal };