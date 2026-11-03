class LabelledNumberInput{
    constructor(master_container, text){
        this.container = document.createElement("div")
        this.container.className = "labelled-input";
        master_container.appendChild(this.container);
        this.label = document.createElement("label");
        this.label.textContent = text;
        this.entry = document.createElement("input");
        this.entry.type = "number";
        this.container.appendChild(this.label);
        this.container.appendChild(this.entry);
    }
    getEntry(){
        return this.entry.value; // todo check this
    }
    hide(){
        this.container.style.visibility = "hidden";
    }
    show(){
        this.container.style.visibility = "visible";
    }
    setEventFunction(func) {
        this.entry.addEventListener("input", () => {
            func();
        });
    }
}

class LabelledCheckBox{
    constructor(master_container, text, event=() => {}){
        this.container = document.createElement("div");
        this.container.className = "labelled-checkbox";
        master_container.appendChild(this.container);
        this.check_box = document.createElement("input");
        this.check_box.type = "checkbox";
        this.check_box.id = "checkbox";
        this.label = document.createElement("label");
        this.label.textContent = text;
        this.label.for = "checkbox";
        this.container.appendChild(this.label);
        this.container.appendChild(this.check_box);
    }
    getEntry(){
        return this.check_box.checked;
    }
    setEventFunction(func){
        this.check_box.addEventListener("change", ()=>{func();});
    }
    hide(){
        this.container.style.visibility = "hidden";
    }
    show(){
        console.log("trying to show");
        this.container.style.visibility = "visible";
    }
}

class LabelledTextInput{
    constructor(master_container, text){
        this.container = document.createElement("div")
        this.container.className = "labelled-input";
        master_container.appendChild(this.container);
        this.label = document.createElement("label");
        this.label.textContent = text;
        this.entry = document.createElement("input");
        // this.entry.type = "number";
        this.container.appendChild(this.label);
        this.container.appendChild(this.entry);
    }
    getEntry(){
        return this.entry.value; // todo check this
    }
    hide(){
        this.container.style.visibility = "hidden";
    }
    show(){
        this.container.style.visibility = "visible";
    }
    setEventFunction(func) {
        this.entry.addEventListener("input", () => {
            func();
        });
    }
}


export {LabelledNumberInput, LabelledCheckBox, LabelledTextInput};