//Physical constants
var pi2      = Math.PI / 2.0;
var pi4      = Math.PI / 4.0;
var twopi    = 2 * Math.PI;
var threepi2 = 3 * Math.PI / 2.0;
var e        = 23.438446 * (Math.PI / 180);        //obliquity of the ecliptic (Year 2006)
var latitude = 34* (Math.PI / 180);
//Graphics constants
var size = 800;
var hsize = size / 2;
var capricorn_ratio  = 0.90;

//Derived constants
var capricorn_size   = size * capricorn_ratio;
var capricorn_border = (size - capricorn_size) /2;


var r_capricorn = capricorn_size / 2;
var r_equator   = r_capricorn * Math.tan((pi2 - e) / 2);
var r_cancer    = r_equator   * Math.tan((pi2 - e) / 2);


// D3 circle
function circle(elem, cx, cy, r, class_name)
{
    return elem.append("circle")
        .attr("cx", cx)
        .attr("cy", cy)
        .attr("r", r)
        .attr("class", class_name)
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 1)
}

//Draw almucantar circle given degrees
function Almucantar(a)
{
    a_rad = a * (Math.PI / 180)
    tmp = r_equator / (Math.sin(latitude) + Math.sin(a_rad));
    ra = Math.cos(a_rad)     * tmp;
    ya = Math.cos(latitude)  * tmp;
    // svg.circle( size / 2 , CartesianToScreenY(ya), ra);
    circle(g, 0, ya, ra, "almucantar");
}

//Draw whole astrolabe
function draw()
{
    var svg = d3.select("body")
       .append("svg:svg")
        .attr("class", "vis")
        .attr("width", 900)
        .attr("height", 900)
       //Use cartesian coordinates
       .append("g").attr("transform", "translate (" + hsize + "," + hsize + ") scale(1,-1)" )

    //    .attr("width", r_capricorn * 1.2)
    //    .attr("height", r_capricorn * 1.2);

    circle(svg, 0, 0, r_capricorn, "tropic").attr("id","capricorn")
    circle(svg, 0, 0, r_equator, "tropic")
    circle(svg, 0, 0, r_cancer, "tropic")


    // var h = Math.asin(Math.tan(latitude) * Math.tan(e)); //Angle horizon makes to E-W line //TODO: breaks at high lat
    // var yh = Math.sin(h) * r_capricorn;
    // var xh = Math.cos(h) * r_capricorn;
    // circle(svg, 0, yc, rh, "horizon");


    circle(svg.append("clipPath").attr("id", "clip_capricorn"), 0, 0, r_capricorn, "tropic")

    g= svg.append("g").attr("clip-path", "url(#clip_capricorn)")
    //Draw horizon
    var yc = r_equator / Math.tan(latitude);
    var rh = r_equator / Math.sin(latitude);
    //circle(g, 0, yc, rh, "horizon"); //This would draw the whole horizon

    Almucantar(0); //Horizon
    Almucantar(10);
    Almucantar(20);
    Almucantar(30);
    Almucantar(40);
    Almucantar(50);
    Almucantar(60);
    Almucantar(70);
    Almucantar(80);
    Almucantar(90);

    //Draw Zenith as small circle
    var yz = r_equator * Math.tan((pi2 - latitude) / 2)
    circle(svg, 0, yz, 5, "zenith");
}

draw()
