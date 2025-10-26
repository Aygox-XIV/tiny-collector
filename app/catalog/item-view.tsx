import { useDatabase } from '../database/database';
import type { Route } from './+types/item-view';
import { Details } from './details';

export default function ItemDetailView({ params, matches }: Route.ComponentProps) {
    const db = useDatabase();
    // boring input validation
    const itemExists = parseInt(params.iid) && !!db.items[params.iid];
    return itemExists ? <Details id={params.iid} /> : <div className="invis" />;
}
