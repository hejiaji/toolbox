import React from "react";
import { Switch, Route, useRouteMatch } from "react-router-dom";
import LibraryHome from "./LibraryHome";
import VideoDetail from "./VideoDetail";

const VideoLibrary = () => {
  const { path } = useRouteMatch();

  return (
    <Switch>
      <Route path={`${path}/:id`} component={VideoDetail} />
      <Route exact path={path} component={LibraryHome} />
    </Switch>
  );
};

export { VideoLibrary };
