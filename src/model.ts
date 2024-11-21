/**
 * What you will find is that the Model class "vanishes" with your React application, and the
 * top-level React GUI object (i.e., the top-level boundary object) will maintain references
 * to the state that it works with.
 */
export class Constant {
    name:string
    value:number

    constructor(name:string, value:number) {
        this.name = name
        this.value = value
    }

    toString() {
        return this.name + "=" + this.value
    }
}