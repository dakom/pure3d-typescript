import {updateTransform} from "../transform/Transform";
import {NumberArray, TransformUpdateOptions, _Node} from "../../../Types";

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
export const updateNodeTransforms = <T extends _Node>(opts:TransformUpdateOptions) => (parent:T) => (node:T):T => 
    mapNodeWithParent((_parent:T) => (_node:T) => {
        const pModelMatrix = _parent ? _parent.transform.modelMatrix : undefined;

        const t = updateTransform(opts) (pModelMatrix) (_node.transform)
        return Object.assign({}, _node, {transform: t});
    })
    (parent)
    (node);

export const updateNodeListTransforms = <T extends _Node>(opts:TransformUpdateOptions) => (parent:T) => (nodes:Array<T>):Array<T> => 
    mapNodesWithParent<T>(updateNodeTransforms (opts)) (parent) (nodes);
