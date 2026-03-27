import {Link} from 'react-router-dom';
import Empty from '../simple/Empty';
import {twMerge} from 'tailwind-merge';
import {ChildrenProp} from "../../types/basic";
import React, {ReactNode} from "react";
import {AllowedResClient} from "../../types/components/mappings";

type ComponentItemProp =
    ChildrenProp
    & Pick<React.HTMLAttributes<HTMLDivElement>, 'className'>
    & { gridCols: string };
const ComponentItem = ({gridCols, children, className}: ComponentItemProp) => {
    return (
        <div
            className={twMerge(`grid ${gridCols} gap-[5px]`, className)}
        >
            {children}
        </div>
    )
}

interface SidebarComponentProps<T extends AllowedResClient> {
    gridCols: string;
    title: string;
    emptyText: ReactNode;
    lClassName?: string;
    className?: string;
    items: T[],
    renderItem: (item: T) => ReactNode;
    getItemLink: (item: T) => string;
}

const SidebarComponent = <T extends AllowedResClient>({
                                                          items,
                                                          title,
                                                          emptyText,
                                                          gridCols,
                                                          renderItem,
                                                          getItemLink,
                                                          lClassName,
                                                          className
                                                      }: SidebarComponentProps<T>) => {
    const content = items.map(item => (
            <Link to={getItemLink(item)} key={item.id}
                  className={twMerge("block items-border text-xl lrg:lift-scale max-lrg:lift-scale-small", lClassName)}>
                <ComponentItem key={item.id} gridCols={gridCols} className={className}>
                    {renderItem(item)}
                </ComponentItem>
            </Link>
        )
    );

    return (
        <>
            {
                content.length > 0 ?
                    <div
                        className={twMerge("flex flex-col justify-center bg-(--color-main) p-2.5 animate-fade-in rounded-[15px] h-fit text-(--color-text)", className)}>
                        <span
                            className={"text-(--color-text) uppercase text-xl font-bold mb-[5px] align-middle self-center"}>{title}
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