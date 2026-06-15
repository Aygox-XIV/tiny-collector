import { useContext, useEffect } from 'react';
import { Outlet } from 'react-router';
import { useCollectionInitialized } from '../collection';
import { load, loadCollection } from '../collectionSlice';
import { Footer } from '../menu/footer';
import { Header } from '../menu/header';
import { MenuBar } from '../menu/menubar';
import { useAppDispatch } from '../store';
import { StyleInfoContext, useStyleClass } from '../style';
import type { Route } from './+types/base';

export default function Base({ loaderData, actionData, params, matches }: Route.ComponentProps) {
    const dispatch = useAppDispatch();
    const initialized = useCollectionInitialized();
    const [, setStyleInfo] = useContext(StyleInfoContext);
    const styleClass = useStyleClass();
    useEffect(() => {
        if (!initialized) {
            // TODO: spinner via hydration?
            const collection = loadCollection();
            dispatch(load(collection));
            setStyleInfo({ smallScreen: collection.smallScreen });
        }
    });
    return (
        <div className={'content' + styleClass}>
            <Header />
            <MenuBar />
            <Outlet />
            <Footer />
        </div>
    );
}
