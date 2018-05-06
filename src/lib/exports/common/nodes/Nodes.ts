import {updateTransform} from "../transform/Transform";
import {NumberArray, TransformUpdateOptions, _Node} from "../../../Types";

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
