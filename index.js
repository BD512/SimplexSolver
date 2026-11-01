import {InitialTableInfoEntry, TableSetup, SimplexSystem} from "./InitialTableThingEntry.js";

class Main {
    constructor(master_container){
        this.container = document.createElement("div");
        master_container.appendChild(this.container);
        this.initial_setup = new InitialTableInfoEntry(this.container, this.enteredSetupInfo.bind(this));
        this.initial_table_thing_entry = null; // new TableSetup(this.container, 1, 1, 1, this.initialTableEntered);
        this.tables = null;
    }
    enteredSetupInfo(decision_vars, slack_vars, artificial_vars, two_stage){
        console.log("here");
        console.log("decision variables", decision_vars);
        console.log("slack vars", slack_vars);
        console.log("artificial vars", artificial_vars);
        this.initial_table_thing_entry = new TableSetup(this.container, decision_vars, slack_vars, artificial_vars, two_stage, this.initialTableEntered.bind(this));
    }
    initialTableEntered(simplex, show_initial_vals=false){
        console.log("here");
        this.tables = new SimplexSystem(this.container, simplex, show_initial_vals);
    }
}

let b = document.getElementById("set_up_container");
let a = new Main(b);
// let c = new TableSetup(b,2, 2, 1);