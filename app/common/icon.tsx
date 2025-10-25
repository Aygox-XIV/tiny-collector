import type React from 'react';
import { BsQuestionSquare } from 'react-icons/bs';

export interface IconProp {
    readonly wiki_path?: string;
}

export const Icon: React.FC<IconProp> = ({ wiki_path }) => {
    if (wiki_path) {
        return <img className="item-icon" src={'https://static.wikia.nocookie.net/tiny-shop/images/' + wiki_path} />;
    }
    return <BsQuestionSquare />;
};
