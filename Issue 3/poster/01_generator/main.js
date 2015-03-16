
var resolution = 255; // histogram resolution


var xPicStart = 1400;
var yPicStart = 0;
var picTileSize = 300; // the cutout of the image (source)
var finalTileSize = 200; // the tile for the calculation of the points




var circleR = 4;
var circleBigger = 3;
var circleCount = 25;

var circleSpace = 50; // 4+(3*25) + 10; // 10 for safety




var totalDraws = 100;



// Generate random value between two numbers
function randomIntFromInterval(min, max) {
    return Math.floor(randomFromInterval(min, max));
}


// Generate random value between two numbers
function randomFromInterval(min, max) {
    return Math.random() * (max - min + 1) + min;
}


function getHistogramm(newIMG) {

    // init Histogram
    var grayHistogramm = [];

    for (var i = 0; i < resolution; i++) {
        grayHistogramm.push(0);
    }

    for (var x = 0; x < newIMG.size.width; x++) {
        for (var y = 0; y < newIMG.size.height; y++) {
            var color = newIMG.getPixel(x, y);
            grayHistogramm[Math.floor(color.red * resolution)] ++; // i just look at the red pixel...
        }
    }

    return grayHistogramm;
}

function lineDistance(point1, point2) {
    var xs = 0;
    var ys = 0;

    xs = point2.x - point1.x;
    xs = xs * xs;

    ys = point2.y - point1.y;
    ys = ys * ys;

    return Math.sqrt(xs + ys);
}



// based on the histogram and the count of the total black pixel it gets back the clip step
function getClipStep(grayHistogramm, pixelsBlack) {

    var clipGrayHistogramm = 0; // all 

    for (var i = 0; i < resolution; i++) {

        if (pixelsBlack > 0) {
            clipGrayHistogramm++;
            pixelsBlack -= grayHistogramm[i];
        }
    }

    return clipGrayHistogramm;
}

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}



function getBinaryContent(path, currentExportFolder) {

    //try {

    var xhr = new XMLHttpRequest();

    if (xhr.overrideMimeType) {
        xhr.overrideMimeType("text/plain; charset=x-user-defined");
    }

    xhr.open('GET', path, false); // `false` makes the request synchronous
    xhr.send(null);


    if (xhr.status === 200 || xhr.status === 0) {
        file = null;
        err = null;
        //try {
        file = xhr.response || xhr.responseText;

        // console.log("file", file );

        currentExportFolder.file("original.jpg", file, {
            binary: true
        });


        //} catch(e) {
        //    console.log("Ajax2 error for " + path + " : " + this.status + " " + this.statusText);
        // err = new Error(e);
        //}

    } else {
        console.log("Ajax3 error for " + path + " : " + this.status + " " + this.statusText);
    }



    //} catch (e) {
    //    console.log(new Error(e), null);
    //}
};




// get points based on an imput image
function getPoints(newIMG) {

    var drawPoints = [];


    var grayHistogramm = getHistogramm(newIMG);

    var blackCoverage = 0.3;

    var clipGrayHistogramm = getClipStep(grayHistogramm, (finalTileSize * finalTileSize) * blackCoverage);


    // color the image for visual controll
    for (var x = 0; x < newIMG.size.width; x++) {
        for (var y = 0; y < newIMG.size.height; y++) {
            var color = newIMG.getPixel(x, y);


            if (Math.floor(color.gray * resolution) > clipGrayHistogramm) {
                newIMG.setPixel(x, y, new paper.Color(color.red, color.green, 1));
            } else {
                newIMG.setPixel(x, y, new paper.Color(color.red, color.green, 0));
            }
        }
    }




    // shouold get between 40-50 dots. by a coverage of 30%
    for (var i = 0; i < 125; i++) {


        var tX = randomIntFromInterval(circleSpace, finalTileSize - circleSpace);
        var tY = randomIntFromInterval(circleSpace, finalTileSize - circleSpace);

        var color = newIMG.getPixel(tX, tY);

        if (color.blue == 0) {
            // console.log("jes");
            newIMG.setPixel(tX, tY, new paper.Color(0, 0, 0));

            drawPoints.push(new paper.Point(tX, tY));
        }
    }

    return drawPoints;

}


