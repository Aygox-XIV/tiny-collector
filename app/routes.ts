import { type RouteConfig, index, layout, prefix, route } from '@react-router/dev/routes';

export default [
    layout('routes/base.tsx', [
        index('routes/home.tsx'),
        route('catalog', 'catalog/view.tsx', [
            // /catalog : main catalog view
            // /catalog/:iid : catalog view w/ selected item
            route(':iid', 'catalog/item-view.tsx'),
        ]),
        ...prefix('calc', [
            // /calc : license calculator view
            // (/license will render the MIT license if refreshed by the user :/ )
            index('license/view.tsx'),
        ]),
        route('checklist', 'checklist/view.tsx', [
            // /checkist : main checklist view
            // /checklist/:sid : checklist view w/ selected source
            route(':sid', 'checklist/source-view.tsx'),
        ]),
        route('settings', 'settings/view.tsx'),
        route('db-mgmt', 'datamgmt/view.tsx'),
    ]),
] satisfies RouteConfig;
