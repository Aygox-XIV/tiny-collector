import { useEffect } from 'react';
import { NavLink, Outlet } from 'react-router';
import { load, loadCollection, useCollectionInitialized } from '../collection';
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
            <div className="header">
                <NavLink to="/">Tiny Shop collection tracker</NavLink>
            </div>
            <MenuBar />
            <Outlet />
        </div>
    );
}
