import { NavLink } from 'react-router';
import { load, parseCollection, useFullCollection } from '../collection';
import { loadFile, saveFile } from '../common/files';
import { useAppDispatch } from '../store';
import type { Route } from './+types/view';

export default function SettingsView({ params, matches }: Route.ComponentProps) {
    const dispatch = useAppDispatch();
    // TODO: compress by removing redundant fields (maybe provide as separate option to compress localStorage?)
    const collectionJson = JSON.stringify({ items: useFullCollection().items });
    const collectionJsonBase64 = btoa(collectionJson);
    // TODO: something that works in more than just Chromium (textbox input, probably)
    const loadColl = () => loadFile((f) => dispatch(load(parseCollection(f))));
    const saveColl = () => saveFile(collectionJson);
    // this yields an error (in dev?) when loading the /settings directly because SSR!=CSR. that's fine if it's only in dev.
    let fsAvailable = typeof window !== 'undefined' && window.showSaveFilePicker !== undefined;
    return (
        <div className="settings-view center-content">
            <div className="collection-data-management">
                All per-user data is kept locally in the browser (localStorage); nothing is ever sent to the server.
                <br />
                Use this page to save your collection to a local file, for backup purposes or to e.g. move it to another
                device. For now, only Chromium-based browsers (Chrome, Edge) support importing. A fallback option for
                other browsers is in the works.
                <br />
                <br />
                <div className="settings-item">
                    {fsAvailable && <a onClick={saveColl}>Export collection</a>}
                    {!fsAvailable && (
                        <a href={'data:application/octet-stream;charset=utf-16le;base64,' + collectionJsonBase64}>
                            Export collection via data url (saving as .txt is recommended)
                        </a>
                    )}
                </div>
                <br />
                <div className="settings-item">
                    {fsAvailable && <a onClick={loadColl}>Import collection</a>}
                    {!fsAvailable && <div>Importing is only available in Chromium browsers (Chrome, Edge) for now</div>}
                </div>
                <br />
                <br />
                <br />
                <br />
                <div className="settings-item">
                    <a onClick={() => dispatch(load({ items: {} }))}>
                        Reset collection (warning: not recoverable unless you've exported it)
                    </a>
                </div>
            </div>
            <div className="dev-settings-link">
                <NavLink to="/db-mgmt">Click here for database management options.</NavLink>
            </div>
        </div>
    );
}
