import type React from 'react';
import { NavLink } from 'react-router';

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
    return (
        <div className="menu-bar">
            <MenuItem text="Catalog" url="/catalog" />
            <MenuItem text="License Calculator" url="/calc" />
            <MenuItem text="Checklist" url="/checklist" />
            <MenuItem text="Data management" url="/settings" />
        </div>
    );
};
