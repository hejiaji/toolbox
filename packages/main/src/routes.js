import React from "react";
import {
    Switch,
    Route,
} from "react-router-dom";

import { WhoGoesFirst } from "@toolbox/who-goes-first"
import { AnnualReport } from "@toolbox/annual-report"

export const Routes = () => {
    return (
        <Switch>
            <Route path="/who-goes-first" exact component={WhoGoesFirst} />
            <Route path="/annual-report" exact component={AnnualReport}  />
        </Switch>
    )
};