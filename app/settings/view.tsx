import type { Route } from './+types/view';

export default function SettingsView({ params, matches }: Route.ComponentProps) {
    return (
        <div className="settings-view">
            <div className="settings-item">Export collection</div>
            <div className="settings-item">Import collection</div>
            <div className="settings-item">Reset collection</div>
        </div>
    );
}
