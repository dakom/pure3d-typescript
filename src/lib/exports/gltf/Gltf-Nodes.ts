import {updateTransform} from "../common/Transform";
import {TransformUpdateOptions, GltfNode} from "../../Types";

export const updateNodeTransforms = (opts:TransformUpdateOptions) => (parentModelMatrix:Array<number>) => (node:GltfNode):GltfNode => {
   const _update = (_parentModelMatrix:Array<number>) => (_node:GltfNode):GltfNode => {

        const t = updateTransform(opts) (_parentModelMatrix) (_node.transform)

        return !_node.children
            ? Object.assign({}, _node, {transform: t}) 
            : Object.assign({}, _node, {transform: t, children: _node.children.map(n => _update (t.modelMatrix) (n))});
    }
    return _update (parentModelMatrix) (node)
}

export const updateNodeListTransforms = (opts:TransformUpdateOptions) => (parentModelMatrix:Array<number>) => (nodes:Array<GltfNode>):Array<GltfNode> =>
    nodes.map(updateNodeTransforms (opts) (parentModelMatrix));
