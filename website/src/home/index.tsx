import React, { useState } from 'react';

import Menu from './menu';
import { TAB_PAGES, Tab } from './pages';

function Home() {
	const [selectedTab, setSelectedTab] = useState(Tab.FRIENDS);

	// render sidebar menu items
	function renderMenuItems() {
		return Object.keys(Tab).map((tab) => {
			const { label, icon } = TAB_PAGES[tab as keyof typeof Tab];
			return (
				<Menu.Item
					key={label}
					selected={selectedTab === tab}
					icon={icon}
					onClick={() => setSelectedTab(Tab[tab as keyof typeof Tab])}
				>
					{label}
				</Menu.Item>
			);
		});
	}

	// render the selected tab page
	function renderTabPage() {
		const ActiveTabPage = TAB_PAGES[selectedTab].page;
		return <ActiveTabPage />;
	}

	return (
		<div className="flex flex-row h-screen w-screen">
			<div className="flex flex-col self-stretch pl-16 pr-20 py-20 bg-gray-200 shadow-inner shadow-lg">
				<h3 className="text-3xl font-bold mb-16">OpenKub</h3>
				<Menu>{renderMenuItems()}</Menu>
			</div>
			<div className="flex flex-auto pt-20 justify-center">{renderTabPage()}</div>
		</div>
	);
}

export default Home;
