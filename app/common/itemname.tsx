import { BsHouse } from 'react-icons/bs';
import { FaSeedling } from 'react-icons/fa';
import { GiCarnivalMask } from 'react-icons/gi';
import type { Item } from '../database/database';

export interface ItemNameProps {
    readonly item: Item;
}

export const ItemName: React.FC<ItemNameProps> = ({ item }) => {
    return (
        <div className="item-name">
            {item.name}
            {item.category == 'Plant' && <FaSeedling />}
            {item.category == 'Cosmetic' && <GiCarnivalMask />}
            {item.category == 'Decor' && <BsHouse />}
        </div>
    );
};
