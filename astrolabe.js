//Physical constants
var pi2      = Math.PI / 2.0; // 90 degrees
var pi4      = Math.PI / 4.0; // 45 degrees
var twopi    = 2 * Math.PI;
var threepi2 = 3 * Math.PI / 2.0;
var e        = 23.438446 * (Math.PI / 180);        //obliquity of the ecliptic (Year 2006)
var latitude = 34 * (Math.PI / 180);
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

function deg_to_rad(deg)
{
    return deg * (Math.PI / 180)
}

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
function Almucantar(a, elem)
{
    a_rad = deg_to_rad(a)
    tmp = r_equator / (Math.sin(latitude) + Math.sin(a_rad));
    ra = Math.cos(a_rad)     * tmp;
    ya = Math.cos(latitude)  * tmp;
    // svg.circle( size / 2 , CartesianToScreenY(ya), ra);
    circle(elem, 0, ya, ra, "almucantar");
}

//Draw azimuthal arc given degrees
function azimuthal_arc(a, elem)
{
    a = deg_to_rad(a)
    yz =  r_equator * Math.tan((pi2 - latitude)/2)
    yn = -r_equator * Math.tan((pi2 + latitude)/2)
    yc = (yz + yn) / 2
    yaz = yz - yc
    xa = yaz * Math.tan(a)
    ra = yaz / Math.cos(a)
    circle(elem, xa, yc, ra, "azimuthal")
    circle(elem, -xa, yc, ra, "azimuthal")
    console.log("" + xa + "," + ya + " " + ra)
}

//Draw whole astrolabe
function draw()
{
    var svg = d3.select("body")
       .append("svg:svg")
        .attr("class", "vis")
        .attr("width", size)
        .attr("height", size)
       //Use cartesian coordinates
       //(0,0) represents the north celestial pole.
       .append("g").attr("transform", "translate (" + hsize + "," + hsize + ") scale(1,-1)" )
    //    .attr("width", r_capricorn * 1.2)
    //    .attr("height", r_capricorn * 1.2);


    //Draw Equators and tropics
    circle(svg, 0, 0, r_capricorn, "tropic").attr("id","capricorn")
    circle(svg, 0, 0, r_equator, "tropic").attr("id","equator")
    circle(svg, 0, 0, r_cancer, "tropic").attr("id","cancer")

    //Clip most elements to tropic of capricorn
    circle(svg.append("clipPath").attr("id", "clip_capricorn"), 0, 0, r_capricorn, "tropic")
    g= svg.append("g").attr("clip-path", "url(#clip_capricorn)")

    for (var angle = 0; angle <= 90; angle += 10){
        Almucantar(angle, g); //Horizon if angle == 0
    }

    for (var angle = 0; angle <= 90; angle += 10){
        azimuthal_arc(angle, g);
    }

    //Draw Zenith as small circle
    var yz = r_equator * Math.tan((pi2 - latitude) / 2)
    circle(svg, 0, yz, 5, "zenith");
}

draw()
