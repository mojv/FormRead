import {store} from "./index";
import {
    imread,
    MatVector,
    Mat,
    cvtColor,
    COLOR_RGBA2GRAY,
    threshold,
    THRESH_BINARY,
    findContours,
    RETR_EXTERNAL,
    CHAIN_APPROX_SIMPLE,
    Scalar,
    drawContours,
    LINE_8,
    contourArea,
    arcLength,
    approxPolyDP,
    Point,
    matFromArray,
    Size,
    getPerspectiveTransform,
    warpPerspective,
    INTER_LINEAR,
    BORDER_CONSTANT,
    imshow,
    CV_32FC2
} from 'opencv.js';

export default class formClass {
    constructor(formId, src, fromCam) {
        this.id = formId
        this.src = src
        if (fromCam) {
            this.edgesTransformation()
        }
    }

    get area() {
        return this.calcArea();
    }

    async edgesTransformation() {
        var image = new Image()
        image.src = this.src
        await image.decode();
        var src = imread(image)

        let [contours, , ] = this.getContours(src, true)

        let dst = this.fourPointsTransform(src, contours)
        this.updateSrc(dst)
    }

    getContours(src, draw) {
        let dst = src.clone();
        let contours = new MatVector();
        let hierarchy = new Mat();
        cvtColor(src, dst, COLOR_RGBA2GRAY, 0);
        threshold(dst, dst, 120, 200, THRESH_BINARY);
        findContours(dst, contours, hierarchy, RETR_EXTERNAL, CHAIN_APPROX_SIMPLE);

        if (draw) {
            for (let i = 0; i < contours.size(); ++i) {
                let color = new Scalar(255, 0, 0, 255);
                drawContours(dst, contours, i, color, 5, LINE_8, hierarchy, 100);
            }
        }
        return [contours, hierarchy, dst]
    }

    fourPointsTransform(src, contours) {
        let foundContour = new MatVector();

        //Get area for all contours so we can find the biggest
        let sortableContours = [];

        for (let i = 0; i < contours.size(); i++) {
            let cnt = contours.get(i);
            let area = contourArea(cnt, false);
            let perim = arcLength(cnt, false);

            sortableContours.push(new SortableContour({areaSize: area, perimiterSize: perim, contour: cnt}));
        }

        //Sort 'em
        sortableContours = sortableContours.sort((item1, item2) => {
            return (item1.areaSize > item2.areaSize) ? -1 : (item1.areaSize < item2.areaSize) ? 1 : 0;
        }).slice(0, 5);

        //Ensure the top area contour has 4 corners (NOTE: This is not a perfect science and likely needs more attention)
        let approx = new Mat();
        approxPolyDP(sortableContours[0].contour, approx, .05 * sortableContours[0].perimiterSize, true);

        if (approx.rows === 4) {
            console.log('Found a 4-corner approx');
            foundContour = approx;
        } else {
            console.log('No 4-corner large contour!');
            return;
        }

        //Find the corners
        //foundCountour has 2 channels (seemingly x/y), has a depth of 4, and a type of 12.  Seems to show it's a CV_32S "type", so the valid data is in data32S??
        let corner1 = new Point(foundContour.data32S[0], foundContour.data32S[1]);
        let corner2 = new Point(foundContour.data32S[2], foundContour.data32S[3]);
        let corner3 = new Point(foundContour.data32S[4], foundContour.data32S[5]);
        let corner4 = new Point(foundContour.data32S[6], foundContour.data32S[7]);

        //Order the corners
        let cornerArray = [{corner: corner1}, {corner: corner2}, {corner: corner3}, {corner: corner4}];
        //Sort by Y position (to get top-down)
        cornerArray.sort((item1, item2) => {
            return (item1.corner.y < item2.corner.y) ? -1 : (item1.corner.y > item2.corner.y) ? 1 : 0;
        }).slice(0, 5);

        //Determine left/right based on x position of top and bottom 2
        let tl = cornerArray[0].corner.x < cornerArray[1].corner.x ? cornerArray[0] : cornerArray[1];
        let tr = cornerArray[0].corner.x > cornerArray[1].corner.x ? cornerArray[0] : cornerArray[1];
        let bl = cornerArray[2].corner.x < cornerArray[3].corner.x ? cornerArray[2] : cornerArray[3];
        let br = cornerArray[2].corner.x > cornerArray[3].corner.x ? cornerArray[2] : cornerArray[3];

        //Calculate the max width/height
        let widthBottom = Math.hypot(br.corner.x - bl.corner.x, br.corner.y - bl.corner.y);
        let widthTop = Math.hypot(tr.corner.x - tl.corner.x, tr.corner.y - tl.corner.y);
        let theWidth = (widthBottom > widthTop) ? widthBottom : widthTop;
        var theHeight

        if (store.state.sheetAspectRatio === null) {
            let heightRight = Math.hypot(tr.corner.x - br.corner.x, tr.corner.y - br.corner.y);
            let heightLeft = Math.hypot(tl.corner.x - bl.corner.x, tr.corner.y - bl.corner.y);
            theHeight = (heightRight > heightLeft) ? heightRight : heightLeft;
            store.commit('setSheetAspectRatio', theWidth / theHeight)
        } else {
            theHeight = theWidth / store.state.sheetAspectRatio;
        }

        //Transform!
        let finalDestCoords = matFromArray(4, 1, CV_32FC2, [0, 0, theWidth - 1, 0, theWidth - 1, theHeight - 1, 0, theHeight - 1]); //
        let srcCoords = matFromArray(4, 1, CV_32FC2, [tl.corner.x, tl.corner.y, tr.corner.x, tr.corner.y, br.corner.x, br.corner.y, bl.corner.x, bl.corner.y]);
        let dsize = new Size(theWidth, theHeight);
        let M = getPerspectiveTransform(srcCoords, finalDestCoords)

        let transformed = new Mat();
        warpPerspective(src, transformed, M, dsize, INTER_LINEAR, BORDER_CONSTANT, new Scalar());
        return transformed;
    }

    findAnchors() {
        alert('hola')
    }

    async updateSrc(dst) {
        // display images in canvas
        var edges = await document.createElement('canvas');
        await imshow(edges, dst);
        var edge_src = await edges.toDataURL()
        store.commit('updateFormProp', [this.id, 'src', edge_src])
    }
}

class SortableContour {
    constructor(fields) {
        Object.assign(this, fields);
    }
}