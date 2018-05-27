import {updateTransform} from "../transform/Transform";
import {NumberArray, TransformUpdateOptions, _Node} from "../../../Types";


export const mapNodeWithParent = <T extends _Node> (fn:(parent:T) => (node:T) => T) => (parent:T) => (node:T):T => {
   const _update = (_parent:T) => (_node:T):T => {

        const n = fn (_parent) (_node)

        return !_node.children
            ? n 
            : Object.assign(n, {children: _node.children.map(_update (n))});
    }

    return _update(parent) (node);
}

export const mapNodesWithParent = <T extends _Node> (fn:(parent:T) => (node:T) => T) => (parent:T) => (nodes:Array<T>):Array<T> => 
    nodes.map(mapNodeWithParent (fn) (parent));

export const mapNode = <T extends _Node> (fn: (node:T) => T) => (node:T):T => {
   const _update = (_node:T):T => {

        const n = fn (_node)

        return !_node.children
            ? n 
            : Object.assign(n, {children: _node.children.map(_update)});
    }

    return _update (node);
}

export const mapNodes = <T extends _Node> (fn: (node:T) => T) => (nodes:Array<T>):Array<T> => 
    nodes.map(mapNode(fn));

export const updateNodeTransforms = <T extends _Node>(opts:TransformUpdateOptions) => (parent:T) => (node:T):T => 
    mapNodeWithParent((_parent:T) => (_node:T) => {
        const pModelMatrix = _parent ? _parent.transform.modelMatrix : undefined;

        const t = updateTransform(opts) (pModelMatrix) (_node.transform)
        return Object.assign({}, _node, {transform: t});
    })
    (parent)
    (node);

//export const updateNodeListTransforms = <T extends _Node>(opts:TransformUpdateOptions) => (parent:T) => (nodes:Array<T>):Array<T> => 
    //nodes.map(updateNodeTransforms <T>(opts) (parent));
export const updateNodeListTransforms = <T extends _Node>(opts:TransformUpdateOptions) => (parent:T) => (nodes:Array<T>):Array<T> => 
    mapNodesWithParent((_parent:T) => (_node:T) => {
        const pModelMatrix = _parent ? _parent.transform.modelMatrix : undefined;

        const t = updateTransform(opts) (pModelMatrix) (_node.transform)
        return Object.assign({}, _node, {transform: t});
    })
    (parent)
    (nodes);
/*
export const updateNodeTransforms = <T extends _Node> (opts:TransformUpdateOptions) => (parentModelMatrix:NumberArray) => (node:T):T => {
   const _update = <T extends _Node>(_parentModelMatrix:NumberArray) => (_node:T):T => {

        const t = updateTransform(opts) (_parentModelMatrix) (_node.transform)

        return !_node.children
            ? Object.assign({}, _node, {transform: t}) 
            : Object.assign({}, _node, {transform: t, children: _node.children.map(n => _update (t.modelMatrix) (n))});
    }
    return _update <T>(parentModelMatrix) (node)
}


export const updateNodeListTransforms = <T extends _Node>(opts:TransformUpdateOptions) => (parentModelMatrix:NumberArray) => (nodes:Array<T>):Array<T> =>
    nodes.map(updateNodeTransforms <T>(opts) (parentModelMatrix));
    */
