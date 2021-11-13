import {store} from "./index";
import '../helpers/numjs.min';

export default class formClass {
    constructor(formId, src) {
        this.id = formId
        this.src = src
        this.edges = null
        this.drawEdges()
    }

    get area() {
        return this.calcArea();
    }
    // Method
    calcArea() {
        return this.height * this.width;
    }

    async createCtx() {
        var image = new Image()
        image.src = this.src
        await image.decode();

        var canvas = await document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        canvas.width = image.width;
        canvas.height = image.height;
        await ctx.drawImage(image, 0, 0);
        var img = await canvas.toDataURL()
        store.commit('updateFormProp', [this.id, 'src', img])
    }

    async drawEdges() {
        var image = new Image()
        image.src = this.src
        await image.decode();

        var W = store.state.canvasWidth
        var H = store.state.canvasHeight

        var img = await nj.images.read(image)
        var gray = await nj.images.rgb2gray(img)
        var scharr = await nj.images.scharr(gray)

        // display images in canvas
        var edges = await document.createElement('canvas');
        edges.width = image.width;
        edges.height = image.height;
        await nj.images.save(scharr, edges);
        var edge_src = await edges.toDataURL()
        console.log(scharr)
        store.commit('updateFormProp', [this.id, 'src', edge_src])
    }
}