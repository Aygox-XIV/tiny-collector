import type React from 'react';
import { BsQuestionSquare } from 'react-icons/bs';

export const WIKI_IMAGE_PATH_PREFIX = 'https://static.wikia.nocookie.net/tiny-shop/images/';

export interface IconProp {
    readonly wiki_path?: string;
}

export const Icon: React.FC<IconProp> = ({ wiki_path }) => {
    if (wiki_path) {
        return <img className="item-icon" src={WIKI_IMAGE_PATH_PREFIX + wiki_path} />;
    }
    return <BsQuestionSquare className="item-icon" />;
};