// 
function getImgAndPoints() {

    // Create a new Deferred.
    var dfd = new $.Deferred();



    // set the image src
    // http://panodata1.panomax.at/cams/275/2014/04/21/13-30-00_default.jpg

    var yearInt = randomIntFromInterval(2013, 2014);
    var monthInt = randomIntFromInterval(4, 11);
    var dayInt = randomIntFromInterval(1, 28);
    var hourInt = randomIntFromInterval(11, 15);


    var d = new Date(yearInt, monthInt - 1, dayInt, hourInt, 25); // 1 Jan 2011, 02:03:04.567 in local timezone



    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];
    var dayNames = new Array(
        'Sunday',
        'Monday',
        'Tuesday',
        'Wednesday',
        'Thursday',
        'Friday',
        'Saturday'
    );

    var dayName = dayNames[d.getDay()];
    var monthName = monthNames[d.getMonth()];


    //it is pm if hours from 12 onwards
    suffix = (hourInt >= 12) ? 'PM' : 'AM';

    //only -12 from hours if it is greater than 12 (if not back at mid night)
    hoursPrint = (hourInt > 12) ? hourInt - 12 : hourInt;

    //if 00 then it is 12 am
    hoursPrint = (hoursPrint == '00') ? 12 : hoursPrint;

    // Thursday, August 7, 2014 6:25 PM
    var DateStr = dayName + ", " + monthName + " " + dayInt + ", " + yearInt + " " + hoursPrint + ":25 " + suffix


    var srcIMG = "./img.php?url=http://panodata1.panomax.at/cams/275/" + yearInt + "/" + pad(monthInt, 2) + "/" + pad(dayInt, 2) + "/" + hourInt + "-20-00_default.jpg";
    // var srcIMG = "http://panodata1.panomax.at/cams/275/" + yearInt + "/" + pad(monthInt, 2) + "/" + pad(dayInt, 2) + "/" + hourInt + "-20-00_default.jpg";


    //var srcIMG = "./13-30-00_default.jpg";
    // var srcIMG = "./11-20-00_default.jpg";


    $('#webcam').attr('src', '');

    $('#webcam').attr('src', srcIMG);

    // setup paper
    var rasterCanvas = $('#processDraw'); // document.getElementById('processDraw');

    rasterCanvas.css("width", finalTileSize + 'px'); // .style.width = finalTileSize + 'px';
    rasterCanvas.css("height", finalTileSize + 'px'); // .style.height = finalTileSize + 'px';

    //console.log(rasterCanvas);
    paper.setup(rasterCanvas[0]);



    $('#webcam')[0].onload = function () {
        console.info("Image loaded !");

        var cutOut = new paper.Raster( $('#webcam')[0] );

        var newIMG = cutOut.getSubRaster(new paper.Rectangle(xPicStart, yPicStart, picTileSize, picTileSize));
        newIMG.size = new Size(finalTileSize, finalTileSize);

        // console.log("newIMG", newIMG);
        newIMG.position = new Point(finalTileSize / 2, finalTileSize / 2);


        var drawPoints = getPoints(newIMG);

        paper.view.update();

        // When we're done resolve
        dfd.resolve(drawPoints, srcIMG, DateStr);

        cutOut.remove();

    }
    $('#webcam')[0].onerror = function () {
       console.error("Cannot load image");
       //do something else...
       return dfd.reject();
    }

    // Return an immutable promise object.
    return dfd.promise();
}




function overlaps(path, other) {
    return !(path.getIntersections(other).length === 0);
};

function mergeOne(path, others) {
    var i, merged, other, union, _i, _len, _ref;
    for (i = _i = 0, _len = others.length; _i < _len; i = ++_i) {
        other = others[i];
        //if (overlaps(path, other)) {
        union = path.unite(other);
        merged = mergeOne(union, others.slice(i + 1));
        path.remove();
        other.remove();
        return (_ref = others.slice(0, i)).concat.apply(_ref, merged);
        //}
    }
    return others.concat(path);
};

function merge(paths) {
    var path, result, _i, _len;
    result = [];
    for (_i = 0, _len = paths.length; _i < _len; _i++) {
        path = paths[_i];
        result = mergeOne(path, result);
    }
    return result;
};

