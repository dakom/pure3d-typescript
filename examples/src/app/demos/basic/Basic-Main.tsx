import * as React from "react";
import {MenuWidget} from "utils/components/Menu";
import {SCENE_MENUS} from "./scenes/Scenes";
import {SceneWidget} from "./scenes/Basic-Scenes-Widget";

export const Basic = props => (
    <React.Fragment>
        <SceneWidget sceneName={props.match.params.scene} /> 

        <MenuWidget 
            basePage="basic"
            buttons={SCENE_MENUS}
        />     
    </React.Fragment>
);

