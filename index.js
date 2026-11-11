import {FullInitialTableSetup, InitialTableInfoEntry, TableSetup} from "./InitialTableThingEntry.js";
import TableThingEntry from "./TableThingEntry.js";
import {FullEquationSystemEntry} from "./EquationSystemEntry.js";
import {DropdownOptions} from "./LabelledEntries.js";

export default class SimplexSystem {
    constructor(master_container, simplex, show_initial_vals=false) {
        this.container = document.createElement("div");
        master_container.appendChild(this.container);
        this.label = document.createElement("label");
        this.container.appendChild(this.label);
        this.label.textContent = "Don't enter brackets for any big-M expressions - expand them. Theta values and working aren't marked so put them in whatever format you want (e.g. if there are multiple theta values that need to be found, you could write your working by seperating by commas). If multiple theta values are the same, choose the first one. If you want to make the cells purple for any reason (e.g. mark a pivot), click on them around the entry box. To make not purple, click again."; // todo check this is actually the case
        this.tables_container = document.createElement("div");
        this.lower_container = document.createElement("div");
        this.lower_container.className = "two-col-grid";
        this.container.appendChild(this.tables_container);
        this.container.appendChild(this.lower_container);
        this.simplex = simplex;
        this.showing_answer = false;
        this.tables = [];
        this.current_table = new TableThingEntry(this.tables_container, 1, this.simplex, this.iterationFinished.bind(this));
        this.next_table_button = document.createElement("button");
        // this.next_table_button.type = "button";
        this.next_table_button.addEventListener("click", this.nextButtonPressed.bind(this));
        this.next_table_button.textContent = "Check";
        this.lower_container.appendChild(this.next_table_button);
        this.show_ans_button = document.createElement("button");
        this.show_ans_button.id = "show_ans_button";
        this.show_ans_button.textContent = "Show answer";
        this.show_ans_button.addEventListener("click", () => {this.answerButtonPressed()});
        this.lower_container.appendChild(this.show_ans_button);
        this.feedback_label = document.createElement("label");
        this.feedback_label.className = "feedback-label";
        this.container.appendChild(this.feedback_label);
        this.finished_label = document.createElement("label");
        this.container.appendChild(this.finished_label);
        if (show_initial_vals) {
            this.current_table.showInitialValues();
            this.nextTable()
        }
    }
    answerButtonPressed() {
        if (this.showing_answer) {
            this.current_table.hideAnswer();
            this.show_ans_button.textContent = "Show answer";
            this.showing_answer = true;
            this.next_table_button.textContent = "Check";
        } else {
            this.current_table.showAnswer();
            this.show_ans_button.textContent = "Hide answer";
            this.showing_answer = false;
            this.next_table_button.textContent = "Skip table";
        }
        this.showing_answer = !this.showing_answer;
    }
    iterationFinished(){
        console.log("finished an iteration!");
        this.nextTable();
        // this.next_table_button.textContent = "Next table";
    }
    nextButtonPressed(){
        if (this.showing_answer){
            this.nextTable();
        } else {
            this.checkAnswers();
        }
    }
    checkAnswers(){
        let is_correct = this.current_table.isFinished();
        if (!is_correct){
            console.log("here512............................")
            this.feedback_label.textContent = "Some entries are incorrect or empty";
        } else{
            this.nextTable();
        }
    }
    resetForIteration(){
        this.show_ans_button.textContent = "Show answer";
        this.showing_answer = false;
        this.feedback_label.textContent = "";
        this.next_table_button.textContent = "Check";
    }
    nextTable(){
        // this.current_table.showAnswer();
        console.log("Moving on to the next table........");
        this.resetForIteration();
        this.tables.push(this.current_table);
        let is_finished = this.simplex.performIteration();
        if (is_finished && this.simplex.isStage1() && this.simplex.isZeroed()){
            console.log("Here!!!!!!!!!!!!! Trying to move to stage 2");
            this.simplex = this.simplex.getStage2();
            let show_theta = this.simplex.isFinal();
            this.current_table = new TableThingEntry(this.tables_container, 1, this.simplex, this.iterationFinished.bind(this), show_theta);
        } else if (is_finished) {
            this.showFinished();
        } else {
            let show_theta = this.simplex.isFinal();
            this.current_table = new TableThingEntry(this.tables_container, 1, this.simplex, this.iterationFinished.bind(this), show_theta);
        }
    }
    showFinished(){
        this.next_table_button.style.display = "none";
        this.show_ans_button.style.display = "none";
        this.feedback_label.style.display = "none";
        this.finished_label.textContent = "Finished!!! Don't forget to state final values of the variables.";
    }
}
class SystemEntry{
    constructor(master_container, feedback_function){
        this.container = document.createElement("div");
        this.container.className = "initial-info";
        master_container.appendChild(this.container);
        this.entry_type_dropdown = new DropdownOptions(this.container, [["Setup using initial table thing", "initial_table"], ["Setup using equations system", "equation_system"]], this.changeEntryOption.bind(this));
        this.equations_entry = new FullEquationSystemEntry(this.container, feedback_function);
        this.table_entry = new FullInitialTableSetup(this.container, feedback_function);
        this.equations_entry.hide();
    }
    changeEntryOption(){
        if (this.entry_type_dropdown.getSelection() === "initial_table"){
            this.equations_entry.hide();
            this.table_entry.show();
        } else{
            this.equations_entry.show();
            this.table_entry.hide();
        }
    }
    hideDropdown(){
        this.entry_type_dropdown.hide();
    }
}

class Main {
    constructor(master_container){
        this.container = document.createElement("div");
        master_container.appendChild(this.container);
        this.initial_table_thing_entry = new SystemEntry(this.container, this.initialTableEntered.bind(this));
        // this.initial_setup = new InitialTableInfoEntry(this.container, this.enteredSetupInfo.bind(this));
        // this.initial_table_thing_entry = null; // new TableSetup(this.container, 1, 1, 1, this.initialTableEntered);
        this.tables = null;
    }
    // enteredSetupInfo(decision_vars, slack_vars, artificial_vars, two_stage){
        // console.log("here");
        // console.log("decision variables", decision_vars);
        // console.log("slack vars", slack_vars);
        // console.log("artificial vars", artificial_vars);
        // this.initial_table_thing_entry = new TableSetup(this.container, decision_vars, slack_vars, artificial_vars, two_stage, this.initialTableEntered.bind(this));
    // }
    initialTableEntered(simplex, show_initial_vals=false){
        console.log("here");
        this.initial_table_thing_entry.hideDropdown();
        this.tables = new SimplexSystem(this.container, simplex, show_initial_vals);
        // if (show_initial_vals){
            // this.tables.nextTable();
        // }
    }
}

let b = document.getElementById("set_up_container");
let a = new Main(b);
// let c = new TableSetup(b,2, 2, 1);