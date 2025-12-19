import { useNavigate } from 'react-router-dom';
import Empty from '../simple/Empty.jsx';
import { twMerge } from 'tailwind-merge';

const ComponentItem = ({ onClick, gridCols, children, className }) => {
  return (
    <div onClick={onClick}
         className={twMerge(`hover:cursor-pointer grid ${gridCols} gap-[5px] items-border text-xl lrg:lift-scale max-lrg:lift-scale-small`, className)}
    >
      {children}
    </div>
  )
}

const SidebarComponent = ({ items, title, emptyText, gridCols, renderItem, getItemLink, iwClass, className }) => {
  const navigate = useNavigate();

  const content = items.map(item => (
      <ComponentItem key={item.id} onClick={() => navigate(getItemLink(item))}
                     gridCols={gridCols} className={iwClass}>
        {renderItem(item)}
      </ComponentItem>
    )
  );

  return (
    <>
      {
        content.length > 0 ?
          <div
            className={twMerge("flex flex-col justify-center bg-[var(--color-main)] p-[10px] animate-fade-in rounded-[15px] h-fit text-[var(--color-text)]", className)}>
            <span
              className={"text-[var(--color-text)] uppercase text-xl font-bold mb-[5px] align-middle self-center"}>{title}
            </span>
            <div>{content}</div>
          </div> : <div>
            <Empty bgColor={"var(--color-main)"} text={emptyText}/>
          </div>
      }
    </>
  )
}

export default SidebarComponent;