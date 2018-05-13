import * as React from "react";
import {TopMenu, GltfMenu } from "./Menu";
import {Container} from "./Container";
import {SCENE_MENUS} from "../scenes/basic/Basic-Scenes";
import {MODEL_MENUS} from "../scenes/gltf/Gltf-Models";


const gltfAlertMessage =
`Different formats, where available, are set via adding or removing "_BINARY" and "_EMBEDDED" in the hash url.\n\n`
    + `For example, the following are all different formats of the same GLTF:\n\n`
    + `#DAMAGED_HELMET\n#DAMAGED_HELMET_EMBEDDED\n#DAMAGED_HELMET_BINARY\n\n`
    + `Also, some models are intended to be moved around, others are not.\n\n`
    + `So if the camera "pops" or feels off, know that it's in the domain of the *demo* code for not handling this case.\n`
    + `It is not a bug in the renderer itself :D`;


const buttons = {
    basic: SCENE_MENUS,
    gltf: MODEL_MENUS
}

const alertMessage = {
    basic: "These tests are for basic webgl functionality",
    gltf: gltfAlertMessage
}


export class Demo extends React.Component<{match: any}, {menuOptions: any}> {

    constructor(props) {
        super(props);

        this.state = {
            menuOptions: {
                ibl: true,
                lights: true
            }
        }
    }
    render() {
        const {section, scene} = this.props.match.params;

        return (
            <React.Fragment>
            <Container section={section} scene={scene} menuOptions={this.state.menuOptions} /> 
            <TopMenu menuOptions={this.state.menuOptions} onOptions={menuOptions => this.setState({menuOptions})} basePage={section} buttons={buttons[section]} alertMessage={alertMessage[section]} /> 
            </React.Fragment>
        )
    }
}
