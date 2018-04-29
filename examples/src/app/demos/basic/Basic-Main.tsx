import * as React from "react";
import {MenuWidget} from "utils/components/Menu";
import {SCENE_MENUS} from "./scenes/Scenes";
import {SceneWidget} from "./scenes/Basic-Scenes-Widget";

export const Basic = props => (
    <React.Fragment>
        <MenuWidget 
            basePage="basic"
            buttons={SCENE_MENUS}
        />     
        <SceneWidget sceneName={props.match.params.scene} /> 
    </React.Fragment>
);

