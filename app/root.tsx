import { isRouteErrorResponse, Links, Meta, Outlet, Scripts, ScrollRestoration, useSearchParams } from 'react-router';

import { useState } from 'react';
import { Provider } from 'react-redux';
import type { Route } from './+types/root';
import './app.css';
import { CATALOG_PARAM } from './catalog/filterbar';
import { CatalogFilterContext, type CatalogFilter } from './catalog/filtercontext';
import { CHECKLIST_EVENT_PARAM } from './checklist/eventfilter';
import { SourceFilterContext, type SourceFilter } from './checklist/filtercontext';
import { CatalogType } from './database/database';
import { EventCategory } from './database/sources';
import { LicenseFilterContext, type LicenseFilter } from './license/filtercontext';
import { store } from './store';

export const links: Route.LinksFunction = () => [
    { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
    {
        rel: 'preconnect',
        href: 'https://fonts.gstatic.com',
        crossOrigin: 'anonymous',
    },
    {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap',
    },
    {
        rel: 'icon',
        type: 'image/png',
        href: '/autolog.png',
    },
];

export function meta({}: Route.MetaArgs) {
    return [{ title: 'Tiny Collector' }];
}

export function Layout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App({ loaderData }: Route.ComponentProps) {
    const [searchParams] = useSearchParams();
    // Filter contexts are put here so they persist between navigating
    const sourceFilterState = useState<SourceFilter>(getDefaultChecklistFilter(searchParams));
    const licenseFilterstate = useState<LicenseFilter>({});
    const catalogFilterState = useState<CatalogFilter>(getDefaultCatalogFilter(searchParams));
    return (
        <Provider store={store}>
            <CatalogFilterContext value={catalogFilterState}>
                <LicenseFilterContext value={licenseFilterstate}>
                    <SourceFilterContext value={sourceFilterState}>
                        <Outlet />
                    </SourceFilterContext>
                </LicenseFilterContext>
            </CatalogFilterContext>
        </Provider>
    );
}

function getDefaultCatalogFilter(searchParams: URLSearchParams): CatalogFilter {
    const catalogType = searchParams.get(CATALOG_PARAM) as CatalogType;
    if (new Set(Object.values(CatalogType)).has(catalogType)) {
        return { catalogView: catalogType };
    }
    return {};
}

function getDefaultChecklistFilter(searchParams: URLSearchParams): SourceFilter {
    const eventCategory = searchParams.get(CHECKLIST_EVENT_PARAM) as EventCategory;
    if (new Set(Object.values(EventCategory)).has(eventCategory)) {
        const hiddenEvents = new Set(Object.values(EventCategory));
        hiddenEvents.delete(eventCategory);
        return { hiddenEvents, urlParam: '?' + CHECKLIST_EVENT_PARAM + '=' + eventCategory };
    }
    return {};
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
    let message = 'Oops!';
    let details = 'An unexpected error occurred.';
    let stack: string | undefined;

    if (isRouteErrorResponse(error)) {
        message = error.status === 404 ? '404' : 'Error';
        details = error.status === 404 ? 'The requested page could not be found.' : error.statusText || details;
    } else if (import.meta.env.DEV && error && error instanceof Error) {
        details = error.message;
        stack = error.stack;
    }

    return (
        <main className="pt-16 p-4 container mx-auto">
            <h1>{message}</h1>
            <p>{details}</p>
            {stack && (
                <pre className="w-full p-4 overflow-x-auto">
                    <code>{stack}</code>
                </pre>
            )}
        </main>
    );
}
