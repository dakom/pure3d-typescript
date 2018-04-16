import {isProductionBuild} from "../App-Main";

export interface Maybe<A> {
  isNothing:boolean;
  isJust:boolean;
  value:A;
}

export interface Either<A> {
  isLeft:boolean;
  isRight:boolean;
  value:A;
}

import {create, env} from 'sanctuary';
const checkTypes = false; //!isProductionBuild;
export const S = create({checkTypes, env}); 