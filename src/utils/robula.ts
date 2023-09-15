import { RobulaPlus } from 'px-robula-plus';
const robulaPlus = new RobulaPlus();

export const getElementByXPath = robulaPlus.getElementByXPath.bind(robulaPlus);
export const getRobustXPath = robulaPlus.getRobustXPath.bind(robulaPlus);
