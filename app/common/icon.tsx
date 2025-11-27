import type React from 'react';
import { BsQuestionSquare } from 'react-icons/bs';
import { getImgSrc, type ImageRef } from '../database/database';

export interface IconProp {
    readonly src?: ImageRef;
}

export const Icon: React.FC<IconProp> = ({ src }) => {
    if (src) {
        return <img className="item-icon" src={getImgSrc(src)} />;
    }
    return <BsQuestionSquare className="item-icon" />;
};
