import React, { ReactNode, ReactNodeArray } from 'react';

import MenuItem from './menu-item';

interface MenuProps {
	children: ReactNode | ReactNodeArray;
}

function Menu({ children }: MenuProps) {
	return <ul className="space-y-4">{children}</ul>;
}

Menu.Item = MenuItem;

export default Menu;
