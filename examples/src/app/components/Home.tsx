
import * as React from "react";
import * as ReactDOM from "react-dom";
import {HashRouter as Router,withRouter, Switch, Route, Link } from "react-router-dom";
import Button from "material-ui/Button";
import { withStyles } from 'material-ui/styles';
import Grid from 'material-ui/Grid';
import Typography from 'material-ui/Typography';

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  paper: {
    padding: theme.spacing.unit * 2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
    button: {

    }
}) as any;

export const Home = withRouter(withStyles(styles) (({classes, history}:{history: any, classes:any}) => (
    <div>
    <Typography align="center" variant="display3" gutterBottom>
        Pure3D Examples
    </Typography>
    <Grid container className={classes.root} >
            <Grid item xs={12}>
                <Grid container justify="center" spacing={16}> 
                    <Grid item> 
                        <Button size="large" variant="raised" color="primary" onClick={() => history.push("/complex")}>Complex</Button>
                    </Grid>
                    <Grid item> 
                        <Button size="large" variant="raised" color="primary" onClick={() => history.push("/gltf")}>GLTF</Button>
                    </Grid>
                    <Grid item>
                        <Button size="large" variant="raised" color="primary" onClick={() => history.push("/basic")}>Basic</Button>
                    </Grid>
                </Grid>
            </Grid>
    </Grid>
    </div>
)))
