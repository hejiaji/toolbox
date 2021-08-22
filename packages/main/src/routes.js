import React from "react";
import {
    Switch,
    Route,
} from "react-router-dom";

import { WhoGoesFirst } from "@toolbox/who-goes-first"

export const Routes = () => {
    return (
        <Switch>
            <Route path="/who-goes-first" component={WhoGoesFirst} />
        </Switch>
    )
};