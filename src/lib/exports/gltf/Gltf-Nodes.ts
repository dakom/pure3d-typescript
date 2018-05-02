import {updateTransform} from "../common/transform/Transform";
import {TransformUpdateOptions, GltfNode} from "../../Types";

export const updateNodeTransforms = (opts:TransformUpdateOptions) => (parentModelMatrix:Float32Array) => (node:GltfNode):GltfNode => {
   const _update = (_parentModelMatrix:Float32Array) => (_node:GltfNode):GltfNode => {

        const t = updateTransform(opts) (_parentModelMatrix) (_node.transform)

        return !_node.children
            ? Object.assign({}, _node, {transform: t}) 
            : Object.assign({}, _node, {transform: t, children: _node.children.map(n => _update (t.modelMatrix) (n))});
    }
    return _update (parentModelMatrix) (node)
}

export const updateNodeListTransforms = (opts:TransformUpdateOptions) => (parentModelMatrix:Float32Array) => (nodes:Array<GltfNode>):Array<GltfNode> =>
    nodes.map(updateNodeTransforms (opts) (parentModelMatrix));
