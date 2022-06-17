import { scopeStyle } from '../server/scopeStyle.js';

console.log(await scopeStyle('div { color: blue; }', 'foo'))