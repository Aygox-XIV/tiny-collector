import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

export default [
    layout('routes/base.tsx', [
        index('routes/home.tsx'),
        route('catalog', 'catalog/view.tsx', [
            // /catalog : main catalog view
            // /catalog/:iid : catalog view w/ selected item
            route(':iid', 'catalog/item-view.tsx'),
        ]),
        ...prefix('license', [
            // /calc : license calculator view
            // filters are controlled by query params
            index('license/view.tsx'),
        ]),
        route('checklist', 'checklist/view.tsx'),
        route('settings', 'settings/view.tsx'),
    ]),
] satisfies RouteConfig;
