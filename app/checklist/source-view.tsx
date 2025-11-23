import { useDatabase } from '../database/database';
import type { Route } from './+types/source-view';

export default function SourceDetailView({ params, matches }: Route.ComponentProps) {
    const db = useDatabase();
    // boring input validation
    const sourceExists = !!db.sources[params.sid.toString()];
    return sourceExists ? <div>source details for {params.sid.toString()}</div> : <div className="invis" />;
}
