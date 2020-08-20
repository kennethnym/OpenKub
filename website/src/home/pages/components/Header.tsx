import React, { ReactNode } from 'react';

interface HeaderProps {
	children: ReactNode;
}

function Header({ children }: HeaderProps) {
	return <h1 className="text-4xl font-bold mb-8">{children}</h1>;
}

export default Header;
