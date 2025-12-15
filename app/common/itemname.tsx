import { FaSeedling } from 'react-icons/fa';
import type { Item } from '../database/database';

export interface ItemNameProps {
    readonly item: Item;
}

export const ItemName: React.FC<ItemNameProps> = ({ item }) => {
    return (
        <div className="item-name">
            {item.name}
            {item.category == 'Plant' && <FaSeedling />}
        </div>
    );
};
