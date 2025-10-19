import type { Route } from './+types/item-view';
import { Details } from './details';

export default function ItemDetailView({ params, matches }: Route.ComponentProps) {
    const itemId = parseInt(params.iid);
    return !!itemId ? <Details id={itemId} /> : <div className="invis" />;
}
