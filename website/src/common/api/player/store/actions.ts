import { createAction } from '@reduxjs/toolkit';

import Player from '../player';

const setPlayer = createAction<Player>('SET_PLAYER');

export { setPlayer };
