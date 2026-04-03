import React from "react";
import {
    Switch,
    Route,
} from "react-router-dom";

import { WhoGoesFirst } from "@toolbox/who-goes-first"
import { AnnualReport } from "@toolbox/annual-report"
import { ShardingHelper } from "@toolbox/sharding-helper";
import { Downloader } from "@toolbox/downloader";
import { SyncInput } from "@toolbox/sync-input";
import { VideoLibrary } from "@toolbox/video";
import { DataEntry, Analytics } from "@toolbox/game-analysis";

export const Routes = () => {
    return (
        <Switch>
            <Route path="/who-goes-first" exact component={WhoGoesFirst} />
            <Route path="/annual-report" exact component={AnnualReport}  />
            <Route path="/sharding" exact component={ShardingHelper}  />
            <Route path="/downloader" exact component={Downloader}  />
            <Route path="/sync-input" exact component={SyncInput}  />
            <Route path="/video" component={VideoLibrary}  />
            <Route path="/game-analysis/entry" exact component={DataEntry}  />
            <Route path="/game-analysis/analytics" exact component={Analytics}  />
        </Switch>
    )
};
