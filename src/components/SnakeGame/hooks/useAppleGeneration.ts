
import { Apple } from '../types';
import { GRID_SIZE } from '../constants';

export const generateApple = (): Apple => ({
  position: {
    x: Math.floor(Math.random() * GRID_SIZE),
    y: Math.floor(Math.random() * GRID_SIZE),
  },
});
