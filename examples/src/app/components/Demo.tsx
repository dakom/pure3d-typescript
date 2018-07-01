import * as React from "react";
import {TopMenu, GltfMenu } from "./Menu";
import {Container} from "./Container";
import {BASIC_MENUS} from "../scenes/basic/Basic-Scenes";
import {MODEL_MENUS} from "../scenes/gltf/Gltf-Models";
import {COMBINED_MENUS} from "../scenes/combined/Combined-Scenes";

const gltfAlertMessage =
`
If cameras are available in the gltf, they'll be added to the menu _after_ the file finishes loading.\n\n
In some cases the default moveable camera isn't within the view of the model... actually that's only monster afaik\n\n
Different formats, where available, are set via adding or removing "_BINARY" and "_EMBEDDED" in the hash url.\n\n`
    + `For example, the following are all different formats of the same GLTF:\n\n`
    + `#DAMAGED_HELMET\n#DAMAGED_HELMET_EMBEDDED\n#DAMAGED_HELMET_BINARY\n\n`;


const buttons = {
    basic: BASIC_MENUS,
    gltf: MODEL_MENUS,
    combined: COMBINED_MENUS,
}

const alertMessage = {
    basic: "These tests are for basic webgl functionality",
    gltf: gltfAlertMessage,
    combined: "These are integration tests for combining everything together"
}



export class Demo extends React.Component<{match: any }, {menuOptions: any}> {

    constructor(props) {
        super(props);

        this.state = {
            menuOptions: {
                gltf: {
                    //ibl: true,
                    //ibl: true,
                    lights: true,
                    //lights: false,
                    cameras: [],
                    selectedCamera: -1

                }
            }
        }

    }

    render() {
        const {section, scene} = this.props.match.params;

        const {menuOptions} = this.state;

        return (
            <React.Fragment>
            <Container section={section} scene={scene} menuOptions={menuOptions} /> 
            <TopMenu 
                menuOptions={menuOptions} 
                basePage={section} 
                buttons={buttons[section]} 
                alertMessage={alertMessage[section]}
                onOptions={menuOptions => this.setState({menuOptions})}
            /> 
            </React.Fragment>
        )
    }
}
