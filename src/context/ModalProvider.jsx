import { createContext, useContext, useState } from 'react';
import Modal from '../components/simple/Modal.jsx';

const ModalContext = createContext({});
const ModalProvider = ({ children }) => {
  const [stack, setStack] = useState([]);

  const showModal = (title, content, closeFunc = null, saveFunc = null, hideOnSave = false) => {
    setStack(prev => [...prev, {
      content,
      title,
      closeFunc,
      saveFunc,
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
          }} onSubmit={async () => {
            saveFunc && await saveFunc();
            hideOnSave && hideModal();
          }}>
            {content}
          </Modal>)
        })
      }
      {stack.length > 0 && <div className={"overlay z-[1999]"} {...(stack.length === 1 ? {onClick: hideModal} : {})} />}
    </ModalContext.Provider>
  )
}

const useModal = () => useContext(ModalContext);
export { ModalProvider, useModal };