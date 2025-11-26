import { useEffect } from 'react';
import { Outlet } from 'react-router';
import { load, loadCollection, useCollectionInitialized } from '../collection';
import { Footer } from '../menu/footer';
import { Header } from '../menu/header';
import { MenuBar } from '../menu/menubar';
import { useAppDispatch } from '../store';
import type { Route } from './+types/base';

export default function Base({ loaderData, actionData, params, matches }: Route.ComponentProps) {
    const dispatch = useAppDispatch();
    const initialized = useCollectionInitialized();
    useEffect(() => {
        if (!initialized) {
            // TODO: spinner via hydration?
            dispatch(load(loadCollection()));
        }
    });
    return (
        <div className="content">
            <Header />
            <MenuBar />
            <Outlet />
            <Footer />
        </div>
    );
}
