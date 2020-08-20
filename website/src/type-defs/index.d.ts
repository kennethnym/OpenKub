///<reference types="webpack-env" />

declare module 'react-router-transition' {
	interface AnimatedSwitchProps {
		atEnter: Object;
		atLeave: Object;
		atActive: Object;
		mapStyles?: (styles: Object) => Object;
		runOnMount?: boolean;
	}

	export const AnimatedSwitch: React.FC<AnimatedSwitchProps>;
}

interface Array<T> {
	filter<U extends T>(pred: (a: T) => a is U): U[];
}

type Optional<T> = T | undefined;
