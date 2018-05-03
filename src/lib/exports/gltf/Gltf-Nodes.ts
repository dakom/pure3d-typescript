import {updateTransform} from "../common/transform/Transform";
import {NumberArray, TransformUpdateOptions, GltfNode} from "../../Types";

export const updateNodeTransforms = (opts:TransformUpdateOptions) => (parentModelMatrix:NumberArray) => (node:GltfNode):GltfNode => {
   const _update = (_parentModelMatrix:NumberArray) => (_node:GltfNode):GltfNode => {

        const t = updateTransform(opts) (_parentModelMatrix) (_node.transform)

        return !_node.children
            ? Object.assign({}, _node, {transform: t}) 
            : Object.assign({}, _node, {transform: t, children: _node.children.map(n => _update (t.modelMatrix) (n))});
    }
    return _update (parentModelMatrix) (node)
}

export const updateNodeListTransforms = (opts:TransformUpdateOptions) => (parentModelMatrix:NumberArray) => (nodes:Array<GltfNode>):Array<GltfNode> =>
    nodes.map(updateNodeTransforms (opts) (parentModelMatrix));
