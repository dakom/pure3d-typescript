import * as React from "react";

import {MenuWidget} from "utils/components/Menu";
import {GltfWidget} from "./components/GltfWidget";
import {AppContext} from "../../App-Main";
import {getModel, ModelInfo} from "./models/Models";
import {MODEL_MENUS} from "./models/Models";

const alertMessage =
`Different formats, where available, are set via adding or removing "_BINARY" and "_EMBEDDED" in the hash url.\n\n`
+ `For example, the following are all different formats of the same GLTF:\n\n`
+ `#DAMAGED_HELMET\n#DAMAGED_HELMET_EMBEDDED\n#DAMAGED_HELMET_BINARY\n\n`
+ `Also, some models are intended to be moved around, others are not.\n\n`
+ `So if the camera "pops" or feels off, know that it's in the domain of the *demo* code for not handling this case.\n`
+ `It is not a bug in the renderer itself :D`;

export const Gltf = props => (
    <AppContext.Consumer>
    {({isProduction}) => {
        const model = props.match.params.model;
        const modelInfo = getModel(model);

        return (
            <React.Fragment>
                <GltfWidget modelInfo={modelInfo} modelName={model} />
                <MenuWidget 
                    basePage="gltf"
                    buttons={MODEL_MENUS}
                    alertMessage={alertMessage}
                />
            </React.Fragment>
        )
    }}
    </AppContext.Consumer>
);

