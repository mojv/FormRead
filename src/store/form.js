export default class formClass {
    constructor(formId, src) {
        this.id = formId
        this.src = src
    }
    // Getter
    get area() {
        return this.calcArea();
    }
    // Method
    calcArea() {
        return this.height * this.width;
    }
}