import { scopeStyle } from './scopeStyle.js';

console.log(await scopeStyle('div { color: blue; }', 'foo'))