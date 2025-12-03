import { formatTimestamp } from './time.js';

export const formToast = (text) => {
  return (<span className={"text-xs text-black"}>
    {text}
  </span>)
}

export const formToastMain = (entity, name, timestamp, action) => {
  return formToast(<>
    <span className={"capitalize"}>{entity}</span> <b>"{name}"</b> at <b>{formatTimestamp(timestamp, {
    hour: '2-digit',
    minute: '2-digit',
    month: 'short',
    year: 'numeric',
    day: '2-digit'
  })}</b> has been successfully {action}!
  </>);
}