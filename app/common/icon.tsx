import type React from 'react';
import { BsQuestionSquare } from 'react-icons/bs';
import { getImgSrc, type ImageRef } from '../database/database';

export interface IconProp {
    readonly src?: ImageRef;
}

export const Icon: React.FC<IconProp> = ({ src }) => {
    if (src) {
        return (
            <div className="item-icon-container">
                <img className="item-icon" src={getImgSrc(src)} loading="lazy" decoding="async" />
            </div>
        );
    }
    return (
        <div className="item-icon-container">
            <BsQuestionSquare className="item-icon" />
        </div>
    );
};
