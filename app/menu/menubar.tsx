import type React from 'react';
import { NavLink } from 'react-router';
import { CATALOG_PARAM } from '../catalog/filterbar';
import { useCatalogFilter } from '../catalog/filtercontext';
import { useSourceFilter } from '../checklist/filtercontext';

interface MenuItemProps {
    text: string;
    url: string;
}

/** element in the catalog list */
const MenuItem: React.FC<MenuItemProps> = ({ text, url }) => {
    // TODO: make selection target larger
    return (
        <div className="menu-item">
            <NavLink to={url}>{text}</NavLink>
        </div>
    );
};

export const MenuBar: React.FC = () => {
    const [catalogFilter] = useCatalogFilter();
    const [checklistFilter] = useSourceFilter();
    const catalog_params = catalogFilter.catalogView ? '?' + CATALOG_PARAM + '=' + catalogFilter.catalogView : '';
    return (
        <div className="menu-bar">
            <MenuItem text="Catalog" url={'/catalog' + catalog_params} />
            <MenuItem text="License Calculator" url="/calc" />
            <MenuItem text="Checklist" url={'/checklist' + (checklistFilter.urlParam || '')} />
            <MenuItem text="Data management" url="/settings" />
            <MenuItem text="Help" url="/help" />
        </div>
    );
};
