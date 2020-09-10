import { initPatch } from './_patch';
import attrs from './modules/attr'
import clz from './modules/class'
import events from './modules/event'
import styles from './modules/style'

export const patch = initPatch([ attrs, clz, events, styles ])
