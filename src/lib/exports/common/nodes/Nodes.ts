import {updateTransform} from "../transform/Transform";
import {NumberArray, NodeTransformUpdateOptions, _Node, CameraNode, LightNode, LightKind, NodeKind} from "../../../Types";
import {getLightDirectionFromMatrix} from "../lights/Lights";
import {mat4} from "gl-matrix";

//filter stuff could use some testing
export const filterNodeDeep = <T extends _Node> (fn: (node:T) => boolean) => (node:T | undefined):T | undefined => {
    if(node === undefined || !fn(node)) {
        return undefined;
    }

    return !node.children
        ? node 
        : Object.assign({}, node, {children: node.children.map(filterNodeDeep(fn)).filter(n => n)});
}

export const filterNodesDeep = <T extends _Node> (fn: (node:T) => boolean) => (nodes:Array<T>):Array<T> => 
    nodes
        .map(filterNodeDeep(fn))
        .filter(n => n);

//Side effects
//Note -forEach allows returning true to exit early
export const forEachNode = <T extends _Node> (fn: (node:T) => void | boolean) => (node:T):void => {
    if(fn (node) !== true && node.children) {
        node.children.forEach(forEachNode(fn))
    } 
}

export const forEachNodes = <T extends _Node> (fn: (node:T) => void | boolean) => (nodes:Array<T>):void => 
    nodes.forEach(forEachNode(fn));

//Helpers
export const countNodes = <T extends _Node>(nodes:Array<T>):number => {
    let count = 0;

    forEachNodes(() => (count++, null)) (nodes);
    return count;
}

export const findNode = <T extends _Node> (pred: (node:T) => boolean) => (nodesOrNode:T | Array<T>):T => {
    let targetNode:T;

    const fn = (node:T) => {
        if(pred(node)) {
            targetNode = node;
            return true;
        }
    }

    if(Array.isArray(nodesOrNode)) {
        forEachNodes (fn) (nodesOrNode);
    } else {
        forEachNode (fn) (nodesOrNode);
    }

    return targetNode;
}


//Note - the immutability guarantee is the responsibility of the function - after it returns, the children are _replaced_
export const mapNode = <T extends _Node> (fn: (node:T) => T) => (node:T):T => {
    const n = fn (node)

    return !n.children
        ? n 
        : Object.assign(n, {children: n.children.map(mapNode(fn))});

}

export const mapNodeWithParent = <T extends _Node> (fn:(parent:T) => (node:T) => T) => (parent:T) => (node:T):T => {
    const n = fn (parent) (node)

    return !n.children
        ? n 
        : Object.assign(n, {children: n.children.map(mapNodeWithParent (fn) (n))});
}

export const mapNodesWithParent = <T extends _Node> (fn:(parent:T) => (node:T) => T) => (parent:T) => (nodes:Array<T>):Array<T> => 
    nodes.map(mapNodeWithParent (fn) (parent));


export const mapNodes = <T extends _Node> (fn: (node:T) => T) => (nodes:Array<T>):Array<T> => 
    nodes.map(mapNode(fn));

    
//Specific use-cases
export const updateNodeTransforms = <T extends _Node>(opts:NodeTransformUpdateOptions) => (parent:T) => (node:T):T => 
    mapNodeWithParent((_parent:T) => (_node:T) => {
        const pModelMatrix = _parent ? _parent.transform.modelMatrix : undefined;

        const beforeModel = _node.transform.modelMatrix;
        const t = updateTransform(opts) (pModelMatrix) (_node.transform)
        const afterModel = t.modelMatrix;

        const result = Object.assign({}, _node, {transform: t});
      
        //not ideal for typescript, but meh
        if(opts.updateLightDirection && (result as any).kind === NodeKind.LIGHT) {
            const lightKind:LightKind = (result as any).light.kind;
            if(lightKind === LightKind.Directional || lightKind === LightKind.Spot) {
                //only update if the model matrix is different
                if((result as any).light.direction === undefined || !mat4.equals(beforeModel, afterModel)) {
                    (result as any).light.direction = getLightDirectionFromMatrix (t.modelMatrix);
                }             
            }
        }
        return result;
    })
    (parent)
    (node);

export const updateNodeListTransforms = <T extends _Node>(opts:NodeTransformUpdateOptions) => (parent:T) => (nodes:Array<T>):Array<T> => 
    mapNodesWithParent<T>(updateNodeTransforms (opts)) (parent) (nodes);
