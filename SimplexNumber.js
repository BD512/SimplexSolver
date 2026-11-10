// import Fraction from 'https://unpkg.com';
import {fraction, add, subtract, multiply, divide, equal, compare} from "mathjs";
import splitStringToNumAndMCoef from "./SplitString.js";


class InvalidStringEntered extends Error {
    constructor () {
        super("Invalid string entered");
    }
}

export default class SimplexNumber {
    constructor (number, m_coef=0){
        if (number !== Infinity && number !== -Infinity){
            this.number_term = fraction(number);
        } else {
            this.number_term = number;
        }
        if (m_coef !== Infinity && m_coef !== -Infinity){
            this.m_coef = fraction(m_coef);
        } else {
            this.m_coef = m_coef;
        }
    }
    getString() { // todo test
        if (this.m_coef == 0 && this.number_term == 0) {
            return "0";
        } else if (this.number_term === Infinity || this.m_coef == Infinity){
            return "Infinity";
        } else if (this.m_coef == 0) {
            return this.number_term.toFraction(); // todo check this will return a normal number if it isn't fractional
        } else if (this.number_term == 0){
            return this.m_coef.toFraction() + "M";
        } else if (compare(this.m_coef, fraction(0)) < 0){
            return this.number_term.toFraction()+this.m_coef.toFraction() + "M";
        } else {
            return this.number_term.toFraction() + "+" + this.m_coef.toFraction() + "M";
        }
    }
    getValue() {
        if (this.m_coef == 0) {
            return this.number_term;
        } else {
            return this.number_term + this.m_coef * Infinity;
        }
    }
    getMCoef() {
        return this.m_coef;
    }
    getNumberTerm() {
        return this.number_term;
    }
    add(other) {
        return new SimplexNumber(add(this.getNumberTerm(), other.getNumberTerm()), add(this.getMCoef(), other.getMCoef()));
    }
    subtract(other) {
        return new SimplexNumber(subtract(this.getNumberTerm(), other.getNumberTerm()), subtract(this.getMCoef(), other.getMCoef()));
    }
    multiply(other) {
        if (this.getMCoef() != 0 && other.getMCoef() != 0) {
            console.log(this.getMCoef().toString());
            console.log(other.getMCoef().toString());
            throw new Error("Cannot multiply two expressions with M in")
        } else if (this.getMCoef() == 0){
            return new SimplexNumber(multiply(this.getNumberTerm(), other.getNumberTerm()), multiply(this.getNumberTerm(), other.getMCoef()));
        } else {
            return new SimplexNumber(multiply(other.getNumberTerm(), this.getNumberTerm()), multiply(other.getNumberTerm(), this.getMCoef()));
        }
    }
    divide(other) {
        if (other.m_coef != 0) {
            throw new Error("Cannot divide by an expression containing M");
        }
        if (other.number_term == 0) {
            return new SimplexNumber(Infinity);
        }
        return new SimplexNumber(
            divide(this.number_term, other.number_term),
            divide(this.m_coef, other.number_term)
        );
    }

    compareToString(string){
        if (string === "INFINITY" && this.getNumberTerm() === Infinity){
            return true;
        }
        let [did_work, number, m_coef] = splitStringToNumAndMCoef(string);
        console.log("number", number);
        console.log("number term", this.getNumberTerm());
        console.log("number terms equal", number == this.getNumberTerm())
        console.log("m coefficient", m_coef);
        console.log("this m coefficient", this.getMCoef());
        console.log(m_coef == this.getMCoef());
        if (did_work){
            return (equal(number, this.getNumberTerm()) && equal(m_coef, this.getMCoef()));
        } else{
            return false;
        }

    }
    isLowerThan(other) {
        if (other.number_term === Infinity) return true;
        if (this.number_term === Infinity) return false;
        if (other.number_term === -Infinity) return false;
        if (this.number_term === -Infinity) return true;
        if (equal(this.getMCoef(), other.getMCoef())){
            return (compare(this.getNumberTerm(), other.getNumberTerm()) < 0);
        } else {
            return (compare(this.getMCoef(), other.getMCoef()) < 0);
        }
    }
    isEqualTo(other){
        return (equal(this.getMCoef(), other.getMCoef()) && equal(this.getNumberTerm(), other.getNumberTerm())); // todo correct for possible infinity
    }
    isHigherThan(other) {
        if (other.number_term === Infinity) return false;
        if (this.number_term === Infinity) return true;
        if (other.number_term === -Infinity) return true;
        if (this.number_term === -Infinity) return false;
        if (equal(this.getMCoef(), other.getMCoef())){
            return (compare(this.getNumberTerm(), other.getNumberTerm()) > 0);
        } else {
            return (compare(this.getMCoef(), other.getMCoef()) > 0);
        }
    }
} // todo make stuff where infinity appears cleaner



console.log("Here");
const a = new SimplexNumber(10);
const b = new SimplexNumber(10,1);
const c = a.multiply(b);
console.log(c.getString());