function generateLines(drawPoints) {

    var openPathError = false;

    var scaleFactor = (finalTileSize - circleSpace) - circleSpace;
    scaleFactor = 3;

    var pointJson = [];

    // sale the points to the size of the new stage
    for (var i = 0; i < drawPoints.length; i++) {
        drawPoints[i].x *= scaleFactor;
        drawPoints[i].y *= scaleFactor;

        drawPoints[i].x += randomFromInterval(0 - scaleFactor / 2, scaleFactor / 2);
        drawPoints[i].y += randomFromInterval(0 - scaleFactor / 2, scaleFactor / 2);

        pointJson.push({
            x: drawPoints[i].x,
            y: drawPoints[i].y
        });
    }

    var pointExport = JSON.stringify(pointJson);

    var drawTileSize = 800

    var drawCanvas = document.getElementById('draw');

    drawCanvas.style.width = drawTileSize + 'px';
    drawCanvas.style.height = drawTileSize + 'px';

    paper.setup(drawCanvas);

    var circlePaths = null;

    var finalPaths = [];

    for (var countR = 0; countR < circleCount; countR++) {

        var newLayer = new paper.Layer();
        newLayer.name = "layer_" + countR;
        newLayer.activate(); // so that redCircle will be added to newLayer

        circlePaths = null;

        var currentCircle = [];

        for (var i = 0; i < drawPoints.length; i++) {


            var tPoint = new paper.Path.Circle(drawPoints[i], (circleR + countR * circleBigger));

            tPoint.set({
                // fillColor: "red",
                strokeColor: '#9aacc1',
                strokeWidth: 0.55,
                opacity: 1
            });

            currentCircle.push(tPoint);
            //
            //                if (i == 0) {
            //
            //                    circlePaths = tPoint.clone();
            //                } else {
            //                    circlePaths = circlePaths.unite(tPoint);
            //                }
            //
            //                tPoint.remove();
            //                tPoint = null;
        }

        var finalPath = merge(currentCircle);

        // console.log("finals", finalPath.length )

        for (var i = 0; i < finalPath.length; i++) {
            var myPath = finalPath[i];
            // console.log("myPath: ", myPath.className);

            if (myPath.className == 'CompoundPath') {

                // console.log("sublength : ", myPath.children.length);

                for (var i2 = 0; i2 < myPath.children.length; i2++) {
                    var mySubPath = myPath.children[i2];
                    if (mySubPath.closed === false) {
                        console.log("big error!", countR)
                        openPathError = true;
                    }
                }


            }
            /*
            myPath.set({
                // fillColor: "red",
                strokeColor: 'black',
                strokeWidth: 0.35,
                opacity: 1
            });
            */
        }
        // for (var i = currentCircle.length-1; i > 0; i--) {
        //     currentCircle[i].remove();
        // }


        // console.log("finalPath", finalPath);

        //    finalPath.set({
        //        // fillColor: "red",
        //        strokeColor: 'black',
        //        strokeWidth: 0.35,
        //        opacity: 1
        //    });

        //finalPaths.push(circlePaths);
    }


    paper.view.update();

    if (openPathError) {
        return false;
    } else {
        return pointExport;
    }

}

    var zip = new JSZip();

function runRaster() {

    console.log("start runRaster remaining: " + totalDraws + " graphics");


    // var root = zip.folder("root");



    // status set
    $('#msg').text("running. please wait. remaining: " + totalDraws + " graphics");
    $('#save').hide();




    var promise = getImgAndPoints();

    promise.done(function(drawPoints, imgURL, DateStr) {

        console.log("promise resolve runRaster ");

        // only run if there are more then 15 found points
        var pointSet = generateLines(drawPoints);

        if (drawPoints.length > 15 && pointSet) {

            totalDraws--;
            console.log(" drawings remaining: ", totalDraws + 1);

            var currentExportFolder = zip.folder("" + totalDraws);

            currentExportFolder.file("info.txt", "URL: " + imgURL + '\nDATE: ' + DateStr);


            getBinaryContent(imgURL, currentExportFolder);




            savable = document.getElementById('processDraw').toDataURL("image/png"); // and we saw this in the previous tuturila


            currentExportFolder.file("process.png", savable.substr(savable.indexOf(',') + 1), {
                base64: true
            });



            currentExportFolder.file("pointset.json", pointSet);


            currentExportFolder.file("export.svg", "<svg>" + $(paper.project.exportSVG()).html() + "</svg>");


        } else {
            console.log("no success runRaster ");
        }

        console.log("totalDraws ", totalDraws);
        if (totalDraws > 0) {
            runRaster();
        } else {


            var content = zip.generate({
                type: "blob"
            });
            // see FileSaver.js
            saveAs(content, "m0ire3.zip");


            $('#msg').text("yay! finish!");
            $('#save').show();
        }



    });

    promise.fail(function() {
        runRaster();
    });

    paper.view.update();


}


paper.install(window);




$(document).ready(function() {
    var button_id = "download"


    function saveSVG() {
        //console.log(paper.project.exportSVG());

        $("#svg *").remove();
        $("#svg").append(paper.project.exportSVG());

        // Add some critical information
        $("svg").attr({
            version: '1.1',
            xmlns: "http://www.w3.org/2000/svg"
        });

        var svg = $("#svg").html();

        var blob = new Blob([svg], {
            type: "data:image/svg+xml;charset=utf-8"
        });
        saveAs(blob, "poster.svg");
    }

    console.log("run start");

    $("#run").on("click", runRaster);

});